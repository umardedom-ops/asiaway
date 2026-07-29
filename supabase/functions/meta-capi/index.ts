import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const META_PIXEL_ID = Deno.env.get("META_PIXEL_ID");
const META_ACCESS_TOKEN = Deno.env.get("META_ACCESS_TOKEN");

async function hashSHA256(str: string) {
  if (!str) return "";
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str.trim().toLowerCase()));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  // CORS configuration
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      } 
    });
  }

  try {
    const { bookingId, totalPrice, guestPhone, guestEmail, apartmentId, utmData } = await req.json();

    if (!bookingId || totalPrice === undefined) {
      return new Response(JSON.stringify({ error: "Missing required booking details" }), { status: 400 });
    }

    if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
      console.warn("Missing Meta credentials in environment");
      return new Response(JSON.stringify({ error: "Missing Meta credentials" }), { status: 500 });
    }

    // Build user data with hashed values
    const userData: any = {
      client_user_agent: req.headers.get("user-agent") || "Supabase Edge Function",
    };

    if (guestPhone) {
      // Basic phone normalization (remove +, -, spaces)
      const cleanPhone = guestPhone.replace(/\D/g, '');
      userData.ph = [await hashSHA256(cleanPhone)];
    }
    if (guestEmail) {
      userData.em = [await hashSHA256(guestEmail)];
    }
    
    if (utmData?.fbc) userData.fbc = utmData.fbc;
    if (utmData?.fbp) userData.fbp = utmData.fbp;

    const payload = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          user_data: userData,
          custom_data: {
            currency: "USD",
            value: Number(totalPrice),
            content_name: "Apartment Booking",
            content_ids: [apartmentId],
          }
        }
      ]
    };

    const metaUrl = `https://graph.facebook.com/v19.0/${META_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`;
    const response = await fetch(metaUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const metaResult = await response.json();
    console.log("Meta CAPI response:", metaResult);

    return new Response(JSON.stringify({ success: true, metaResult }), { 
      headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' } 
    });
  } catch (err: any) {
    console.error("CAPI Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 400,
      headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' } 
    });
  }
});
