import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFY_EMAIL = "info@mijnkoelpietje.nl";

async function sendEmail(to: string, subject: string, html: string) {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "MijnKoelPietje <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });
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
    if (!record?.email) {
      return new Response(JSON.stringify({ error: "Geen email ontvangen" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { email } = record;

    // 1. Bevestigingsmail naar de aanmelder
    const bevestigingRes = await sendEmail(
      email,
      "Welkom bij de MijnKoelPietje nieuwsbrief!",
      `
        <div style="max-width:500px;font-family:sans-serif;">
          <h2 style="color:#f5c400;">Gl\u00fcck Auf!</h2>
          <p>Bedankt voor je aanmelding bij de nieuwsbrief van <strong>MijnKoelPietje</strong>.</p>
          <p>Je ontvangt voortaan updates over:</p>
          <ul>
            <li>Nieuwe verhalen uit de mijn</li>
            <li>AI-kunstwerken en collecties</li>
            <li>Activiteiten en evenementen</li>
          </ul>
          <p>We sturen niet vaak — alleen als er echt iets moois te delen is.</p>
          <hr style="margin:16px 0;border:none;border-top:1px solid #eee;" />
          <p style="color:#999;font-size:12px;">MijnKoelPietje.nl — Mijnerfgoed in pixels</p>
        </div>
      `
    );

    // 2. Notificatie naar KoelPietje
    const notificatieRes = await sendEmail(
      NOTIFY_EMAIL,
      "Nieuwe nieuwsbrief aanmelding",
      `
        <h2>Nieuwe nieuwsbrief aanmelding</h2>
        <p><strong>E-mail:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Datum:</strong> ${new Date().toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam" })}</p>
        <hr style="margin:16px 0;border:none;border-top:1px solid #eee;" />
        <p style="color:#999;font-size:12px;">Automatisch verstuurd door MijnKoelPietje.nl</p>
      `
    );

    const bevestigingData = await bevestigingRes.json();
    const notificatieData = await notificatieRes.json();

    if (!bevestigingRes.ok) {
      console.error("Bevestigingsmail mislukt:", bevestigingData);
    }
    if (!notificatieRes.ok) {
      console.error("Notificatiemail mislukt:", notificatieData);
    }

    return new Response(JSON.stringify({
      success: true,
      bevestiging: bevestigingRes.ok,
      notificatie: notificatieRes.ok,
    }), {
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
