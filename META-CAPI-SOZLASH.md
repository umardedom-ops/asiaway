# Meta CAPI sozlash — Umar uchun yo'riqnoma

Kod tayyor. Faqat 2 ta env qo'yilsa ishlaydi. Env yo'q bo'lsa hech narsa buzilmaydi — jim o'tkazib yuboradi.

## 1. Pixel yaratish (bo'lmasa)
1. business.facebook.com → **Events Manager** → **Data Sources** → yashil **+ Connect Data Sources** → **Web** → **Get Started**.
2. Nom: `ASIA WAY` → sayt: `asiaway.uz`.
3. Yaratilgach yuqorida **Dataset ID (Pixel ID)** ko'rinadi — raqamlarni nusxalab oling.

## 2. CAPI Access Token olish
1. Events Manager → ASIA WAY pixelni tanlang → **Settings** (sozlamalar) bo'limi.
2. Pastga tushing: **Conversions API** → **Generate access token** → tokenni nusxalang.
   (Token faqat BIR marta ko'rsatiladi — darhol saqlang.)

## 3. Vercel'ga qo'shish
Vercel → asiaway loyihasi → **Settings → Environment Variables**:

| Nomi | Qiymati |
|---|---|
| `META_PIXEL_ID` | 1-bosqichdagi raqam |
| `META_CAPI_ACCESS_TOKEN` | 2-bosqichdagi token |
| `META_TEST_EVENT_CODE` | (faqat sinov paytida) Events Manager → Test events'dagi `TEST12345` kod |

Keyin **Redeploy** bosing.

## 4. Tekshirish
Brauzerda oching (CRON_SECRET — Vercel env'dagi):
```
https://asiaway.uz/api/meta/test?secret=CRON_SECRET_QIYMATI&send=1
```
Javobda `"sent": true` chiqsa — Events Manager → **Test events** bo'limida
"Purchase" ko'rinadi. Ishlagach `META_TEST_EVENT_CODE`ni O'CHIRIB yana redeploy
qiling — endi eventlar haqiqiy statistikaga tushadi.

## Nima yuboriladi
- **Purchase** — bron tasdiqlanganda (qo'lda, sayt, Payme, Click — barcha yo'llar).
  Qiymat: bron summasi, USD. Ikki marta yuborilmaydi (`capi_sent_at` + `event_id`).
- **Lead** — har yangi murojaat (sayt formasi, CRM qo'lda, Instagram bot).
- Telefon/email/ism **SHA-256 xeshlangan** holda ketadi (Meta talabi) + reklamadan
  kelganlar uchun `fbclid`/`_fbp` cookie'lari — reklama bilan aniq bog'lanadi.
