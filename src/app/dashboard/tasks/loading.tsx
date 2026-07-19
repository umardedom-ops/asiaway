// Farrosh sahifasi skeleton (mobil — tez his qilinsin)
export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0B0D0F] p-5">
      <div className="max-w-[640px] mx-auto space-y-4 animate-pulse">
        <div className="h-6 w-48 rounded-md bg-[#111417]" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-[12px] border border-[rgba(197,164,109,0.14)] bg-[#111417] p-5 space-y-4">
            <div className="h-5 w-40 rounded bg-[#0B0D0F]" />
            <div className="h-3 w-56 rounded bg-[#0B0D0F]/70" />
            <div className="h-24 w-full rounded-[10px] bg-[#0B0D0F]/60" />
            <div className="h-10 w-full rounded-[8px] bg-[#0B0D0F]/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
