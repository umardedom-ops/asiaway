// Bazadagi base64 rasmlarni Supabase Storage'ga ko'chirish.
//
// Admin paneldan yuklangan rasmlar Storage o'rniga `data:image/...;base64`
// satri bo'lib bazaga yozilgan (sababi va tuzatish: acb302c). Bu skript
// ularni "apartments" bucketiga yuklab, satr o'rniga ommaviy manzilni yozadi.
//
// Ishga tushirish (makon/ ichida):
//   node --env-file=.env.local scripts/rasmlarni-kochirish.mjs          # SINOV: hech narsa yozmaydi
//   node --env-file=.env.local scripts/rasmlarni-kochirish.mjs --yoz    # haqiqiy ko'chirish
//
// --yoz dan OLDIN: Supabase'dan zaxira (backup) olinsin.
//
// Qayta ishga tushirish xavfsiz: `https://` bo'lgan qiymat o'tkazib yuboriladi.
// /api/rasm/<kalit>.jpg route qoladi — eski havolalar 308 bilan yangi
// manzilga yo'naltiriladi.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env kerak (.env.local)");
  process.exit(1);
}
const svc = createClient(url, key, { auth: { persistSession: false } });
const YOZ = process.argv.includes("--yoz");
const BUCKET = "apartments";
const DATA_RE = /^data:(image\/([a-z0-9.+-]+));base64,([\s\S]+)$/i;

const isData = (v) => typeof v === "string" && v.startsWith("data:image/");

function ajrat(v) {
  const m = DATA_RE.exec(v);
  if (!m) return null;
  const ext = m[2].toLowerCase() === "jpeg" ? "jpg" : m[2].toLowerCase().replace(/[^a-z0-9]/g, "");
  return { mime: m[1], ext, baytlar: Buffer.from(m[3], "base64") };
}

async function yukla(yol, v) {
  const r = ajrat(v);
  if (!r) throw new Error(`data: satri o'qilmadi (${yol})`);
  const fayl = `${yol}.${r.ext}`;
  const { error } = await svc.storage
    .from(BUCKET)
    .upload(fayl, r.baytlar, { contentType: r.mime, upsert: true });
  if (error) throw new Error(`${fayl}: ${error.message}`);
  return svc.storage.from(BUCKET).getPublicUrl(fayl).data.publicUrl;
}

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

async function main() {
  console.log(YOZ ? "REJIM: --yoz (bazaga yoziladi)\n" : "REJIM: sinov (hech narsa yozilmaydi)\n");

  // `images` ustuni hamma muhitda bo'lmasligi mumkin
  let { data: apts, error } = await svc.from("apartments").select("id, cover_image, images");
  if (error) {
    ({ data: apts, error } = await svc.from("apartments").select("id, cover_image"));
  }
  if (error) throw error;

  const { data: imgs, error: imgErr } = await svc.from("apartment_images").select("id, url");
  if (imgErr) throw imgErr;

  // Bir xil base64 bir marta yuklanadi
  const yuklangan = new Map();
  const ishlar = [];
  let jamiHajm = 0;

  for (const a of apts) {
    if (isData(a.cover_image)) ishlar.push({ jadval: "apartments.cover_image", id: a.id, v: a.cover_image, yol: `migrated/cover-${a.id}` });
    if (Array.isArray(a.images)) {
      a.images.forEach((v, n) => {
        if (isData(v)) ishlar.push({ jadval: "apartments.images", id: a.id, n, v, yol: `migrated/images-${a.id}-${n}` });
      });
    }
  }
  for (const r of imgs) {
    if (isData(r.url)) ishlar.push({ jadval: "apartment_images.url", id: r.id, v: r.url, yol: `migrated/img-${r.id}` });
  }

  const boyicha = {};
  for (const i of ishlar) {
    jamiHajm += i.v.length;
    boyicha[i.jadval] = (boyicha[i.jadval] || 0) + 1;
  }
  console.log(`Topildi: ${ishlar.length} ta base64 rasm, jami ${kb(jamiHajm)} matn`);
  for (const [j, n] of Object.entries(boyicha)) console.log(`  ${j.padEnd(24)} ${n}`);
  console.log(`  (${apts.length} apartament, ${imgs.length} galereya qatori ko'rildi)\n`);

  if (!YOZ) {
    for (const i of ishlar.slice(0, 15)) {
      console.log(`  ${i.jadval.padEnd(24)} ${i.id}${i.n !== undefined ? `[${i.n}]` : ""}  ${kb(i.v.length)}`);
    }
    if (ishlar.length > 15) console.log(`  ... va yana ${ishlar.length - 15} ta`);
    console.log("\nHech narsa yozilmadi. Zaxira olingach: --yoz");
    return;
  }

  const imagesYangi = new Map(); // apartment id -> images[] nusxasi
  let tayyor = 0;
  for (const i of ishlar) {
    const manzil = yuklangan.get(i.v) ?? (await yukla(i.yol, i.v));
    yuklangan.set(i.v, manzil);

    if (i.jadval === "apartments.cover_image") {
      const { error: e } = await svc.from("apartments").update({ cover_image: manzil }).eq("id", i.id);
      if (e) throw e;
    } else if (i.jadval === "apartment_images.url") {
      const { error: e } = await svc.from("apartment_images").update({ url: manzil }).eq("id", i.id);
      if (e) throw e;
    } else {
      const a = apts.find((x) => x.id === i.id);
      const arr = imagesYangi.get(i.id) ?? [...a.images];
      arr[i.n] = manzil;
      imagesYangi.set(i.id, arr);
    }
    tayyor++;
    console.log(`  [${tayyor}/${ishlar.length}] ${i.jadval} ${i.id} -> ${manzil}`);
  }
  for (const [id, arr] of imagesYangi) {
    const { error: e } = await svc.from("apartments").update({ images: arr }).eq("id", id);
    if (e) throw e;
  }
  console.log(`\nTayyor: ${tayyor} ta rasm ko'chirildi (${yuklangan.size} ta noyob fayl).`);
}

main().catch((e) => {
  console.error("XATO:", e.message || e);
  process.exit(1);
});
