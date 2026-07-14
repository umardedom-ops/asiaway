export const ROLE_LABELS: Record<string, string> = {
  manager: "Menejer",
  cleaner: "Tozalovchi",
  maintenance: "Ta'mirchi",
  driver: "Haydovchi",
  other: "Boshqa",
};

export const ROLE_LABELS_RU: Record<string, string> = {
  manager: "Менеджер",
  cleaner: "Уборщик(ца)",
  maintenance: "Ремонтник",
  driver: "Водитель",
  other: "Другое",
};

export const TASK_TYPE_LABELS: Record<string, string> = {
  cleaning: "Tozalash",
  checkin: "Kutib olish",
  checkout: "Kuzatish",
  maintenance: "Ta'mirlash",
  shopping: "Xarid",
  other: "Boshqa",
};

export const TASK_TYPE_LABELS_RU: Record<string, string> = {
  cleaning: "Уборка",
  checkin: "Встреча (Заезд)",
  checkout: "Проводы (Выезд)",
  maintenance: "Ремонт",
  shopping: "Покупки",
  other: "Другое",
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  todo: "Kutilmoqda",
  in_progress: "Jarayonda",
  done: "Bajarilgan",
  cancelled: "Bekor qilingan",
};

export const TASK_STATUS_LABELS_RU: Record<string, string> = {
  todo: "В ожидании",
  in_progress: "В процессе",
  done: "Выполнено",
  cancelled: "Отменено",
};

export const inputCls =
  "w-full h-11 rounded-[8px] border border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] px-3 text-[14px] text-[#F5F2EB] outline-none focus:border-[#C5A46D] transition-colors";
