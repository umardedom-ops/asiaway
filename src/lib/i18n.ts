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
  amenities: { wifi: string; smart_tv: string; kitchen: string; ac: string; washing_machine: string; panoramic_view: string; park_view: string; city_view: string; garden_view: string; coffee_maker: string; sofa_bed: string; jacuzzi: string; dishwasher: string; };
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
        { q: "Aeroport transferi bormi?", a: "Ha, kelishuvga ko'ra aeroport yoki vokzaldan shaxsiy transfer xizmati taqdim etiladi." },
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
    amenities: { wifi: "Tezkor Wi-Fi", smart_tv: "Smart TV", kitchen: "To'liq jihozlangan oshxona", ac: "Konditsioner", washing_machine: "Kir yuvish mashinasi", panoramic_view: "Panoramik manzara", park_view: "Park ko'rinishi", city_view: "Shahar ko'rinishi", garden_view: "Bog' ko'rinishi", coffee_maker: "Kofe mashinasi", sofa_bed: "Ochiladigan divan", jacuzzi: "Jakuzi", dishwasher: "Idish yuvish mashinasi" },
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
        { q: "Есть ли трансфер из аэропорта?", a: "Да, по запросу предоставляется услуга встречи и провода из аэропорта или вокзала." },
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
    amenities: { wifi: "Высокоскоростной Wi-Fi", smart_tv: "Smart TV", kitchen: "Полностью оборудованная кухня", ac: "Кондиционер", washing_machine: "Стиральная машина", panoramic_view: "Панорамный вид", park_view: "Вид на парк", city_view: "Вид на город", garden_view: "Вид на сад", coffee_maker: "Кофемашина", sofa_bed: "Раскладной диван", jacuzzi: "Джакузи", dishwasher: "Посудомоечная машина" },
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
        { q: "Is airport transfer available?", a: "Yes, private pickup and drop-off service from the airport or station is available upon request." },
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
    amenities: { wifi: "High-speed Wi-Fi", smart_tv: "Smart TV", kitchen: "Fully equipped kitchen", ac: "Air conditioning", washing_machine: "Washing machine", panoramic_view: "Panoramic view", park_view: "Park view", city_view: "City view", garden_view: "Garden view", coffee_maker: "Coffee maker", sofa_bed: "Sofa bed", jacuzzi: "Jacuzzi", dishwasher: "Dishwasher" },
  },
};

/* ============================================================
   Dashboard i18n — Sidebar, Sahifalar, Jadvallar, Formalar
   ============================================================ */
export interface DashboardDict {
  sidebar: { panel: string; reception: string; crm: string; apartments: string; kassa: string; finance: string; staff: string; logout: string; system: string; shef: string; menejer: string };
  home: { title: string; subtitle: string; vacant: string; occupied: string; total: string; guests: string; occupancy: string; ownerRent: string; paid: string; remaining: string; revenue: string; fromBookings: string; expense: string; rentCost: string; salary: string; otherExpense: string; profit: string; salesMinusExpense: string; ta: string };
  reception: { title: string; subtitle: string; tabs: { bookings: string; placement: string; rooms: string; guestsDb: string }; newBooking: string; guest: string; channel: string; room: string; dates: string; price: string; status: string; actions: string; noBookings: string; nights: string; deposit: string; staying: string; confirmed: string; completed: string; cancelled: string; pending: string; walkIn: string; walkInTitle: string; arrivingToday: string; guestsArrive: string; clickPlace: string; currentGuests: string; noGuests: string; arrived: string; leaves: string; action: string; roomStatus: string; busy: string; free: string; floor: string; noActiveApt: string; clientsDb: string; client: string; visits: string; totalSpent: string; noClients: string; autoAdded: string };
  funnel: { title: string; subtitle: string; waiting: string; stayingNow: string; left: string; empty: string };
  ownerPay: { title: string; subtitle: string; apartment: string; owner: string; payDay: string; amount: string; state: string; paidLabel: string; totalMonthly: string; noData: string; dayLabel: string };
  statCards: { booked: string; comingLater: string; arrivesToday: string; todayArrivals: string; stayingNow: string; living: string; checkedOut: string; finished: string };
  booking: { save: string; saving: string; guestName: string; guestPhone: string; selectApt: string; checkIn: string; checkOut: string; pricePerNight: string; totalPrice: string; depositAmount: string; channel: string; notes: string };
  channels: { direct: string; airbnb: string; booking: string; instagram: string; whatsapp: string; telegram: string; other: string };
  roles: { manager: string; cleaner: string; maintenance: string; driver: string; other: string };
  taskTypes: { cleaning: string; checkin: string; checkout: string; maintenance: string; shopping: string; other: string };
  taskStatus: { todo: string; in_progress: string; done: string; cancelled: string };
  staff: { title: string; subtitle: string; addStaff: string; tasks: string; name: string; role: string; phone: string; salary: string; active: string; noStaff: string; addTask: string; assignee: string; type: string; aptFor: string; deadline: string; description: string; taskList: string };
  kassa: { title: string; subtitle: string; income: string; expense: string; balance: string; date: string; category: string; amount: string; note: string; add: string };
  finance: { title: string; subtitle: string; period: string; totalRevenue: string; totalExpense: string; netProfit: string; category: string; amount: string; addExpense: string; deleteExpense: string };
  crm: { title: string; subtitle: string; name: string; phone: string; source: string; status: string; note: string; noLeads: string };
  apartments: { title: string; subtitle: string; addNew: string; edit: string; delete: string; confirmDelete: string; floor: string; area: string; price: string; rooms: string; guests: string; status: string; active: string; inactive: string };
  common: { save: string; cancel: string; delete: string; edit: string; add: string; close: string; search: string; filter: string; loading: string; noData: string; confirm: string; back: string; yes: string; no: string };
}

export const D: Record<Lang, DashboardDict> = {
  uz: {
    sidebar: { panel: "Boshqaruv paneli", reception: "Qabul (bron/joylash/xona)", crm: "CRM (Murojaatlar)", apartments: "Apartamentlar", kassa: "Kassa (kirim/chiqim)", finance: "Moliya (P&L)", staff: "Xodimlar", logout: "Chiqish", system: "Tizimda", shef: "Shef", menejer: "Menejer" },
    home: { title: "Boshqaruv paneli", subtitle: "Loyiha bo'yicha real vaqtdagi statistika va hisobotlar", vacant: "Bo'sh apartlar", occupied: "band", total: "jami", guests: "Hozir turgan mehmonlar", occupancy: "Bandlik", ownerRent: "Egalarga oylik (jami)", paid: "To'langan", remaining: "qolgan", revenue: "Oylik daromad (savdo)", fromBookings: "Bronlardan · olingani Kassada", expense: "Oylik xarajat (rasxod)", rentCost: "Apartlar tan narxi (arenda)", salary: "Ish haqi", otherExpense: "Boshqa xarajatlar", profit: "Oylik sof foyda", salesMinusExpense: "Savdo − rasxod", ta: "ta" },
    reception: { title: "Qabul", subtitle: "Bronlar, mehmon joylashtirish (walk-in) va xonalar bandligi — bitta joyda.", tabs: { bookings: "Bronlar", placement: "Joylashtirish", rooms: "Xonalar holati", guestsDb: "Mehmonlar bazasi" }, newBooking: "Qo'lda bron", guest: "Mehmon", channel: "Kanal", room: "Xona", dates: "Sanalar", price: "Narx", status: "Holat", actions: "Amallar", noBookings: "Bron yo'q.", nights: "kecha", deposit: "Zaklat", staying: "Turibdi", confirmed: "Tasdiqlangan", completed: "Yakunlangan", cancelled: "Bekor", pending: "Kutilmoqda", walkIn: "Walk-in", walkInTitle: "Walk-in — mehmonni hozir joylashtirish", arrivingToday: "Bugun keladi", guestsArrive: "ta mehmon keladi", clickPlace: "\"Bronlar\" tabidan \"Joylashtirish\" bosing.", currentGuests: "Hozir turgan mehmonlar", noGuests: "Hozir turgan mehmon yo'q.", arrived: "Keldi", leaves: "Ketadi", action: "Amal", roomStatus: "Xonalar holati", busy: "Band", free: "Bo'sh", floor: "qavat", noActiveApt: "Faol apartament yo'q.", clientsDb: "Mehmonlar bazasi", client: "Mijoz", visits: "Tashriflar", totalSpent: "Umumiy sarf", noClients: "Hali mehmon yo'q. Bron kiritilganda avtomat qo'shiladi.", autoAdded: "Bron kiritilganda avtomat qo'shiladi." },
    funnel: { title: "Mijozlar voronkasi", subtitle: "Kartani bosing — mehmonning cheki va hisob-kitobi chiqadi", waiting: "Kutilmoqda", stayingNow: "Hozir turibdi", left: "Chiqib ketdi", empty: "Bo'sh" },
    ownerPay: { title: "Egalarga to'lov", subtitle: "Apart egalariga bir oyda beriladigan pul — \"To'landi\" bosilsa Kassaga chiqim va Moliyaga tushadi.", apartment: "Apartament", owner: "Ega", payDay: "To'lov kuni", amount: "Summa", state: "Holat", paidLabel: "To'langan", totalMonthly: "jami oylik", noData: "Apartamentlarga tan narx / to'lov kuni kiritilmagan.", dayLabel: "sana" },
    statCards: { booked: "Bron qilganlar", comingLater: "Kelgusida keladi", arrivesToday: "Bugun keladi", todayArrivals: "Bugungi kelishlar", stayingNow: "Hozir turibdi", living: "Yashayotganlar", checkedOut: "Chiqib ketgan", finished: "Yakunlangan" },
    booking: { save: "Bronni saqlash", saving: "Saqlanmoqda...", guestName: "Mehmon ismi", guestPhone: "Telefon raqam", selectApt: "Apartamentni tanlang", checkIn: "Kirish sanasi", checkOut: "Chiqish sanasi", pricePerNight: "Kechalik narx", totalPrice: "Jami summa", depositAmount: "Zaklat summasi", channel: "Kanal", notes: "Izoh" },
    channels: { direct: "To'g'ridan-to'g'ri", airbnb: "Airbnb", booking: "Booking.com", instagram: "Instagram", whatsapp: "WhatsApp", telegram: "Telegram", other: "Boshqa" },
    roles: { manager: "Menejer", cleaner: "Tozalovchi", maintenance: "Ta'mirchi", driver: "Haydovchi", other: "Boshqa" },
    taskTypes: { cleaning: "Tozalash", checkin: "Kutib olish", checkout: "Kuzatish", maintenance: "Ta'mirlash", shopping: "Xarid", other: "Boshqa" },
    taskStatus: { todo: "Kutilmoqda", in_progress: "Jarayonda", done: "Bajarilgan", cancelled: "Bekor qilingan" },
    staff: { title: "Xodimlar", subtitle: "Jamoa a'zolari va vazifalar boshqaruvi", addStaff: "Xodim qo'shish", tasks: "Vazifalar", name: "Ism", role: "Lavozim", phone: "Telefon", salary: "Oylik maosh", active: "Faol", noStaff: "Hali xodim yo'q.", addTask: "Vazifa qo'shish", assignee: "Mas'ul", type: "Tur", aptFor: "Apartament", deadline: "Muddat", description: "Tavsif", taskList: "Vazifalar ro'yxati" },
    kassa: { title: "Kassa", subtitle: "Kirim va chiqimlar hisobi", income: "Kirim", expense: "Chiqim", balance: "Balans", date: "Sana", category: "Kategoriya", amount: "Summa", note: "Izoh", add: "Qo'shish" },
    finance: { title: "Moliya (P&L)", subtitle: "Oylik daromad va xarajatlar tahlili", period: "Davr", totalRevenue: "Jami daromad", totalExpense: "Jami xarajat", netProfit: "Sof foyda", category: "Kategoriya", amount: "Summa", addExpense: "Xarajat qo'shish", deleteExpense: "O'chirish" },
    crm: { title: "CRM (Murojaatlar)", subtitle: "Saytdan va boshqa kanallardan kelgan murojaatlar", name: "Ism", phone: "Telefon", source: "Manba", status: "Holat", note: "Izoh", noLeads: "Hali murojaat yo'q." },
    apartments: { title: "Apartamentlar", subtitle: "Barcha apartamentlar ro'yxati va boshqaruvi", addNew: "Yangi qo'shish", edit: "Tahrirlash", delete: "O'chirish", confirmDelete: "Rostdan o'chirilsinmi?", floor: "Qavat", area: "Maydon", price: "Narx", rooms: "Xonalar", guests: "Mehmonlar", status: "Holat", active: "Faol", inactive: "Nofaol" },
    common: { save: "Saqlash", cancel: "Bekor qilish", delete: "O'chirish", edit: "Tahrirlash", add: "Qo'shish", close: "Yopish", search: "Qidirish", filter: "Filtr", loading: "Yuklanmoqda...", noData: "Ma'lumot yo'q", confirm: "Tasdiqlash", back: "Ortga", yes: "Ha", no: "Yo'q" },
  },
  ru: {
    sidebar: { panel: "Панель управления", reception: "Ресепшн (бронь/заселение/номера)", crm: "CRM (Заявки)", apartments: "Апартаменты", kassa: "Касса (приход/расход)", finance: "Финансы (P&L)", staff: "Сотрудники", logout: "Выйти", system: "В системе", shef: "Шеф", menejer: "Менеджер" },
    home: { title: "Панель управления", subtitle: "Статистика и отчёты проекта в реальном времени", vacant: "Свободные апартаменты", occupied: "занято", total: "всего", guests: "Гости сейчас", occupancy: "Заполненность", ownerRent: "Аренда владельцам (итого)", paid: "Оплачено", remaining: "остаток", revenue: "Месячный доход (продажи)", fromBookings: "Из бронирований · получено в Кассе", expense: "Месячные расходы", rentCost: "Аренда апартаментов", salary: "Зарплаты", otherExpense: "Прочие расходы", profit: "Чистая прибыль (месяц)", salesMinusExpense: "Продажи − расходы", ta: "" },
    reception: { title: "Ресепшн", subtitle: "Бронирования, заселение (walk-in) и статус номеров — в одном месте.", tabs: { bookings: "Бронирования", placement: "Заселение", rooms: "Статус номеров", guestsDb: "База гостей" }, newBooking: "Новая бронь", guest: "Гость", channel: "Канал", room: "Номер", dates: "Даты", price: "Цена", status: "Статус", actions: "Действия", noBookings: "Бронирований нет.", nights: "ночей", deposit: "Задаток", staying: "Проживает", confirmed: "Подтверждено", completed: "Завершено", cancelled: "Отменено", pending: "Ожидается", walkIn: "Walk-in", walkInTitle: "Walk-in — заселить гостя сейчас", arrivingToday: "Прибывают сегодня", guestsArrive: "гостей прибывает", clickPlace: "Нажмите «Заселить» во вкладке «Бронирования».", currentGuests: "Гости сейчас", noGuests: "Сейчас гостей нет.", arrived: "Заехал", leaves: "Выезд", action: "Действие", roomStatus: "Статус номеров", busy: "Занят", free: "Свободен", floor: "этаж", noActiveApt: "Нет активных апартаментов.", clientsDb: "База гостей", client: "Клиент", visits: "Визиты", totalSpent: "Общие траты", noClients: "Гостей пока нет. Добавляются автоматически при бронировании.", autoAdded: "Добавляются автоматически при бронировании." },
    funnel: { title: "Воронка гостей", subtitle: "Нажмите на карточку — откроется счёт и расчёт гостя", waiting: "Ожидают", stayingNow: "Проживают", left: "Выехали", empty: "Пусто" },
    ownerPay: { title: "Оплата владельцам", subtitle: "Ежемесячная аренда владельцам — при нажатии «Оплачено» сумма записывается в Кассу и Финансы.", apartment: "Апартамент", owner: "Владелец", payDay: "День оплаты", amount: "Сумма", state: "Статус", paidLabel: "Оплачено", totalMonthly: "итого в месяц", noData: "Для апартаментов не указана стоимость аренды / день оплаты.", dayLabel: "число" },
    statCards: { booked: "Забронировали", comingLater: "Прибудут позже", arrivesToday: "Прибывают сегодня", todayArrivals: "Заезды сегодня", stayingNow: "Проживают", living: "Живут сейчас", checkedOut: "Выехали", finished: "Завершено" },
    booking: { save: "Сохранить бронь", saving: "Сохранение...", guestName: "Имя гостя", guestPhone: "Телефон", selectApt: "Выберите апартамент", checkIn: "Дата заезда", checkOut: "Дата выезда", pricePerNight: "Цена за ночь", totalPrice: "Итого", depositAmount: "Сумма задатка", channel: "Канал", notes: "Примечание" },
    channels: { direct: "Напрямую", airbnb: "Airbnb", booking: "Booking.com", instagram: "Instagram", whatsapp: "WhatsApp", telegram: "Telegram", other: "Другое" },
    roles: { manager: "Менеджер", cleaner: "Уборщик", maintenance: "Техник", driver: "Водитель", other: "Другое" },
    taskTypes: { cleaning: "Уборка", checkin: "Встреча гостя", checkout: "Проводы", maintenance: "Ремонт", shopping: "Закупка", other: "Другое" },
    taskStatus: { todo: "Ожидает", in_progress: "В процессе", done: "Выполнено", cancelled: "Отменено" },
    staff: { title: "Сотрудники", subtitle: "Управление командой и задачами", addStaff: "Добавить сотрудника", tasks: "Задачи", name: "Имя", role: "Должность", phone: "Телефон", salary: "Зарплата", active: "Активен", noStaff: "Сотрудников пока нет.", addTask: "Добавить задачу", assignee: "Ответственный", type: "Тип", aptFor: "Апартамент", deadline: "Срок", description: "Описание", taskList: "Список задач" },
    kassa: { title: "Касса", subtitle: "Учёт прихода и расхода", income: "Приход", expense: "Расход", balance: "Баланс", date: "Дата", category: "Категория", amount: "Сумма", note: "Примечание", add: "Добавить" },
    finance: { title: "Финансы (P&L)", subtitle: "Анализ месячных доходов и расходов", period: "Период", totalRevenue: "Общий доход", totalExpense: "Общие расходы", netProfit: "Чистая прибыль", category: "Категория", amount: "Сумма", addExpense: "Добавить расход", deleteExpense: "Удалить" },
    crm: { title: "CRM (Заявки)", subtitle: "Заявки с сайта и других каналов", name: "Имя", phone: "Телефон", source: "Источник", status: "Статус", note: "Примечание", noLeads: "Заявок пока нет." },
    apartments: { title: "Апартаменты", subtitle: "Список и управление апартаментами", addNew: "Добавить новый", edit: "Редактировать", delete: "Удалить", confirmDelete: "Действительно удалить?", floor: "Этаж", area: "Площадь", price: "Цена", rooms: "Комнаты", guests: "Гости", status: "Статус", active: "Активен", inactive: "Неактивен" },
    common: { save: "Сохранить", cancel: "Отменить", delete: "Удалить", edit: "Редактировать", add: "Добавить", close: "Закрыть", search: "Поиск", filter: "Фильтр", loading: "Загрузка...", noData: "Нет данных", confirm: "Подтвердить", back: "Назад", yes: "Да", no: "Нет" },
  },
  en: {
    sidebar: { panel: "Dashboard", reception: "Reception (bookings/rooms)", crm: "CRM (Leads)", apartments: "Apartments", kassa: "Cash Register", finance: "Finance (P&L)", staff: "Staff", logout: "Logout", system: "Logged in", shef: "Chief", menejer: "Manager" },
    home: { title: "Dashboard", subtitle: "Real-time project statistics and reports", vacant: "Vacant apartments", occupied: "occupied", total: "total", guests: "Current guests", occupancy: "Occupancy", ownerRent: "Owner rent (total)", paid: "Paid", remaining: "remaining", revenue: "Monthly revenue", fromBookings: "From bookings · received in Cash Register", expense: "Monthly expenses", rentCost: "Apartment rent", salary: "Salaries", otherExpense: "Other expenses", profit: "Net profit (monthly)", salesMinusExpense: "Sales − expenses", ta: "" },
    reception: { title: "Reception", subtitle: "Bookings, walk-in placement and room status — in one place.", tabs: { bookings: "Bookings", placement: "Placement", rooms: "Room Status", guestsDb: "Guest Database" }, newBooking: "Manual booking", guest: "Guest", channel: "Channel", room: "Room", dates: "Dates", price: "Price", status: "Status", actions: "Actions", noBookings: "No bookings.", nights: "nights", deposit: "Deposit", staying: "Staying", confirmed: "Confirmed", completed: "Completed", cancelled: "Cancelled", pending: "Pending", walkIn: "Walk-in", walkInTitle: "Walk-in — place guest now", arrivingToday: "Arriving today", guestsArrive: "guests arriving", clickPlace: "Click \"Place\" in the \"Bookings\" tab.", currentGuests: "Current guests", noGuests: "No guests currently.", arrived: "Arrived", leaves: "Leaves", action: "Action", roomStatus: "Room Status", busy: "Occupied", free: "Vacant", floor: "floor", noActiveApt: "No active apartments.", clientsDb: "Guest Database", client: "Client", visits: "Visits", totalSpent: "Total spent", noClients: "No guests yet. Added automatically with bookings.", autoAdded: "Added automatically with bookings." },
    funnel: { title: "Guest funnel", subtitle: "Click a card — guest invoice and details will open", waiting: "Waiting", stayingNow: "Staying now", left: "Checked out", empty: "Empty" },
    ownerPay: { title: "Owner payments", subtitle: "Monthly rent to owners — clicking \"Paid\" records expense in Cash Register and Finance.", apartment: "Apartment", owner: "Owner", payDay: "Pay day", amount: "Amount", state: "Status", paidLabel: "Paid", totalMonthly: "total monthly", noData: "No rent cost / pay day set for apartments.", dayLabel: "day" },
    statCards: { booked: "Booked", comingLater: "Coming later", arrivesToday: "Arriving today", todayArrivals: "Today's arrivals", stayingNow: "Staying now", living: "Currently living", checkedOut: "Checked out", finished: "Finished" },
    booking: { save: "Save booking", saving: "Saving...", guestName: "Guest name", guestPhone: "Phone number", selectApt: "Select apartment", checkIn: "Check-in date", checkOut: "Check-out date", pricePerNight: "Price per night", totalPrice: "Total price", depositAmount: "Deposit amount", channel: "Channel", notes: "Notes" },
    channels: { direct: "Direct", airbnb: "Airbnb", booking: "Booking.com", instagram: "Instagram", whatsapp: "WhatsApp", telegram: "Telegram", other: "Other" },
    roles: { manager: "Manager", cleaner: "Cleaner", maintenance: "Maintenance", driver: "Driver", other: "Other" },
    taskTypes: { cleaning: "Cleaning", checkin: "Check-in", checkout: "Check-out", maintenance: "Maintenance", shopping: "Shopping", other: "Other" },
    taskStatus: { todo: "To do", in_progress: "In progress", done: "Done", cancelled: "Cancelled" },
    staff: { title: "Staff", subtitle: "Team members and task management", addStaff: "Add staff", tasks: "Tasks", name: "Name", role: "Role", phone: "Phone", salary: "Salary", active: "Active", noStaff: "No staff yet.", addTask: "Add task", assignee: "Assignee", type: "Type", aptFor: "Apartment", deadline: "Deadline", description: "Description", taskList: "Task list" },
    kassa: { title: "Cash Register", subtitle: "Income and expense tracking", income: "Income", expense: "Expense", balance: "Balance", date: "Date", category: "Category", amount: "Amount", note: "Note", add: "Add" },
    finance: { title: "Finance (P&L)", subtitle: "Monthly revenue and expense analysis", period: "Period", totalRevenue: "Total revenue", totalExpense: "Total expenses", netProfit: "Net profit", category: "Category", amount: "Amount", addExpense: "Add expense", deleteExpense: "Delete" },
    crm: { title: "CRM (Leads)", subtitle: "Leads from website and other channels", name: "Name", phone: "Phone", source: "Source", status: "Status", note: "Note", noLeads: "No leads yet." },
    apartments: { title: "Apartments", subtitle: "Apartment list and management", addNew: "Add new", edit: "Edit", delete: "Delete", confirmDelete: "Are you sure you want to delete?", floor: "Floor", area: "Area", price: "Price", rooms: "Rooms", guests: "Guests", status: "Status", active: "Active", inactive: "Inactive" },
    common: { save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit", add: "Add", close: "Close", search: "Search", filter: "Filter", loading: "Loading...", noData: "No data", confirm: "Confirm", back: "Back", yes: "Yes", no: "No" },
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
