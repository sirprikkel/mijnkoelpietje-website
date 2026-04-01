# Koppeling Stappenplan — MijnKoelPietje.nl

Dit document beschrijft alle stappen om het domein, de website en de email-verzending te koppelen.
Er zijn 3 onderdelen die in volgorde moeten worden afgehandeld.

---

## Vereisten

- Toegang tot **Strato** (Edward) — voor DNS-records
- Toegang tot **Vercel** (Pim) — voor domein koppelen
- Toegang tot **Resend** (Pim) — voor email domein verificatie
- Resend API key is al geconfigureerd als Supabase secret

---

## Stap 1: Resend domein toevoegen (Pim)

1. Ga naar https://resend.com/domains
2. Klik **Add Domain**
3. Vul in: `mijnkoelpietje.nl`
4. Resend toont 3 DNS-records — **kopieer deze records**
   - Meestal: 1x MX, 1x TXT (SPF), 1x CNAME (DKIM)
5. Stuur de DNS-records door naar Edward (of voeg ze zelf toe als je Strato-toegang hebt)
6. **Nog NIET op Verify klikken** — wacht tot de DNS-records zijn ingesteld

---

## Stap 2: DNS-records instellen bij Strato (Edward of Pim)

### Inloggen
1. Ga naar https://www.strato.nl en log in
2. Ga naar **Domeinen** > **mijnkoelpietje.nl** > **DNS-beheer**

### Website-records toevoegen (Vercel)

| Type  | Naam/Host | Waarde              |
|-------|-----------|---------------------|
| A     | @         | 76.76.21.21         |
| CNAME | www       | cname.vercel-dns.com |

### Email-records toevoegen (Resend)

Voeg de 3 records toe die je in Stap 1 van Resend hebt gekregen.
Voorbeeld (gebruik de ECHTE waarden van Resend!):

| Type  | Naam/Host          | Waarde                          |
|-------|--------------------|---------------------------------|
| MX    | @                  | feedback-smtp.eu.resend.com (prioriteit 10) |
| TXT   | @                  | v=spf1 include:resend.com ~all  |
| CNAME | resend._domainkey  | (lange waarde uit Resend dashboard) |

**Let op:**
- Als er al bestaande A-records of CNAME-records op @ of www staan, verwijder die eerst
- MX-records: alleen toevoegen als er GEEN bestaande email op het domein draait
- Sla alles op

---

## Stap 3: Vercel domein koppelen (Pim)

1. Ga naar https://vercel.com/dashboard
2. Open project **mijnkoelpietje-website-ms2r**
3. Ga naar **Settings** > **Domains**
4. Klik **Add** en voeg toe: `mijnkoelpietje.nl`
5. Klik **Add** en voeg toe: `www.mijnkoelpietje.nl`
6. Vercel toont een groen vinkje zodra de DNS-records zijn doorgewerkt
7. HTTPS-certificaat wordt automatisch aangemaakt door Vercel

---

## Stap 4: Resend domein verifiëren (Pim)

1. Ga terug naar https://resend.com/domains
2. Klik op **Verify** bij mijnkoelpietje.nl
3. Als het niet meteen lukt: wacht 15-30 minuten en probeer opnieuw
4. DNS propagatie kan tot 24 uur duren, maar is meestal binnen 1 uur klaar
5. Status moet veranderen naar **Verified** (groen)

---

## Stap 5: Edge Functions updaten (Pim)

Zodra het Resend-domein is geverifieerd:

1. Open `supabase/functions/contact-email/index.ts`
2. Wijzig de `from` regel:
   ```
   VAN:  from: "MijnKoelPietje <onboarding@resend.dev>"
   NAAR: from: "MijnKoelPietje <noreply@mijnkoelpietje.nl>"
   ```
3. Open `supabase/functions/nieuwsbrief-email/index.ts`
4. Doe dezelfde wijziging
5. Deploy beide functies opnieuw:
   ```
   npx supabase functions deploy contact-email --project-ref nwufmlayvaofmjetacfd
   npx supabase functions deploy nieuwsbrief-email --project-ref nwufmlayvaofmjetacfd
   ```

---

## Stap 6: Testen

### Website testen
- [ ] https://mijnkoelpietje.nl laadt de site
- [ ] https://www.mijnkoelpietje.nl laadt de site
- [ ] HTTPS werkt (slotje in browser)

### Contactformulier testen
- [ ] Vul het contactformulier in op de site
- [ ] Bericht verschijnt in Supabase tabel `contact_berichten`
- [ ] Email komt aan op info@mijnkoelpietje.nl
- [ ] Afzender toont `noreply@mijnkoelpietje.nl`

### Nieuwsbrief testen
- [ ] Vul een emailadres in bij "Blijf op de hoogte"
- [ ] Email verschijnt in Supabase tabel `nieuwsbrief`
- [ ] Bevestigingsmail komt aan bij de aanmelder
- [ ] Notificatie komt aan op info@mijnkoelpietje.nl
- [ ] Dubbele aanmelding toont "Al aangemeld!"

---

## Huidige status

| Onderdeel | Status |
|-----------|--------|
| Supabase tabellen (contact_berichten, nieuwsbrief) | Klaar |
| Edge Functions (contact-email, nieuwsbrief-email) | Gedeployed |
| Database triggers | Actief |
| Resend API key als secret | Geconfigureerd |
| DNS-records bij Strato | Wacht op Edward |
| Vercel domein koppeling | Wacht op DNS |
| Resend domein verificatie | Wacht op DNS |
| Edge Functions from-adres updaten | Wacht op Resend verificatie |

---

## Contactgegevens

- **Supabase project:** nwufmlayvaofmjetacfd (Koelpietje)
- **Vercel project:** mijnkoelpietje-website-ms2r
- **GitHub repo:** sirprikkel/mijnkoelpietje-website
- **Resend:** resend.com (inloggen met Pim's account)
- **Strato:** strato.nl (inloggen met Edward's account)
