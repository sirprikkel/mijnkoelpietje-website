import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFY_EMAIL = "info@mijnkoelpietje.nl";

function slugToTitle(slug: string): string {
  if (!slug) return 'Onbekend verhaal';
  return slug
    .replace(/[-_]/g, ' ')
    .replace(/\.\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, c => c.toUpperCase());
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { record } = await req.json();

    if (!record) {
      return new Response(JSON.stringify({ error: "Geen record ontvangen" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { verhaal_id } = record;
    const titel = slugToTitle(verhaal_id || '');
    const verhaalLink = `https://mijnkoelpietje.nl/#verhaal/${verhaal_id}`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "MijnKoelPietje <info@mijnkoelpietje.nl>",
        to: [NOTIFY_EMAIL],
        subject: `Nieuw hartje voor: ${titel}`,
        html: `
          <h2>Nieuw hartje op MijnKoelPietje</h2>
          <p>Iemand vond het verhaal <strong>"${slugToTitle(verhaal_id || '')}"</strong> mooi!</p>
          <p><a href="${verhaalLink}" style="color:#f5c400;">Bekijk het verhaal &rarr;</a></p>
          <hr style="margin:16px 0;border:none;border-top:1px solid #eee;" />
          <p style="color:#999;font-size:12px;">Dit bericht is automatisch verstuurd door MijnKoelPietje.nl</p>
        `,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend fout:", data);
      return new Response(JSON.stringify({ error: "Email versturen mislukt", details: data }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function fout:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
