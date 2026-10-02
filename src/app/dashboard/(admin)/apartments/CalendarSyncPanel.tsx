"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarSync, Copy, Check, Trash2, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { addIcalFeed, deleteIcalFeed, syncIcalNow } from "@/app/dashboard/apartments/ical-actions";
import { CHANNEL_LABELS, CHANNEL_STYLE } from "@/app/dashboard/(admin)/bookings/channels";
import { useDashLang } from "@/components/DashboardLangProvider";
import { btnPrimary, btnSecondary } from "@/lib/ui";
import { toast } from "@/components/ui/toast";
import type { FeedSyncResult } from "@/lib/ical-sync";

export interface FeedRow {
  id: string;
  channel: string;
  url: string;
  last_synced_at: string | null;
  last_status: string | null;
  last_error: string | null;
  last_event_count: number | null;
}

interface Props {
  apartmentId: string;
  siteUrl: string;
  feeds: FeedRow[] | null; // null — ical_feeds jadvali hali yaratilmagan
}

const EXPORT_TARGETS = [
  { channel: "airbnb", exclude: "airbnb" },
  { channel: "booking", exclude: "booking" },
  { channel: "other", exclude: null },
] as const;

const IMPORT_CHANNELS = ["airbnb", "booking", "other"] as const;

const inputCls =
  "h-11 w-full rounded-[8px] border border-[rgba(197,164,109,0.22)] bg-[#0B0D0F] px-3 text-[14px] text-[#F5F2EB] placeholder:text-[#A8A49B]/50 focus-visible:outline-none focus-visible:border-[#C5A46D] focus-visible:ring-2 focus-visible:ring-[#C5A46D]/30";

/** "02.10 20:54" — Toshkent vaqti; server va brauzerda bir xil chiqadi (hydration) */
function fmtSyncTime(iso: string) {
  const t = new Date(Date.parse(iso) + 5 * 60 * 60 * 1000).toISOString();
  return `${t.slice(8, 10)}.${t.slice(5, 7)} ${t.slice(11, 16)}`;
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export default function CalendarSyncPanel({ apartmentId, siteUrl, feeds }: Props) {
  const router = useRouter();
  const d = useDashLang();
  const ru = d.lang === "ru";
  const t = (uz: string, r: string) => (ru ? r : uz);

  const [channel, setChannel] = useState<string>("airbnb");
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<"add" | "sync" | string | null>(null);

  const exportUrl = (exclude: string | null) =>
    `${siteUrl}/api/ical/${apartmentId}.ics${exclude ? `?exclude=${exclude}` : ""}`;

  const copy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      toast(t("Nusxalab bo'lmadi — havolani qo'lda belgilang", "Не удалось скопировать — выделите ссылку вручную"));
    }
  };

  const report = (results: FeedSyncResult[] | undefined) => {
    const r = results || [];
    const failed = r.filter((x) => !x.ok);
    if (failed.length > 0) {
      toast(`${t("Sinxronizatsiya xatosi", "Ошибка синхронизации")}: ${failed[0].error}`);
      return;
    }
    const sum = (k: "inserted" | "updated" | "cancelled" | "conflicts") => r.reduce((s, x) => s + x[k], 0);
    const conflicts = sum("conflicts");
    if (conflicts > 0) {
      toast(t(`${conflicts} ta to'qnashuv — sanalar saytdagi bron bilan ustma-ust!`, `${conflicts} конфликт(ов) — даты пересекаются с бронью на сайте!`));
      return;
    }
    toast(
      t(
        `Tayyor: +${sum("inserted")} yangi, ${sum("updated")} yangilandi, ${sum("cancelled")} bekor`,
        `Готово: +${sum("inserted")} новых, ${sum("updated")} обновлено, ${sum("cancelled")} отменено`
      ),
      "success"
    );
  };

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setBusy("add");
    startTransition(async () => {
      const res = await addIcalFeed({ apartment_id: apartmentId, channel, url });
      setBusy(null);
      if (!res.success) {
        toast(res.error);
        return;
      }
      setUrl("");
      report(res.data);
      router.refresh();
    });
  };

  const onSync = () => {
    setBusy("sync");
    startTransition(async () => {
      const res = await syncIcalNow(apartmentId);
      setBusy(null);
      if (!res.success) toast(res.error);
      else report(res.data);
      router.refresh();
    });
  };

  const onDelete = (feed: FeedRow) => {
    const ok = window.confirm(
      t(
        `${CHANNEL_LABELS[feed.channel] || feed.channel} kalendarini uzasizmi? Undan kelgan kelajakdagi band sanalar bo'shatiladi.`,
        `Отключить календарь ${CHANNEL_LABELS[feed.channel] || feed.channel}? Будущие даты из него освободятся.`
      )
    );
    if (!ok) return;
    setBusy(feed.id);
    startTransition(async () => {
      const res = await deleteIcalFeed(feed.id, apartmentId);
      setBusy(null);
      if (!res.success) toast(res.error);
      router.refresh();
    });
  };

  return (
    <section className="rounded-[12px] border border-[rgba(197,164,109,0.14)] bg-[#111417] p-5 sm:p-8 space-y-8">
      <header className="flex items-start gap-3">
        <CalendarSync className="h-6 w-6 shrink-0 text-[#C5A46D] mt-1" aria-hidden />
        <div>
          <h2 className="font-heading text-[24px] font-medium text-[#F5F2EB]">
            {t("Kalendar sinxronizatsiyasi", "Синхронизация календаря")}
          </h2>
          <p className="mt-1 text-[14px] text-[#A8A49B]">
            {t(
              "Airbnb, Booking.com va boshqa platformalar bilan band sanalar avtomatik almashadi (iCal).",
              "Занятые даты автоматически синхронизируются с Airbnb, Booking.com и другими площадками (iCal)."
            )}
          </p>
        </div>
      </header>

      {feeds === null && (
        <div className="flex gap-3 rounded-[8px] border border-amber-500/30 bg-amber-500/10 p-4 text-[14px] text-amber-200">
          <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
          <p>
            {t(
              "Bazada ical_feeds jadvali yo'q. Supabase SQL Editor'da supabase/migrations/20261002000000_ical_sync.sql faylini ishga tushiring.",
              "В базе нет таблицы ical_feeds. Запустите supabase/migrations/20261002000000_ical_sync.sql в Supabase SQL Editor."
            )}
          </p>
        </div>
      )}

      {/* 1. EKSPORT — platformaga qo'yiladigan havola */}
      <div className="space-y-3">
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#C5A46D]">
          {t("1. Platformaga beriladigan havola", "1. Ссылка для площадки")}
        </h3>
        <p className="text-[13px] text-[#A8A49B]">
          {t(
            "Airbnb: Kalendar → Mavjudlik → Kalendarlarni ulash → Boshqa veb-saytga ulanish. Booking.com: Tariflar va mavjudlik → Kalendarni sinxronlash → Kalendarni import qilish.",
            "Airbnb: Календарь → Доступность → Подключить календари → Другой сайт. Booking.com: Цены и наличие → Синхронизация календарей → Импорт календаря."
          )}
        </p>
        <ul className="space-y-2">
          {EXPORT_TARGETS.map(({ channel: ch, exclude }) => {
            const value = exportUrl(exclude);
            return (
              <li key={ch} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <span className={`inline-flex w-fit shrink-0 items-center rounded-full border px-2.5 py-1 text-[12px] font-medium sm:w-28 sm:justify-center ${CHANNEL_STYLE[ch]}`}>
                  {ch === "other" ? t("Boshqa", "Другие") : CHANNEL_LABELS[ch]}
                </span>
                <input readOnly value={value} onFocus={(e) => e.currentTarget.select()} className={`${inputCls} font-mono text-[12px]`} aria-label={`${CHANNEL_LABELS[ch]} iCal`} />
                <button
                  type="button"
                  onClick={() => copy(ch, value)}
                  className={`${btnSecondary} h-11 shrink-0 gap-2 px-4 text-[13px]`}
                >
                  {copied === ch ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied === ch ? t("Nusxalandi", "Скопировано") : t("Nusxalash", "Копировать")}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 2. IMPORT — platformadan olinadigan havola */}
      <div className="space-y-3">
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#C5A46D]">
          {t("2. Platformadan import", "2. Импорт с площадки")}
        </h3>
        <p className="text-[13px] text-[#A8A49B]">
          {t(
            "Platformadagi \"Kalendarni eksport qilish\" havolasini shu yerga qo'ying. Band sanalar saytda yopiladi va bron sifatida ko'rinadi.",
            "Вставьте ссылку «Экспорт календаря» с площадки. Занятые даты закроются на сайте и появятся как брони."
          )}
        </p>

        {feeds && feeds.length > 0 && (
          <ul className="divide-y divide-[rgba(197,164,109,0.14)] rounded-[8px] border border-[rgba(197,164,109,0.14)]">
            {feeds.map((f) => (
              <li key={f.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-4">
                <span className={`inline-flex w-fit shrink-0 items-center rounded-full border px-2.5 py-1 text-[12px] font-medium ${CHANNEL_STYLE[f.channel] || CHANNEL_STYLE.other}`}>
                  {CHANNEL_LABELS[f.channel] || f.channel}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[12px] text-[#F5F2EB]" title={f.url}>{hostOf(f.url)}</p>
                  <p className={`text-[12px] ${f.last_status === "error" || f.last_error ? "text-amber-300" : "text-[#A8A49B]"}`}>
                    {!f.last_synced_at
                      ? t("Hali sinxronlanmagan", "Ещё не синхронизирован")
                      : f.last_status === "error"
                        ? `${t("Xato", "Ошибка")}: ${f.last_error}`
                        : `${fmtSyncTime(f.last_synced_at)} ·${f.last_event_count ?? 0} ${t("ta band sana", "занятых периодов")}${f.last_error ? ` · ${f.last_error}` : ""}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(f)}
                  disabled={pending}
                  aria-label={t("Kalendarni uzish", "Отключить календарь")}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center self-end rounded-lg text-[#A8A49B] transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50 sm:self-auto"
                >
                  {busy === f.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </li>
            ))}
          </ul>
        )}

        {feeds !== null && (
          <form onSubmit={onAdd} className="flex flex-col gap-2 sm:flex-row">
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className={`${inputCls} sm:w-40 shrink-0`}
              aria-label={t("Platforma", "Площадка")}
            >
              {IMPORT_CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {c === "other" ? t("Boshqa", "Другая") : CHANNEL_LABELS[c]}
                </option>
              ))}
            </select>
            <input
              type="url"
              inputMode="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.airbnb.com/calendar/ical/....ics?s=..."
              className={inputCls}
              aria-label={t("iCal havola", "Ссылка iCal")}
            />
            <button type="submit" disabled={pending || !url.trim()} className={`${btnPrimary} h-11 shrink-0 gap-2 px-6 text-[14px]`}>
              {busy === "add" && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("Qo'shish", "Добавить")}
            </button>
          </form>
        )}
      </div>

      {feeds && feeds.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-[rgba(197,164,109,0.14)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-[#A8A49B]">
            {t(
              "Sayt kalendari ochilganda va muntazam ravishda (cron) avtomatik yangilanadi. Platformadan kelgan bronni platformaning o'zida bekor qiling: saytda ham avtomatik bekor bo'ladi.",
              "Обновляется автоматически при открытии календаря на сайте и по расписанию (cron). Брони с площадки отменяйте на самой площадке: на сайте они отменятся автоматически."
            )}
          </p>
          <button type="button" onClick={onSync} disabled={pending} className={`${btnSecondary} h-11 shrink-0 gap-2 px-5 text-[14px]`}>
            <RefreshCw className={`h-4 w-4 ${busy === "sync" ? "animate-spin" : ""}`} />
            {t("Hozir sinxronlash", "Синхронизировать сейчас")}
          </button>
        </div>
      )}
    </section>
  );
}
