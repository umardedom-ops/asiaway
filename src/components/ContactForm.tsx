"use client";

import { useState } from "react";
import { createLead } from "@/app/actions/lead";
import { useLang } from "./LanguageProvider";
import { btnPrimary } from "@/lib/ui";
import type { Lang } from "@/lib/i18n";
import { CheckCircle2, Loader2, Phone, User, Send, Mail, MessageCircle } from "lucide-react";

const inputCls =
  "w-full h-12 rounded-lg border border-[rgba(197,164,109,0.2)] bg-[#0B0D0F]/60 pl-10 pr-4 text-[15px] text-[#F5F2EB] placeholder-[#A8A49B]/60 outline-none focus:border-[#C5A46D] transition-colors";

// Anketa boshida tayyor turadigan xabar
const DEFAULT_MSG: Record<Lang, string> = {
  uz: "Assalomu alaykum! Apartament bron qilmoqchimiz. Iltimos, tafsilotlar uchun biz bilan bog'laning.",
  ru: "Здравствуйте! Хотим забронировать апартаменты. Пожалуйста, свяжитесь с нами для уточнения деталей.",
  en: "Hello! We'd like to book an apartment. Please contact us to confirm the details.",
};

// Kamida bitta aloqa kerakligi haqidagi izoh
const CONTACT_HINT: Record<Lang, string> = {
  uz: "Telefon, WhatsApp yoki Telegram — kamida bittasini kiriting.",
  ru: "Укажите хотя бы одно: телефон, WhatsApp или Telegram.",
  en: "Provide at least one: phone, WhatsApp or Telegram.",
};

const VALIDATION_ERR: Record<Lang, string> = {
  uz: "Ismingizni va kamida bitta aloqa (telefon/WhatsApp/Telegram) kiriting.",
  ru: "Введите имя и хотя бы один контакт (телефон/WhatsApp/Telegram).",
  en: "Enter your name and at least one contact (phone/WhatsApp/Telegram).",
};

export default function ContactForm() {
  const { t, lang } = useLang();
  const c = t.contact;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [telegram, setTelegram] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(() => DEFAULT_MSG[lang] || "");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [formErr, setFormErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasContact = !!(phone.trim() || whatsapp.trim() || telegram.trim());
    if (!name.trim() || !hasContact) {
      setFormErr(VALIDATION_ERR[lang]);
      return;
    }
    setFormErr("");
    setState("sending");
    const res = await createLead({ name, phone, whatsapp, telegram, email, message, lang });
    setState(res.success ? "done" : "error");
  };

  if (state === "done") {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-4 py-12">
        <div className="h-16 w-16 rounded-full bg-[#C5A46D]/15 flex items-center justify-center text-[#C5A46D]">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h3 className="font-heading text-2xl md:text-3xl font-medium text-[#F5F2EB]">{c.success}</h3>
        <p className="text-[15px] text-[#A8A49B] max-w-sm">{c.successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {(state === "error" || formErr) && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {formErr || c.error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="relative">
          <User className="absolute left-3 top-3.5 h-4 w-4 text-[#A8A49B]/70" />
          <input className={inputCls} placeholder={`${c.name} *`} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="relative">
          <Phone className="absolute left-3 top-3.5 h-4 w-4 text-[#A8A49B]/70" />
          <input className={inputCls} placeholder={c.phone} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="relative">
          <MessageCircle className="absolute left-3 top-3.5 h-4 w-4 text-[#A8A49B]/70" />
          <input className={inputCls} placeholder={c.whatsapp} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </div>
        <div className="relative">
          <Send className="absolute left-3 top-3.5 h-4 w-4 text-[#A8A49B]/70" />
          <input className={inputCls} placeholder={c.telegram} value={telegram} onChange={(e) => setTelegram(e.target.value)} />
        </div>
        <div className="relative sm:col-span-2">
          <Mail className="absolute left-3 top-3.5 h-4 w-4 text-[#A8A49B]/70" />
          <input className={inputCls} type="email" placeholder={c.email} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>

      <p className="text-[12px] text-[#A8A49B]/80 -mt-1">{CONTACT_HINT[lang]}</p>

      <textarea
        className="w-full rounded-lg border border-[rgba(197,164,109,0.2)] bg-[#0B0D0F]/60 p-4 text-[15px] text-[#F5F2EB] placeholder-[#A8A49B]/60 outline-none focus:border-[#C5A46D] transition-colors min-h-[96px] resize-none"
        placeholder={c.message}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        type="submit"
        disabled={state === "sending"}
        className={`w-full h-14 text-[15px] gap-2 ${btnPrimary}`}
      >
        {state === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> {c.sending}
          </>
        ) : (
          c.submit
        )}
      </button>
    </form>
  );
}
