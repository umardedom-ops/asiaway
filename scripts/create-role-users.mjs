// 4 rol uchun Supabase Auth userlarini yaratish (service-role bilan).
// Ishga tushirish (makon/ ichida):
//   node --env-file=.env.local scripts/create-role-users.mjs
// Natija: konsolda login/parollar + scripts/access-card-data.json (gitignored).
// Parol faqat YANGI yaratilganda chiqadi; mavjud userga parol qayta o'rnatiladi
// faqat --reset flagi bilan: node --env-file=.env.local scripts/create-role-users.mjs --reset

import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";
import crypto from "crypto";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env kerak (.env.local)");
  process.exit(1);
}
const svc = createClient(url, key);
const RESET = process.argv.includes("--reset");

const ROLES = [
  { role: "shef", email: "shef@asiaway.uz", label: "Shef (to'liq dostup)" },
  { role: "menejer", email: "menejer@asiaway.uz", label: "Menejer (bron/CRM/mehmonlar)" },
  { role: "finansist", email: "finansist@asiaway.uz", label: "Finansist (moliya/kassa)" },
  { role: "targetolog", email: "targetolog@asiaway.uz", label: "Targetolog (CRM/bronlar/mijozlar)" },
];

// O'qish oson, yetarlicha kuchli parol: AW-<Rol>-XXXXXX
function genPassword(role) {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let tail = "";
  const bytes = crypto.randomBytes(8);
  for (const b of bytes) tail += alphabet[b % alphabet.length];
  return `AW-${role[0].toUpperCase()}${role.slice(1)}-${tail}`;
}

async function findUserByEmail(email) {
  // listUsers sahifalab qidiramiz (kichik loyiha — 1-2 sahifa yetadi)
  for (let page = 1; page <= 5; page++) {
    const { data, error } = await svc.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === email);
    if (hit) return hit;
    if (data.users.length < 100) break;
  }
  return null;
}

const results = [];
for (const r of ROLES) {
  const existing = await findUserByEmail(r.email);
  let userId;
  let password = null;

  if (existing) {
    userId = existing.id;
    if (RESET) {
      password = genPassword(r.role);
      const { error } = await svc.auth.admin.updateUserById(userId, { password });
      if (error) { console.error(`${r.email}: parol reset xato — ${error.message}`); password = null; }
    }
    console.log(`= ${r.email} mavjud${password ? " (parol YANGILANDI)" : ""}`);
  } else {
    password = genPassword(r.role);
    const { data, error } = await svc.auth.admin.createUser({
      email: r.email,
      password,
      email_confirm: true,
    });
    if (error) { console.error(`${r.email}: yaratish xato — ${error.message}`); continue; }
    userId = data.user.id;
    console.log(`+ ${r.email} yaratildi`);
  }

  // profiles.role — upsert (rol berish faqat service-role orqali, RLS C2 fix)
  const { error: pErr } = await svc.from("profiles").upsert({ id: userId, role: r.role });
  if (pErr) console.error(`${r.email}: profiles xato — ${pErr.message}`);

  results.push({ role: r.role, label: r.label, email: r.email, password });
}

console.log("\n===== NATIJA =====");
for (const r of results) {
  console.log(`${r.label}\n  Login:  ${r.email}\n  Parol:  ${r.password || "(o'zgartirilmadi — mavjud parol amal qiladi)"}\n`);
}

writeFileSync(new URL("./access-card-data.json", import.meta.url), JSON.stringify(results, null, 2));
console.log("Saqlandi: scripts/access-card-data.json (gitga TUSHMAYDI)");
