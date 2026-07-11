/**
 * AsiaWay Apartment — Real Seed Data
 * Telegram kanaldan to'g'ridan-to'g'ri olingan: @nestoneapartment
 * AsiaWay platformasi uchun boshlang'ich ma'lumotlar
 */

export const BRAND = {
  name: "AsiaWay Apartment",
  tagline: "Toshkentdagi eng prestizhli apart-gostinitsa xizmati",
  description:
    "10 yillik apart-gostinitsa tajribasi bilan O'zbekistonda yetakchi bo'lgan AsiaWay. Barcha kvartiralar Nest One — mamlakatning eng baland binosi (266.5 metr, 51 qavat) da joylashgan. Aeroport transferidan tortib to barcha xizmatlarni bir joyda taqdim etamiz.",
  building: "Nest One Skyscraper",
  address: "Toshkent shahri, Toshkent City, Botir Zokirov ko'chasi 1A/1",
  coordinates: { lat: 41.312081, lng: 69.251950 },
  phones: ["+998901101301", "+998952565776", "+998992266262"],
  telegram: "@AsiaWayApart",
  channel: "@nestoneapartment",
  yearsExperience: 10,
  totalApartments: 20,
  buildingFloors: 51,
  buildingHeight: 266.5,
  services: [
    "Aeroport kutib olish va kuzatish (transfer)",
    "24/7 kirish va yordam",
    "Professional tozalash xizmati",
    "Ko'p tilli xizmat (UZ, RU, EN)",
    "Bron tasdiqlanganda barcha ko'rsatmalar",
  ],
  amenities: [
    "Sky Deck (48-qavat, tomosha maydoni)",
    "SPA & Wellness markazi",
    "Professional Fitnes zali (Technogym)",
    "VIP Kino zali",
    "Yopiq basseyn",
    "24/7 Konsyerj xizmati",
    "Tashkent City Park — to'g'ridan-to'g'ri kirish",
    "Xavfsizlik xizmati",
    "Yer osti avtoturargoh",
  ],
} as const;

export interface Apartment {
  id: string;
  title: string;
  floor: number;
  area_m2: number;
  rooms: number;
  max_guests: number;
  view: string;
  bed_config: string;
  price_per_day: number;
  price_per_month: number;
  deposit_amount: number;
  cover_image: string;
  amenities: string[];
  description: string;
  telegram_post: string;
  status: "active" | "inactive";
}

export const APARTMENTS: Apartment[] = [
  {
    id: "34780000-0000-0000-0000-000000000000",
    title: "34-qavat | 78 m² | Premium Penthouse",
    floor: 34,
    area_m2: 78,
    rooms: 2,
    max_guests: 4,
    view: "Humo Arena, Magic City",
    bed_config: "2 yotoqxona — 3 yotoq o'rni",
    price_per_day: 160,
    price_per_month: 3200,
    deposit_amount: 320,
    cover_image:
      "https://hiofixthnnowewdqynxb.supabase.co/storage/v1/object/public/assets/apartments/apt-34780000.webp",
    amenities: [
      "wifi", "smart_tv", "kitchen", "ac", "washing_machine",
      "panoramic_view", "coffee_maker",
    ],
    description:
      "34-qavatdan Humo Arena va Magic City koʻrinishi. Zamonaviy lakonik interer, shinam muhit. Toʻliq jihozlangan oshxona, tezkor Wi-Fi. Shahar markazida hashamatli yashash.",
    telegram_post: "https://t.me/nestoneapartment/501",
    status: "active",
  },
  {
    id: "29650000-0000-0000-0000-000000000000",
    title: "29-qavat | 65 m² | High Sky Suite",
    floor: 29,
    area_m2: 65,
    rooms: 2,
    max_guests: 5,
    view: "Humo Arena, Magic City",
    bed_config: "2 yotoqxona — 4 yotoq o'rni",
    price_per_day: 140,
    price_per_month: 2800,
    deposit_amount: 280,
    cover_image:
      "https://hiofixthnnowewdqynxb.supabase.co/storage/v1/object/public/assets/apartments/apt-29650000.webp",
    amenities: [
      "wifi", "smart_tv", "kitchen", "ac", "washing_machine", "panoramic_view",
    ],
    description:
      "29-qavatdan Humo Arena va Magic City manzarasi. 2 ta yotoqxonada 4 nafar uchun qulay. Zamonaviy interer, shinam muhit. To'liq jihozlangan oshxona.",
    telegram_post: "https://t.me/nestoneapartment/522",
    status: "active",
  },
  {
    id: "22800000-0000-0000-0000-000000000000",
    title: "22-qavat | 80 m² | Panorama Suite",
    floor: 22,
    area_m2: 80,
    rooms: 2,
    max_guests: 4,
    view: "Humo Arena, Magic City",
    bed_config: "1-yotoqxona: King size | 2-yotoqxona: 2 ta single",
    price_per_day: 150,
    price_per_month: 3000,
    deposit_amount: 300,
    cover_image:
      "https://hiofixthnnowewdqynxb.supabase.co/storage/v1/object/public/assets/apartments/apt-22800000.webp",
    amenities: [
      "wifi", "smart_tv", "kitchen", "ac", "washing_machine", "panoramic_view",
    ],
    description:
      "22-qavatdan Humo Arena va Magic City ko'rinishi. Keng 80 m² maydonda 2 ta alohida yotoqxona — biri king size, ikkinchisida 2 ta single karavot.",
    telegram_post: "https://t.me/nestoneapartment/422",
    status: "active",
  },
  {
    id: "17450000-0000-0000-0000-000000000000",
    title: "17-qavat | 45 m² | City Park Studio",
    floor: 17,
    area_m2: 45,
    rooms: 1,
    max_guests: 2,
    view: "Tashkent City Park",
    bed_config: "1 yotoqxona: King size (2 kishilik)",
    price_per_day: 100,
    price_per_month: 2000,
    deposit_amount: 200,
    cover_image:
      "https://hiofixthnnowewdqynxb.supabase.co/storage/v1/object/public/assets/apartments/apt-17450000.webp",
    amenities: [
      "wifi", "smart_tv", "kitchen", "ac", "park_view",
    ],
    description:
      "17-qavatdan Tashkent City bog'iga ajoyib manzara. Juftlar uchun ideal — katta king size karavot, shinam muhit. To'liq jihozlangan oshxona.",
    telegram_post: "https://t.me/nestoneapartment/489",
    status: "active",
  },
  {
    id: "15800000-0000-0000-0000-000000000000",
    title: "15-qavat | 80 m² | Park View Family",
    floor: 15,
    area_m2: 80,
    rooms: 2,
    max_guests: 4,
    view: "Tashkent City Park",
    bed_config: "1-yotoqxona: King size | 2-yotoqxona: 2 ta single",
    price_per_day: 145,
    price_per_month: 2900,
    deposit_amount: 290,
    cover_image:
      "https://hiofixthnnowewdqynxb.supabase.co/storage/v1/object/public/assets/apartments/apt-15800000.webp",
    amenities: [
      "wifi", "smart_tv", "kitchen", "ac", "washing_machine", "park_view",
    ],
    description:
      "15-qavatdan Tashkent City bog'iga chiroyli ko'rinish. Oila uchun ideal: 2 ta alohida yotoqxona, keng yashash maydoni. 4 nafargacha qulay.",
    telegram_post: "https://t.me/nestoneapartment/466",
    status: "active",
  },
  {
    id: "11650000-0000-0000-0000-000000000000",
    title: "11-qavat | 65 m² | Park View Comfort",
    floor: 11,
    area_m2: 65,
    rooms: 2,
    max_guests: 3,
    view: "Tashkent City Park",
    bed_config: "1-yotoqxona: King size | 2-yotoqxona: Single",
    price_per_day: 125,
    price_per_month: 2500,
    deposit_amount: 250,
    cover_image:
      "https://hiofixthnnowewdqynxb.supabase.co/storage/v1/object/public/assets/apartments/apt-11650000.webp",
    amenities: [
      "wifi", "smart_tv", "kitchen", "ac", "washing_machine", "park_view",
    ],
    description:
      "11-qavatdan Tashkent City bog'iga chiroyli manzara. 2 ta yotoqxona, 3 nafargacha qulay. Shinam va zamonaviy interer.",
    telegram_post: "https://t.me/nestoneapartment/511",
    status: "active",
  },
  {
    id: "10800000-0000-0000-0000-000000000000",
    title: "10-qavat | 80 m² | City View XL",
    floor: 10,
    area_m2: 80,
    rooms: 2,
    max_guests: 6,
    view: "Shahar panoramasi",
    bed_config: "2x King size yotoqxona + ochiladigan divan",
    price_per_day: 140,
    price_per_month: 2800,
    deposit_amount: 280,
    cover_image:
      "https://hiofixthnnowewdqynxb.supabase.co/storage/v1/object/public/assets/apartments/apt-10800000.webp",
    amenities: [
      "wifi", "smart_tv", "kitchen", "ac", "washing_machine",
      "city_view", "sofa_bed",
    ],
    description:
      "10-qavatdan shahar panoramasi. Katta guruh yoki oila uchun ideal: 2 ta king size yotoqxona + yashash xonasdagi ochiladigan divan. 6 nafargacha.",
    telegram_post: "https://t.me/nestoneapartment/455",
    status: "active",
  },
  {
    id: "10650000-0000-0000-0000-000000000000",
    title: "10-qavat | 65 m² | Park View Duo",
    floor: 10,
    area_m2: 65,
    rooms: 2,
    max_guests: 3,
    view: "Tashkent City Park",
    bed_config: "2 yotoqxona — 3 yotoq o'rni",
    price_per_day: 120,
    price_per_month: 2400,
    deposit_amount: 240,
    cover_image: "https://hiofixthnnowewdqynxb.supabase.co/storage/v1/object/public/assets/apartments/apt-10800000.webp",
    amenities: [
      "wifi", "smart_tv", "kitchen", "ac", "washing_machine", "park_view",
    ],
    description:
      "10-qavatdan Tashkent City bog'iga manzara. 2 ta yotoqxona, 3 nafargacha qulay. Shinam va zamonaviy interer. Oʻziga xos koʻrinish.",
    telegram_post: "https://t.me/nestoneapartment/535",
    status: "active",
  },
  {
    id: "02650000-0000-0000-0000-000000000000",
    title: "2-qavat | 65 m² | Garden Park",
    floor: 2,
    area_m2: 65,
    rooms: 2,
    max_guests: 3,
    view: "Garden Park (ichki hovli)",
    bed_config: "2 yotoqxona — 3 yotoq o'rni",
    price_per_day: 110,
    price_per_month: 2200,
    deposit_amount: 220,
    cover_image:
      "https://hiofixthnnowewdqynxb.supabase.co/storage/v1/object/public/assets/apartments/apt-02650000.webp",
    amenities: [
      "wifi", "smart_tv", "kitchen", "ac", "washing_machine", "garden_view",
    ],
    description:
      "2-qavatda tinch va osoyishta ichki hovli (Garden Park) ko'rinishi. Yuqori qavatlardagi shovqindan holi. 2 ta yotoqxona, 3 nafargacha qulay.",
    telegram_post: "https://t.me/nestoneapartment/480",
    status: "active",
  },
];

// Standart qulayliklar lug'ati
export const AMENITY_LABELS: Record<string, string> = {
  wifi: "Tezkor Wi-Fi",
  smart_tv: "Smart TV",
  kitchen: "To'liq jihozlangan oshxona",
  ac: "Konditsioner",
  washing_machine: "Kir yuvish mashinasi",
  panoramic_view: "Panoramik manzara",
  park_view: "Park ko'rinishi",
  city_view: "Shahar ko'rinishi",
  garden_view: "Bog' ko'rinishi",
  coffee_maker: "Kofe mashinasi",
  sofa_bed: "Ochiladigan divan",
  jacuzzi: "Jakuzi",
  dishwasher: "Idish yuvish mashinasi",
};
