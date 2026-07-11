/* ============================================================
   AsiaWay — i18n (UZ / RU / EN)
   Butun statik matn shu yerda 3 tilda. Apartament tavsiflari
   pastda APARTMENT_TR da (id bo'yicha).
   ============================================================ */

export type Lang = "uz" | "ru" | "en";

export const LANGS: { code: Lang; label: string }[] = [
  { code: "uz", label: "UZ" },
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
];

interface Dict {
  nav: { about: string; services: string; apartments: string; reviews: string; faq: string; contact: string; book: string };
  hero: { badge: string; titleTop: string; titleMid: string; titleAccent: string; subtitle: string; ctaPrimary: string; ctaContact: string };
  about: { kicker: string; title: string; body: string };
  services: { kicker: string; title: string; items: string[] };
  catalog: { kicker: string; title: string; total: (n: number) => string };
  experience: { kicker: string; title: string; body: string; cta: string };
  reviews: { kicker: string; title: string; items: { name: string; role: string; text: string }[] };
  faq: { kicker: string; title: string; items: { q: string; a: string }[] };
  contact: {
    kicker: string; title: string; body: string;
    name: string; phone: string; whatsapp: string; telegram: string; email: string; message: string;
    submit: string; sending: string; success: string; successBody: string; error: string; required: string; optional: string;
  };
  footer: { title: string; body: string; links: string; social: string; phonesLabel: string; addressLabel: string; rights: string; city: string };
  floating: { label: string; call: string; whatsapp: string; telegram: string; instagram: string };
  card: { perNight: string; details: string; book: string; rooms: string; floor: string; area: string; guests: string; from: string; noResults: string };
  filters: { search: string; filters: string; rooms: string; price: string; floor: string; all: string; r1: string; r2: string; r3: string; pLow: string; pMid: string; pHigh: string; fLow: string; fMid: string; fHigh: string };
}

export const T: Record<Lang, Dict> = {
  uz: {
    nav: { about: "Biz haqimizda", services: "Xizmatlar", apartments: "Apartamentlar", reviews: "Mijozlar fikri", faq: "Savol-javob", contact: "Bog'lanish", book: "Band qilish" },
    hero: {
      badge: "TOSHKENT MARKAZIDA · PREMIUM APARTAMENTLAR",
      titleTop: "Nest One.", titleMid: "Hayotning", titleAccent: "Yuqori Nuqtasi.",
      subtitle: "Toshkent markazidagi premium apartamentlar. Shaxsiy xizmat, mutlaq qulaylik va shaharning betakror manzarasi — barchasi bir manzilda.",
      ctaPrimary: "Apartamentlarni ko'rish", ctaContact: "Aloqaga chiqish",
    },
    about: { kicker: "AsiaWay HAQIDA", title: "10 Yillik Tajriba. Bitta Mukammal Xizmat.", body: "AsiaWay — Toshkentdagi premium apartamentlar va shaxsiy xizmatni yagona tizimda birlashtiradi. Aeroportda kutib olishdan tortib, kundalik qulayliklargacha — har bir detal sizning xotirjamligingiz uchun." },
    services: { kicker: "SHAXSIY XIZMAT", title: "Siz Faqat Yashaysiz. Qolganini Biz Hal Qilamiz.", items: ["Apartament ijarasi", "24/7 shaxsiy yordam", "Professional tozalash", "Transfer xizmati", "Sportiv zalga kirish", "Maxsus so'rovlar"] },
    catalog: { kicker: "APARTAMENTLAR", title: "O'zingizga Mos Makonni Tanlang.", total: (n) => `Jami: ${n} ta faol ijara obyekti` },
    experience: { kicker: "34-qavat · Balandlikdagi hayot", title: "Shahar oyoqlaringiz ostida.", body: "Har tong bulutlar sathida uyg'oning — panoramik oynalar ortida butun Toshkent. 34-qavatdan ochilgan manzara, jimjitlik va mukammal qulaylik. AsiaWay — bu shunchaki apartament emas, bu balandlikdagi premium hayot. Bir marta yuqoriga ko'tarilgach, pastga tushishni istamaysiz.", cta: "Balandlikni band qiling" },
    reviews: {
      kicker: "MIJOZLAR FIKRI", title: "Bizga Ishonganlar Nima Deydi",
      items: [
        { name: "Aziz R.", role: "Toshkent", text: "Xizmat a'lo darajada. Aeroportda kutib olishdi, kvartira suratlardagidek toza va zamonaviy edi. Yana albatta qaytaman." },
        { name: "Дмитрий К.", role: "Moskva", text: "Shahar markazidagi ajoyib apartament. Hammasi aniq va tez, 24/7 qo'llab-quvvatlash haqiqatan ishlaydi." },
        { name: "Sarah M.", role: "London", text: "Manzara maftunkor, xizmat benuqson. Toshkentga kelsangiz — AsiaWay'ni tavsiya qilaman." },
      ],
    },
    faq: {
      kicker: "SAVOL-JAVOB", title: "Ko'p Beriladigan Savollar",
      items: [
        { q: "Bron qanday amalga oshiriladi?", a: "Saytdan sanani tanlaysiz, ma'lumotlaringizni kiritasiz va zaklatni online to'laysiz — bron darhol tasdiqlanadi." },
        { q: "Aeroport transferi bepulmi?", a: "Ha, har bir mehmon uchun aeroport yoki vokzaldan bepul kutib olish va kuzatib qo'yish xizmati kiritilgan." },
        { q: "Zaklat (depozit) qaytariladimi?", a: "Ha. Chiqishda hech qanday zarar bo'lmasa, depozit summasi to'liq qaytariladi." },
        { q: "Check-in va check-out vaqtlari qanday?", a: "Check-in 14:00 dan, check-out 12:00 gacha. Moslashuvchan vaqt uchun menejerimiz bilan bog'laning." },
        { q: "To'lov qanday usullarda amalga oshiriladi?", a: "Payme, Click va plastik kartalar orqali xavfsiz online to'lov." },
        { q: "Uzoq muddatli (oylik) ijara bormi?", a: "Ha, oylik ijara ham mavjud. Narx va shartlar uchun biz bilan bog'laning." },
      ],
    },
    contact: {
      kicker: "ALOQAGA CHIQISH", title: "Sizga Qayta Aloqaga Chiqamiz",
      body: "Ma'lumotlaringizni qoldiring — menejerimiz qulay vaqtda bog'lanib, barcha savollaringizga javob beradi.",
      name: "Ismingiz", phone: "Telefon raqam", whatsapp: "WhatsApp raqami", telegram: "Telegram username", email: "Elektron pochta", message: "Xabar (ixtiyoriy)",
      submit: "So'rov yuborish", sending: "Yuborilmoqda...", success: "Rahmat! So'rovingiz qabul qilindi.", successBody: "Menejerimiz tez orada siz bilan bog'lanadi.", error: "Xatolik yuz berdi. Qayta urinib ko'ring.", required: "majburiy", optional: "ixtiyoriy",
    },
    footer: { title: "Biz Bilan Bog'laning", body: "Eksklyuziv so'rovlar yoki uzoq muddatli rezidensiya uchun bizning menejerlarimiz bilan bog'laning.", links: "Havolalar", social: "Ijtimoiy Tarmoqlar", phonesLabel: "Telefonlar", addressLabel: "Manzil", rights: "Barcha huquqlar himoyalangan.", city: "Toshkent, O'zbekiston" },
    floating: { label: "Tezkor bog'lanish", call: "Qo'ng'iroq", whatsapp: "WhatsApp", telegram: "Telegram", instagram: "Instagram" },
    card: { perNight: "/ tun", details: "Batafsil", book: "Band qilish", rooms: "xona", floor: "qavat", area: "maydon", guests: "mehmon", from: "dan", noResults: "Filtr bo'yicha apartament topilmadi." },
    filters: { search: "Qidirish... (pentxaus, park manzarasi, 34-qavat)", filters: "Filtrlar", rooms: "Xonalar soni", price: "Narx oralig'i", floor: "Qavat balandligi", all: "Barchasi", r1: "1 xonali", r2: "2 xonali", r3: "3+ xonali", pLow: "Hamyonbop ($120 gacha)", pMid: "O'rtacha ($120–145)", pHigh: "Premium ($145+)", fLow: "Pastki (1–9)", fMid: "O'rta (10–25)", fHigh: "Yuqori (25+)" },
  },

  ru: {
    nav: { about: "О нас", services: "Услуги", apartments: "Апартаменты", reviews: "Отзывы", faq: "Вопросы", contact: "Контакты", book: "Забронировать" },
    hero: {
      badge: "В ЦЕНТРЕ ТАШКЕНТА · ПРЕМИУМ АПАРТАМЕНТЫ",
      titleTop: "Nest One.", titleMid: "Высшая", titleAccent: "Точка Жизни.",
      subtitle: "Премиальные апартаменты в центре Ташкента. Персональный сервис, абсолютный комфорт и неповторимый вид на город — всё в одном месте.",
      ctaPrimary: "Смотреть апартаменты", ctaContact: "Связаться с нами",
    },
    about: { kicker: "О КОМПАНИИ AsiaWay", title: "10 Лет Опыта. Один Безупречный Сервис.", body: "AsiaWay объединяет премиальные апартаменты Ташкента и персональный сервис в единую систему. От встречи в аэропорту до ежедневного комфорта — каждая деталь ради вашего спокойствия." },
    services: { kicker: "ПЕРСОНАЛЬНЫЙ СЕРВИС", title: "Вы Просто Живёте. Остальное — Наша Забота.", items: ["Аренда апартаментов", "Личная поддержка 24/7", "Профессиональная уборка", "Трансфер", "Доступ в спортзал", "Особые пожелания"] },
    catalog: { kicker: "АПАРТАМЕНТЫ", title: "Выберите Своё Пространство.", total: (n) => `Всего: ${n} доступных объектов` },
    experience: { kicker: "34 этаж · Жизнь на высоте", title: "Город у ваших ног.", body: "Каждое утро — на уровне облаков: за панорамными окнами весь Ташкент. Вид с 34 этажа, тишина и абсолютный комфорт. AsiaWay — это не просто апартаменты, это премиальная жизнь на высоте. Однажды поднявшись, вы не захотите спускаться.", cta: "Забронировать высоту" },
    reviews: {
      kicker: "ОТЗЫВЫ КЛИЕНТОВ", title: "Что Говорят Те, Кто Нам Доверился",
      items: [
        { name: "Aziz R.", role: "Ташкент", text: "Сервис на высшем уровне. Встретили в аэропорту, квартира чистая и современная, как на фото. Обязательно вернусь." },
        { name: "Дмитрий К.", role: "Москва", text: "Отличные апартаменты в центре. Всё чётко и быстро, поддержка 24/7 реально работает." },
        { name: "Sarah M.", role: "Лондон", text: "Захватывающий вид и безупречный сервис. Рекомендую AsiaWay для поездок в Ташкент." },
      ],
    },
    faq: {
      kicker: "ВОПРОСЫ И ОТВЕТЫ", title: "Часто Задаваемые Вопросы",
      items: [
        { q: "Как оформить бронирование?", a: "Выберите даты на сайте, укажите свои данные и оплатите депозит онлайн — бронь подтверждается сразу." },
        { q: "Трансфер из аэропорта бесплатный?", a: "Да, для каждого гостя включена бесплатная встреча и проводы из аэропорта или вокзала." },
        { q: "Возвращается ли депозит?", a: "Да. Если при выезде нет повреждений, сумма депозита возвращается полностью." },
        { q: "Время заезда и выезда?", a: "Заезд с 14:00, выезд до 12:00. Для гибкого времени свяжитесь с нашим менеджером." },
        { q: "Какие способы оплаты?", a: "Безопасная онлайн-оплата через Payme, Click и банковские карты." },
        { q: "Есть ли долгосрочная (помесячная) аренда?", a: "Да, помесячная аренда доступна. Свяжитесь с нами для цен и условий." },
      ],
    },
    contact: {
      kicker: "СВЯЗАТЬСЯ С НАМИ", title: "Мы Перезвоним Вам",
      body: "Оставьте свои данные — наш менеджер свяжется в удобное время и ответит на все вопросы.",
      name: "Ваше имя", phone: "Номер телефона", whatsapp: "Номер WhatsApp", telegram: "Telegram username", email: "Электронная почта", message: "Сообщение (необязательно)",
      submit: "Отправить заявку", sending: "Отправка...", success: "Спасибо! Заявка принята.", successBody: "Наш менеджер скоро свяжется с вами.", error: "Произошла ошибка. Попробуйте снова.", required: "обязательно", optional: "необязательно",
    },
    footer: { title: "Свяжитесь с Нами", body: "По эксклюзивным запросам или долгосрочной резиденции свяжитесь с нашими менеджерами.", links: "Ссылки", social: "Соцсети", phonesLabel: "Телефоны", addressLabel: "Адрес", rights: "Все права защищены.", city: "Ташкент, Узбекистан" },
    floating: { label: "Быстрая связь", call: "Позвонить", whatsapp: "WhatsApp", telegram: "Telegram", instagram: "Instagram" },
    card: { perNight: "/ ночь", details: "Подробнее", book: "Забронировать", rooms: "комнат", floor: "этаж", area: "площадь", guests: "гостей", from: "от", noResults: "По фильтру апартаменты не найдены." },
    filters: { search: "Поиск... (пентхаус, вид на парк, 34 этаж)", filters: "Фильтры", rooms: "Комнаты", price: "Диапазон цен", floor: "Этажность", all: "Все", r1: "1 комната", r2: "2 комнаты", r3: "3+ комнат", pLow: "Бюджет (до $120)", pMid: "Средний ($120–145)", pHigh: "Премиум ($145+)", fLow: "Нижние (1–9)", fMid: "Средние (10–25)", fHigh: "Верхние (25+)" },
  },

  en: {
    nav: { about: "About", services: "Services", apartments: "Apartments", reviews: "Reviews", faq: "FAQ", contact: "Contact", book: "Book now" },
    hero: {
      badge: "IN THE HEART OF TASHKENT · PREMIUM APARTMENTS",
      titleTop: "Nest One.", titleMid: "The Peak", titleAccent: "Of Living.",
      subtitle: "Premium apartments in central Tashkent. Personal service, absolute comfort and unmatched city views — all in one place.",
      ctaPrimary: "View apartments", ctaContact: "Get in touch",
    },
    about: { kicker: "ABOUT AsiaWay", title: "10 Years of Experience. One Flawless Service.", body: "AsiaWay brings together Tashkent's premium apartments and personal service in a single system. From airport pickup to daily comfort — every detail is for your peace of mind." },
    services: { kicker: "PERSONAL SERVICE", title: "You Just Live. We Handle the Rest.", items: ["Apartment rental", "24/7 personal support", "Professional cleaning", "Transfer service", "Gym access", "Special requests"] },
    catalog: { kicker: "APARTMENTS", title: "Choose Your Space.", total: (n) => `Total: ${n} available listings` },
    experience: { kicker: "34th floor · Life at height", title: "The city at your feet.", body: "Wake each morning at cloud level — all of Tashkent beyond your panoramic windows. The view from the 34th floor, silence, and absolute comfort. AsiaWay isn't just an apartment — it's premium life at height. Once you rise, you'll never want to come down.", cta: "Book the height" },
    reviews: {
      kicker: "CLIENT REVIEWS", title: "What Those Who Trusted Us Say",
      items: [
        { name: "Aziz R.", role: "Tashkent", text: "Excellent service. They met me at the airport, the apartment was clean and modern just like the photos. I'll definitely return." },
        { name: "Dmitry K.", role: "Moscow", text: "Great apartment in the center. Everything smooth and fast, the 24/7 support really works." },
        { name: "Sarah M.", role: "London", text: "Stunning views and flawless service. Highly recommend AsiaWay for stays in Tashkent." },
      ],
    },
    faq: {
      kicker: "Q & A", title: "Frequently Asked Questions",
      items: [
        { q: "How does booking work?", a: "Pick your dates on the site, enter your details and pay the deposit online — your booking is confirmed instantly." },
        { q: "Is the airport transfer free?", a: "Yes, free airport or station pickup and drop-off is included for every guest." },
        { q: "Is the deposit refundable?", a: "Yes. If there is no damage at checkout, the full deposit is refunded." },
        { q: "What are the check-in and check-out times?", a: "Check-in from 2:00 PM, check-out by 12:00 PM. Contact our manager for flexible timing." },
        { q: "What payment methods are available?", a: "Secure online payment via Payme, Click and bank cards." },
        { q: "Do you offer long-term (monthly) rental?", a: "Yes, monthly rental is available. Contact us for prices and terms." },
      ],
    },
    contact: {
      kicker: "GET IN TOUCH", title: "We'll Call You Back",
      body: "Leave your details — our manager will reach out at a convenient time and answer all your questions.",
      name: "Your name", phone: "Phone number", whatsapp: "WhatsApp number", telegram: "Telegram username", email: "Email", message: "Message (optional)",
      submit: "Send request", sending: "Sending...", success: "Thank you! Request received.", successBody: "Our manager will contact you shortly.", error: "Something went wrong. Please try again.", required: "required", optional: "optional",
    },
    footer: { title: "Get in Touch", body: "For exclusive requests or long-term residency, contact our managers.", links: "Links", social: "Social", phonesLabel: "Phones", addressLabel: "Address", rights: "All rights reserved.", city: "Tashkent, Uzbekistan" },
    floating: { label: "Quick contact", call: "Call", whatsapp: "WhatsApp", telegram: "Telegram", instagram: "Instagram" },
    card: { perNight: "/ night", details: "Details", book: "Book now", rooms: "rooms", floor: "floor", area: "area", guests: "guests", from: "from", noResults: "No apartments match the filter." },
    filters: { search: "Search... (penthouse, park view, 34th floor)", filters: "Filters", rooms: "Rooms", price: "Price range", floor: "Floor height", all: "All", r1: "1 room", r2: "2 rooms", r3: "3+ rooms", pLow: "Budget (up to $120)", pMid: "Mid ($120–145)", pHigh: "Premium ($145+)", fLow: "Lower (1–9)", fMid: "Mid (10–25)", fHigh: "Upper (25+)" },
  },
};

/* Apartament (view + description) tarjimalari — id bo'yicha.
   Kalit: seed-data.ts dagi apartament id. DB'dan kelsa ham shu id ishlaydi. */
export const APARTMENT_TR: Record<string, { ru: { view: string; description: string }; en: { view: string; description: string } }> = {
  "34780000-0000-0000-0000-000000000000": {
    ru: { view: "Humo Arena, Magic City", description: "Вид на Humo Arena и Magic City с 34 этажа. Современный лаконичный интерьер, уютная атмосфера. Полностью оснащённая кухня, быстрый Wi-Fi. Роскошная жизнь в центре города." },
    en: { view: "Humo Arena, Magic City", description: "Views of Humo Arena and Magic City from the 34th floor. Modern minimalist interior, cozy atmosphere. Fully equipped kitchen, fast Wi-Fi. Luxury living in the city center." },
  },
  "29650000-0000-0000-0000-000000000000": {
    ru: { view: "Humo Arena, Magic City", description: "Вид на Humo Arena и Magic City с 29 этажа. 2 спальни, комфортно для 4 гостей. Современный интерьер, полностью оснащённая кухня." },
    en: { view: "Humo Arena, Magic City", description: "Views of Humo Arena and Magic City from the 29th floor. 2 bedrooms, comfortable for 4 guests. Modern interior, fully equipped kitchen." },
  },
  "22800000-0000-0000-0000-000000000000": {
    ru: { view: "Humo Arena, Magic City", description: "Вид на Humo Arena и Magic City с 22 этажа. Просторные 80 м² с двумя отдельными спальнями — одна с king-size, другая с двумя односпальными кроватями." },
    en: { view: "Humo Arena, Magic City", description: "Views of Humo Arena and Magic City from the 22nd floor. Spacious 80 m² with two separate bedrooms — one king-size, the other with two singles." },
  },
  "17450000-0000-0000-0000-000000000000": {
    ru: { view: "Ташкент Сити Парк", description: "Прекрасный вид на парк Ташкент Сити с 17 этажа. Идеально для пар — большая кровать king-size, уютная атмосфера. Полностью оснащённая кухня." },
    en: { view: "Tashkent City Park", description: "Beautiful view of Tashkent City Park from the 17th floor. Ideal for couples — large king-size bed, cozy atmosphere. Fully equipped kitchen." },
  },
  "15800000-0000-0000-0000-000000000000": {
    ru: { view: "Ташкент Сити Парк", description: "Красивый вид на парк Ташкент Сити с 15 этажа. Идеально для семьи: 2 отдельные спальни, просторная гостиная. Комфортно до 4 гостей." },
    en: { view: "Tashkent City Park", description: "Lovely view of Tashkent City Park from the 15th floor. Ideal for families: 2 separate bedrooms, spacious living area. Comfortable for up to 4 guests." },
  },
  "11650000-0000-0000-0000-000000000000": {
    ru: { view: "Ташкент Сити Парк", description: "Красивый вид на парк Ташкент Сити с 11 этажа. 2 спальни, до 3 гостей. Уютный современный интерьер." },
    en: { view: "Tashkent City Park", description: "Lovely view of Tashkent City Park from the 11th floor. 2 bedrooms, up to 3 guests. Cozy modern interior." },
  },
  "10800000-0000-0000-0000-000000000000": {
    ru: { view: "Панорама города", description: "Панорама города с 10 этажа. Идеально для большой компании или семьи: 2 спальни с king-size + раскладной диван в гостиной. До 6 гостей." },
    en: { view: "City panorama", description: "City panorama from the 10th floor. Ideal for a large group or family: 2 king-size bedrooms + a sofa bed in the living room. Up to 6 guests." },
  },
  "10650000-0000-0000-0000-000000000000": {
    ru: { view: "Ташкент Сити Парк", description: "Вид на парк Ташкент Сити с 10 этажа. 2 спальни, до 3 гостей. Уютный современный интерьер с особым характером." },
    en: { view: "Tashkent City Park", description: "View of Tashkent City Park from the 10th floor. 2 bedrooms, up to 3 guests. Cozy modern interior with its own character." },
  },
  "02650000-0000-0000-0000-000000000000": {
    ru: { view: "Garden Park (внутренний двор)", description: "Тихий и спокойный вид на внутренний двор (Garden Park) со 2 этажа. Вдали от шума верхних этажей. 2 спальни, до 3 гостей." },
    en: { view: "Garden Park (courtyard)", description: "Quiet and calm courtyard (Garden Park) view from the 2nd floor. Away from the noise of upper floors. 2 bedrooms, up to 3 guests." },
  },
};

// Kontakt manzillari (BRAND'dan) — floating tugma va formada ishlatiladi
export const CONTACTS = {
  phone: "+998 77 380 33 30",
  phoneRaw: "998773803330",
  whatsapp: "https://wa.me/qr/P74D3ZR54TMDF1",
  telegram: "https://t.me/AsiaWay2025",
  telegramChannel: "https://t.me/nestoneapartment",
  instagram: "https://www.instagram.com/asiawayapartments/",
};
