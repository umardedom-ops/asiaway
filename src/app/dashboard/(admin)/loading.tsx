// Navigatsiyada DARROV ko'rsatiladigan skeleton (native-tez his).
// Next.js App Router: sahifa server komponenti ma'lumot yuklaguncha shu chiqadi,
// layout (sidebar) esa joyida turadi — ilovadek silliq o'tish.
export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Sarlavha */}
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-md bg-[#111417]" />
        <div className="h-4 w-80 rounded-md bg-[#111417]/70" />
      </div>

      {/* 4 ta stat karta */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-[12px] border border-[rgba(197,164,109,0.14)] bg-[#111417] p-5 space-y-3">
            <div className="h-3 w-24 rounded bg-[#0B0D0F]" />
            <div className="h-7 w-16 rounded bg-[#0B0D0F]" />
            <div className="h-3 w-28 rounded bg-[#0B0D0F]/70" />
          </div>
        ))}
      </div>

      {/* Katta blok / jadval */}
      <div className="rounded-[12px] border border-[rgba(197,164,109,0.14)] bg-[#111417] p-6 space-y-4">
        <div className="h-5 w-40 rounded bg-[#0B0D0F]" />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="h-4 flex-1 rounded bg-[#0B0D0F]/60" />
            <div className="h-4 w-20 rounded bg-[#0B0D0F]/60" />
            <div className="h-4 w-16 rounded bg-[#0B0D0F]/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
