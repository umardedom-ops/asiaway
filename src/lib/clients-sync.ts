// Mijoz (mehmon) lifecycle yordamchilari — bronlar bilan avtomatik sinxron.
// createClient (server) tashqaridan beriladi, shuning uchun bu fayl agnostik.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SB = any;

/**
 * Bron yaratilganda mijozни telefon bo'yicha topib yangilaydi yoki yaratadi.
 * Xatolar yutiladi (asosiy bron oqimini buzmasin).
 */
export async function syncClientFromBooking(
  supabase: SB,
  input: { name: string; phone: string; email?: string | null; channel?: string; amount?: number }
) {
  const phone = (input.phone || "").trim();
  if (!phone) return;
  try {
    const { data: existing } = await supabase
      .from("clients")
      .select("id, total_stays, total_spent")
      .eq("phone", phone)
      .maybeSingle();

    const amount = Number(input.amount || 0);

    if (existing) {
      const stays = Number(existing.total_stays || 0) + 1;
      await supabase
        .from("clients")
        .update({
          full_name: input.name || undefined,
          email: input.email || undefined,
          channel: input.channel || undefined,
          total_stays: stays,
          total_spent: Number(existing.total_spent || 0) + amount,
          stage: stays > 1 ? "repeat" : "booked",
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("clients").insert([
        {
          full_name: input.name || "Mehmon",
          phone,
          email: input.email || null,
          channel: input.channel || "direct",
          stage: "booked",
          total_stays: 1,
          total_spent: amount,
        },
      ]);
    }
  } catch (e) {
    console.error("syncClientFromBooking:", e);
  }
}

/**
 * Bron "completed" (checkout) bo'lganda:
 *  - mijoz bosqichini checked_out/repeat qiladi,
 *  - apartament uchun tozalash vazifasini avtomatik ochadi (bo'sh tozalovchiga).
 */
export async function onBookingCompleted(
  supabase: SB,
  booking: { apartment_id: string | null; guest_name?: string; guest_phone?: string; check_out?: string }
) {
  try {
    // 1. Mijoz bosqichi
    if (booking.guest_phone) {
      const { data: client } = await supabase
        .from("clients")
        .select("id, total_stays")
        .eq("phone", booking.guest_phone.trim())
        .maybeSingle();
      if (client) {
        await supabase
          .from("clients")
          .update({ stage: Number(client.total_stays || 0) > 1 ? "repeat" : "checked_out" })
          .eq("id", client.id);
      }
    }

    // 2. Avto-tozalash vazifasi (agar shu apartament uchun ochiq tozalash yo'q bo'lsa)
    if (booking.apartment_id) {
      const { data: openTask } = await supabase
        .from("tasks")
        .select("id")
        .eq("apartment_id", booking.apartment_id)
        .eq("type", "cleaning")
        .in("status", ["todo", "in_progress"])
        .maybeSingle();

      if (!openTask) {
        // Bo'sh tozalovchini topamiz
        const { data: cleaner } = await supabase
          .from("staff")
          .select("id")
          .eq("role", "cleaner")
          .eq("active", true)
          .limit(1)
          .maybeSingle();

        await supabase.from("tasks").insert([
          {
            title: `Tozalash — ${booking.guest_name || "mehmon"} ketgach`,
            type: "cleaning",
            apartment_id: booking.apartment_id,
            assigned_to: cleaner?.id || null,
            status: "todo",
            priority: "high",
            due_date: booking.check_out || new Date().toISOString().split("T")[0],
          },
        ]);
      }
    }
  } catch (e) {
    console.error("onBookingCompleted:", e);
  }
}
