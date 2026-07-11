"use client";

import { Star } from "lucide-react";
import { useLang } from "./LanguageProvider";

interface ReviewItem {
  name: string;
  role: string;
  text: string;
}

const REVIEWS_DATA: Record<"uz" | "ru" | "en", ReviewItem[]> = {
  uz: [
    { name: "Aziz R.", role: "Toshkent", text: "Xizmat a'lo darajada. Aeroportda kutib olishdi, kvartira suratlardagidek toza va zamonaviy edi. Yana albatta qaytaman." },
    { name: "Dmitriy K.", role: "Moskva", text: "Shahar markazidagi ajoyib apartament. Hammasi aniq va tez, 24/7 qo'llab-quvvatlash haqiqatan ishlaydi." },
    { name: "Sarah M.", role: "London", text: "Manzara maftunkor, xizmat benuqson. Toshkentga kelsangiz — AsiaWay'ni tavsiya qilaman." },
    { name: "Jasur B.", role: "Samarqand", text: "Nest One binosidagi eng zo'r servis! Xonalar keng, toza va barcha sharoitlar yaratilgan. Sportzal ajoyib." },
    { name: "Elena S.", role: "Astana", text: "Gullar bilan bezatilgan balkon va basseyn menga juda yoqdi. Bolalarim maza qilib dam olishdi." },
    { name: "Farrux K.", role: "Buxoro", text: "Aeroportdan transfer vaqtida keldi. Menejerlar juda xushmuomala. Biznes safar uchun eng yaxshi tanlov." },
    { name: "John D.", role: "Nyu-York", text: "Nest One apartamentlari 5 yulduzli mehmonxonalardan qolishmaydi. Manzara esa shunchaki aqlbovar qilmas!" },
    { name: "Madina A.", role: "Toshkent", text: "Oila bilan dam olish uchun juda mos joy. Uydagidek issiq muhit va toza havo." },
    { name: "Rinat T.", role: "Almati", text: "Premium xizmat darajasi. Har bir iltimosimiz soniyalar ichida bajarildi. Rahmat AsiaWay jamoasiga!" },
    { name: "Sophie L.", role: "Parij", text: "Dizayn juda did bilan qilingan. Balkondagi gullar va shahar manzarasi unutilmas lahzalar taqdim etdi." },
    { name: "Sardor M.", role: "Farg'ona", text: "Xonalar toza va shinam. Sportzal va basseyn uchun alohida rahmat. Keyingi safar ham shu yerda qolaman." },
    { name: "Olga V.", role: "Sankt-Peterburg", text: "Toshkent markazida yashash uchun ideal joy. AsiaWay xizmati bizni hayratda qoldirdi, juda tez." },
    { name: "Kyu-Hyun Kim", role: "Seul", text: "Juda xavfsiz va yuqori texnologiyali bino. Xizmat ko'rsatish sifati eng yuqori darajada." },
    { name: "Amir H.", role: "Dubay", text: "Luks darajadagi apartament. Dizayni premium, sport zali va hududi mukammal tartibga solingan." },
    { name: "Zuhra O.", role: "Toshkent", text: "Ajoyib dam olish kunlari bo'ldi. Gullar ifori va balkondagi shinamlik dam olishni unutilmas qildi." },
    { name: "David P.", role: "Berlin", text: "Toshkentdagi eng yaxshi turar-joy. AsiaWay jamoasi o'z ishining ustalari. Tavsiya qilaman!" },
    { name: "Nodira Z.", role: "Xiva", text: "Kvartira juda shinam va yorug'. Aeroportda kutib olishganidan juda xursand bo'ldik." },
    { name: "Alexander B.", role: "Minsk", text: "Hamma narsa ideal darajada tashkil etilgan. Xizmat ko'rsatish tezligi juda yuqori." },
    { name: "Emily W.", role: "Sidney", text: "Manzara va balkondagi hordiq maydoni shunchaki ajoyib. Xizmat ko'rsatish juda yaxshi." },
    { name: "Otabek R.", role: "Andijon", text: "Premium sifat va mukammallik. Har bir xizmat a'lo darajada yo'lga qo'yilgan." },
    { name: "Tatyana N.", role: "Boku", text: "Ushbu apartamentda qolganimizdan juda mamnunmiz. Tozalik va shinamlik a'lo darajada." },
    { name: "Michael K.", role: "Myunxen", text: "Toshkentdagi eng zamonaviy bino. AsiaWay mehmondo'stligi uchun kattakon rahmat." },
    { name: "Shahzoda D.", role: "Toshkent", text: "Xonalardagi tartib va pokizalik hayratlanarli. Har bir detalga e'tibor berilgan." },
    { name: "Viktor S.", role: "Киев", text: "24/7 yordam xizmati juda tez javob beradi. Har qanday muammo darhol hal etildi." },
    { name: "Chloe T.", role: "Toronto", text: "Gullar bilan bezatilgan balkon va ajoyib ko'rinish. Biz bu yerda bo'lishdan juda zavqlandik." },
    { name: "Sherzod I.", role: "Namangan", text: "Haqiqiy 5 yulduzli xizmat. Hammasi vaqtida va sifatli bajariladi. Tavsiya etaman." }
  ],
  ru: [
    { name: "Азиз Р.", role: "Ташкент", text: "Сервис на высшем уровне. Встретили в аэропорту, квартира чистая и современная, как на фото. Обязательно вернусь." },
    { name: "Дмитрий К.", role: "Москва", text: "Отличные апартаменты в центре. Всё чётко и быстро, поддержка 24/7 реально работает." },
    { name: "Сара М.", role: "Лондон", text: "Захватывающий вид и безупречный сервис. Рекомендую AsiaWay для поездок в Ташкент." },
    { name: "Жасур Б.", role: "Самарканд", text: "Лучший сервис в Nest One! Номера просторные, чистые, все удобства. Спортзал отличный." },
    { name: "Елена С.", role: "Астана", text: "Очень понравился балкон с цветами и бассейн. Дети в восторге от отдыха." },
    { name: "Фаррух К.", role: "Бухара", text: "Трансфер из аэропорта прибыл вовремя. Менеджеры вежливые. Лучший выбор для бизнес-поездок." },
    { name: "Джон Д.", role: "Нью-Йорк", text: "Апартаменты Nest One не уступают 5-звездочным отелям. А вид просто невероятный!" },
    { name: "Мадина А.", role: "Ташкент", text: "Прекрасное место для семейного отдыха. Домашний уют и свежий воздух." },
    { name: "Ринат Т.", role: "Алматы", text: "Премиальный уровень обслуживания. Каждая просьба выполнялась за секунды. Спасибо команде!" },
    { name: "Софи Л.", role: "Париж", text: "Дизайн выполнен со вкусом. Цветы на балконе и вид на город подарили незабываемые моменты." },
    { name: "Сардор М.", role: "Фергана", text: "Номера чистые и уютные. Отдельное спасибо за спортзал и бассейн. В следующий раз только сюда." },
    { name: "Ольга В.", role: "Санкт-Петербург", text: "Идеальное место для проживания в центре Ташкента. Сервис приятно удивил скоростью." },
    { name: "Кю-Хён Ким", role: "Сеул", text: "Очень безопасное и технологичное здание. Качество обслуживания на высоте." },
    { name: "Амир Х.", role: "Дубай", text: "Апартаменты люкс-класса. Премиальный дизайн, отличная инфраструктура и спортзал." },
    { name: "Зухра О.", role: "Ташкент", text: "Прекрасные выходные. Аромат цветов и уют на балконе сделали наш отдых незабываемым." },
    { name: "Давид П.", role: "Берлин", text: "Лучшее жилье в Ташкенте. Команда AsiaWay — настоящие профессионалы своего дела. Рекомендую!" },
    { name: "Нодира З.", role: "Хива", text: "Квартира очень уютная и светлая. Были рады встрече в аэропорту." },
    { name: "Александр Б.", role: "Минск", text: "Все организовано на высшем уровне. Скорость реагирования поддержки впечатляет." },
    { name: "Эмили В.", role: "Сидней", text: "Вид и зона отдыха на балконе просто восхитительны. Обслуживание отличное." },
    { name: "Отабек Р.", role: "Андижан", text: "Премиальное качество во всем. Каждая услуга продумана до мелочей." },
    { name: "Татьяна Н.", role: "Баку", text: "Остались очень довольны пребыванием. Чистота и комфорт на высоте." },
    { name: "Михаэль К.", role: "Мюнхен", text: "Самое современное здание Ташкента. Большое спасибо AsiaWay за гостеприимство." },
    { name: "Шахзода Д.", role: "Ташкент", text: "Чистота и порядок в комнатах поражают. Каждая деталь на своем месте." },
    { name: "Виктор С.", role: "Киев", text: "Поддержка 24/7 отвечает моментально. Любой вопрос решался за считанные минуты." },
    { name: "Хлоя Т.", role: "Торонто", text: "Прекрасный балкон с цветами и отличный вид. Нам очень понравилось проводить здесь время." },
    { name: "Шерзод И.", role: "Наманган", text: "Настоящий 5-звездочный сервис. Все вовремя и качественно. Очень рекомендую." }
  ],
  en: [
    { name: "Aziz R.", role: "Tashkent", text: "Excellent service. They met me at the airport, the apartment was clean and modern just like the photos. I'll definitely return." },
    { name: "Dmitry K.", role: "Moscow", text: "Great apartment in the center. Everything smooth and fast, the 24/7 support really works." },
    { name: "Sarah M.", role: "London", text: "Stunning views and flawless service. Highly recommend AsiaWay for stays in Tashkent." },
    { name: "Jasur B.", role: "Samarkand", text: "Best service in Nest One! Rooms are spacious, clean, and all amenities are provided. Gym is great." },
    { name: "Elena S.", role: "Astana", text: "I loved the flowery balcony and the pool. The kids had a fantastic time." },
    { name: "Farrux K.", role: "Bukhara", text: "Airport transfer arrived right on time. Managers were polite. The best choice for business trips." },
    { name: "John D.", role: "New York", text: "Nest One apartments match 5-star hotels. And the view is simply incredible!" },
    { name: "Madina A.", role: "Tashkent", text: "A perfect place for family relaxation. Homey comfort and clean fresh air." },
    { name: "Rinat T.", role: "Almaty", text: "Premium level of hospitality. Every request was resolved within seconds. Thank you AsiaWay team!" },
    { name: "Sophie L.", role: "Paris", text: "The interior is designed with great taste. Flowers on the balcony and city views were unforgettable." },
    { name: "Sardor M.", role: "Fergana", text: "Clean and cozy rooms. Special thanks for the gym and pool. Next time only here." },
    { name: "Olga V.", role: "St. Petersburg", text: "Ideal place to stay in central Tashkent. Service pleasantly surprised us with its speed." },
    { name: "Kyu-Hyun Kim", role: "Seoul", text: "Very safe and high-tech building. The quality of hospitality service is top notch." },
    { name: "Amir H.", role: "Dubai", text: "Luxury class apartment. Premium design, excellent building area, and sports facilities." },
    { name: "Zuhra O.", role: "Tashkent", text: "Wonderful weekend. The scent of flowers and comfort on the balcony made our rest memorable." },
    { name: "David P.", role: "Berlin", text: "The best accommodation in Tashkent. AsiaWay team are absolute pros. Highly recommend!" },
    { name: "Nodira Z.", role: "Khiva", text: "The apartment is very cozy and bright. We were glad to be picked up at the airport." },
    { name: "Alexander B.", role: "Minsk", text: "Everything organized to the highest standard. Support response speed is impressive." },
    { name: "Emily W.", role: "Sydney", text: "The view and balcony relaxation area are simply amazing. Excellent service." },
    { name: "Otabek R.", role: "Andijan", text: "Premium quality in everything. Every single service is perfectly organized." },
    { name: "Tatyana N.", role: "Baku", text: "We were very pleased with our stay. Cleanliness and comfort are top tier." },
    { name: "Michael K.", role: "Munich", text: "The most modern building in Tashkent. Thank you very much to AsiaWay for hospitality." },
    { name: "Shahzoda D.", role: "Tashkent", text: "The cleanliness and order in the rooms are amazing. Every detail in place." },
    { name: "Viktor S.", role: "Kyiv", text: "24/7 support responds instantly. Any issue was resolved in a matter of minutes." },
    { name: "Chloe T.", role: "Toronto", text: "Beautiful flowery balcony and great view. We really enjoyed spending our time here." },
    { name: "Sherzod I.", role: "Namangan", text: "Real 5-star service. Everything is on time and top quality. Highly recommended." }
  ]
};

function TestimonialCard({ item }: { item: ReviewItem }) {
  return (
    <div className="w-[280px] sm:w-[340px] shrink-0 rounded-2xl border border-[rgba(197,164,109,0.12)] bg-[#111417]/85 backdrop-blur-md p-6 lg:p-7 flex flex-col justify-between gap-4 hover:border-[#C5A46D]/60 hover:shadow-[0_15px_30px_rgba(197,164,109,0.06)] transition-all duration-500 select-none">
      <div className="flex gap-1 text-[#C5A46D]">
        {Array.from({ length: 5 }).map((_, s) => (
          <Star key={s} className="h-3.5 w-3.5 fill-[#C5A46D] stroke-[1.5]" />
        ))}
      </div>
      <p className="text-[13px] sm:text-[14px] text-[#F5F2EB]/90 leading-relaxed flex-1 italic font-light">
        &ldquo;{item.text}&rdquo;
      </p>
      <div className="flex items-center gap-3 pt-2.5 border-t border-[rgba(197,164,109,0.1)]">
        <div className="h-9 w-9 rounded-full bg-[#C5A46D]/15 text-[#C5A46D] flex items-center justify-center font-heading font-semibold text-[13px]">
          {item.name.charAt(0)}
        </div>
        <div>
          <div className="text-[14px] font-semibold text-[#F5F2EB]">{item.name}</div>
          <div className="text-[12px] text-[#A8A49B]">{item.role}</div>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const { lang, t } = useLang();
  const reviews = REVIEWS_DATA[lang as "uz" | "ru" | "en"] || REVIEWS_DATA["uz"];
  const r = t.reviews;

  const row1 = reviews.slice(0, 13);
  const row2 = reviews.slice(13);

  return (
    <section className="relative py-[90px] lg:py-[145px] overflow-hidden bg-black" id="reviews">
      {/* Balcony Background Image */}
      <div className="absolute inset-0 z-0 opacity-75">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/nestone/balcony-34floor.jpg" alt="Nest One Balcony View" className="w-full h-full object-cover object-center" />
      </div>
      {/* Clean semi-transparent dark overlay for high visibility and contrast (20% qoraytirish) */}
      <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-[0.5px]" />

      <div className="relative z-20 w-full mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4 px-6">
          <span className="text-[11px] md:text-[12px] font-semibold text-[#C5A46D] tracking-[0.2em] uppercase block drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
            {r.kicker}
          </span>
          <h2 className="font-heading text-[36px] md:text-[48px] lg:text-[60px] font-medium text-[#F5F2EB] leading-[1.1] tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
            {r.title}
          </h2>
        </div>

        <div className="space-y-6 md:space-y-8">
          {/* Row 1: Left scrolling */}
          <div className="marquee-wrap overflow-hidden w-full relative">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black/40 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black/40 to-transparent z-10 pointer-events-none" />
            <div className="marquee-track flex gap-5 px-6 py-2">
              {[...row1, ...row1].map((item, i) => (
                <TestimonialCard key={i} item={item} />
              ))}
            </div>
          </div>

          {/* Row 2: Right scrolling */}
          <div className="marquee-wrap overflow-hidden w-full relative">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black/40 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black/40 to-transparent z-10 pointer-events-none" />
            <div className="marquee-track-reverse flex gap-5 px-6 py-2">
              {[...row2, ...row2].map((item, i) => (
                <TestimonialCard key={i} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
