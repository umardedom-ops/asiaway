import { APARTMENTS, BRAND } from "../src/lib/seed-data.ts";

const q = (s: string | null | undefined) =>
  s == null ? "NULL" : `'${String(s).replace(/'/g, "''")}'`;
const arr = (a: string[]) => `ARRAY[${a.map((x) => `'${x.replace(/'/g, "''")}'`).join(",")}]::text[]`;

const rows = APARTMENTS.map((a) => {
  const cover = a.cover_image && a.cover_image.trim() ? q(a.cover_image) : "NULL";
  return `('${a.id}', ${q(a.title)}, ${q(a.description)}, ${q(a.view)}, ${q(a.bed_config)}, ${q(BRAND.address)}, 'Tashkent City', ${a.price_per_day}, ${a.price_per_month}, ${a.deposit_amount}, ${a.area_m2}, ${a.rooms}, ${a.floor}, ${a.max_guests}, ${arr(a.amenities as unknown as string[])}, ${cover}, 'active')`;
});

console.log(
  `INSERT INTO apartments (id, title, description, view, bed_config, address, district, price_per_day, price_per_month, deposit_amount, area_m2, rooms, floor, max_guests, amenities, cover_image, status) VALUES\n${rows.join(",\n")}\nON CONFLICT (id) DO NOTHING;`
);
