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

    const { naam, email, onderwerp, bericht, datum } = record;
    const datumStr = datum
      ? new Date(datum).toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam" })
      : "onbekend";

    const safeNaam = escapeHtml(naam || '');
    const safeEmail = escapeHtml(email || '');
    const safeOnderwerp = escapeHtml(onderwerp || '');
    const safeBericht = escapeHtml(bericht || '');

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "MijnKoelPietje <info@mijnkoelpietje.nl>",
        to: [NOTIFY_EMAIL],
        subject: `Nieuw contactbericht: ${safeOnderwerp || "Geen onderwerp"}`,
        html: `
          <h2>Nieuw bericht via MijnKoelPietje</h2>
          <table style="border-collapse:collapse;width:100%;max-width:500px;">
            <tr><td style="padding:8px;font-weight:bold;color:#666;">Naam</td><td style="padding:8px;">${safeNaam}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;color:#666;">E-mail</td><td style="padding:8px;"><a href="mailto:${safeEmail}">${safeEmail || "niet opgegeven"}</a></td></tr>
            <tr><td style="padding:8px;font-weight:bold;color:#666;">Onderwerp</td><td style="padding:8px;">${safeOnderwerp || "–"}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;color:#666;">Datum</td><td style="padding:8px;">${datumStr}</td></tr>
          </table>
          <hr style="margin:16px 0;border:none;border-top:1px solid #eee;" />
          <p style="white-space:pre-wrap;">${safeBericht}</p>
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
