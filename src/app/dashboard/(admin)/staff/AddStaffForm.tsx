"use client";

import { useState } from "react";
import { addStaff } from "./actions";
import { Loader2, UserPlus } from "lucide-react";
import { btnPrimary } from "@/lib/ui";
import { ROLE_LABELS, inputCls } from "./labels";

export default function AddStaffForm() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("cleaner");
  const [phone, setPhone] = useState("");
  const [salary, setSalary] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setErr("Ism kiriting"); return; }
    setSaving(true); setErr("");
    const res = await addStaff({ full_name: name, role, phone, monthly_salary: Number(salary) || 0 });
    setSaving(false);
    if (res.success) { setName(""); setPhone(""); setSalary(""); }
    else setErr(res.error || "Xatolik");
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-2 lg:grid-cols-5 gap-3 items-end">
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">Ism</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="F.I.O" className={inputCls} />
      </div>
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">Lavozim</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} className={inputCls}>
          {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">Telefon</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998" className={inputCls} />
      </div>
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#A8A49B] uppercase tracking-[0.1em]">Oylik ($)</label>
        <input type="number" min="0" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="0" className={inputCls} />
      </div>
      <button type="submit" disabled={saving} className={`${btnPrimary} h-11 px-5 text-[14px] gap-2 col-span-2 lg:col-span-1`}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
        Qo&apos;shish
      </button>
      {err && <div className="col-span-full text-[13px] text-red-400">{err}</div>}
    </form>
  );
}
