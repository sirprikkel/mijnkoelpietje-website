import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFY_EMAIL = "info@mijnkoelpietje.nl";

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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

    const { verhaal_id, naam, tekst, datum } = record;
    const datumStr = datum
      ? new Date(datum).toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam" })
      : "onbekend";

    const safeNaam = escapeHtml(naam || '');
    const safeTekst = escapeHtml(tekst || '');
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
        subject: `Nieuwe reactie op: ${titel}`,
        html: `
          <h2>Nieuwe reactie op MijnKoelPietje</h2>
          <table style="border-collapse:collapse;width:100%;max-width:500px;">
            <tr><td style="padding:8px;font-weight:bold;color:#666;">Verhaal</td><td style="padding:8px;"><a href="${verhaalLink}">${escapeHtml(titel)}</a></td></tr>
            <tr><td style="padding:8px;font-weight:bold;color:#666;">Naam</td><td style="padding:8px;">${safeNaam}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;color:#666;">Datum</td><td style="padding:8px;">${datumStr}</td></tr>
          </table>
          <hr style="margin:16px 0;border:none;border-top:1px solid #eee;" />
          <p style="white-space:pre-wrap;">${safeTekst}</p>
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
