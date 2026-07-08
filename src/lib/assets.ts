// Supabase Storage — barcha rasmlar (webp, siqilgan) shu yerda.
// Public bucket: assets
export const ASSETS =
  "https://hiofixthnnowewdqynxb.supabase.co/storage/v1/object/public/assets";

export const img = (path: string) => `${ASSETS}/${path}`;
