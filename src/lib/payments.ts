// Payme / Click to'lov yordamchilari.
// Env kalitlar YO'Q bo'lsa tizim "simulate" rejimда ishlaydi (hozirgidek darhol tasdiq).
// Real rejim uchun kerakli env'lar (Vercel + .env.local):
//   PAYME_MERCHANT_ID, PAYME_KEY  (Payme merchant kabinetidan)
//   CLICK_SERVICE_ID, CLICK_MERCHANT_ID, CLICK_SECRET_KEY, CLICK_MERCHANT_USER_ID
//   PAYMENT_USD_RATE  (1 USD necha so'm, masalan 12500) — narxlar USD'da saqlanadi
//   NEXT_PUBLIC_SITE_URL (masalan https://asiaway.vercel.app)

export type PaymentMethod = "payme" | "click";

export function usdToTiyin(usd: number): number {
  const rate = Number(process.env.PAYMENT_USD_RATE || 12500);
  // so'm = usd * rate; tiyin = so'm * 100
  return Math.round(usd * rate * 100);
}

export function paymeConfigured(): boolean {
  return Boolean(process.env.PAYME_MERCHANT_ID && process.env.PAYME_KEY);
}

export function clickConfigured(): boolean {
  return Boolean(
    process.env.CLICK_SERVICE_ID &&
      process.env.CLICK_MERCHANT_ID &&
      process.env.CLICK_SECRET_KEY
  );
}

export function paymentConfigured(method: PaymentMethod): boolean {
  return method === "payme" ? paymeConfigured() : clickConfigured();
}

/**
 * Payme checkout havolasi (GET):
 * https://checkout.paycom.uz/<base64(m=MERCHANT;ac.booking_id=<id>;a=<tiyin>)>
 */
export function buildPaymeUrl(bookingId: string, amountTiyin: number): string {
  const params = `m=${process.env.PAYME_MERCHANT_ID};ac.booking_id=${bookingId};a=${amountTiyin}`;
  const encoded = Buffer.from(params).toString("base64");
  return `https://checkout.paycom.uz/${encoded}`;
}

/**
 * Click checkout havolasi (merchant redirect):
 * transaction_param = booking_id (webhook'da qaytadi)
 */
export function buildClickUrl(bookingId: string, amountTiyin: number): string {
  const amountSum = (amountTiyin / 100).toFixed(2); // Click so'mda qabul qiladi
  const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://asiaway.vercel.app"}/?payment=done`;
  const q = new URLSearchParams({
    service_id: process.env.CLICK_SERVICE_ID || "",
    merchant_id: process.env.CLICK_MERCHANT_ID || "",
    amount: amountSum,
    transaction_param: bookingId,
    return_url: returnUrl,
  });
  return `https://my.click.uz/services/pay?${q.toString()}`;
}

export function buildCheckoutUrl(
  method: PaymentMethod,
  bookingId: string,
  amountUsd: number
): string | null {
  if (!paymentConfigured(method)) return null;
  const tiyin = usdToTiyin(amountUsd);
  return method === "payme"
    ? buildPaymeUrl(bookingId, tiyin)
    : buildClickUrl(bookingId, tiyin);
}
