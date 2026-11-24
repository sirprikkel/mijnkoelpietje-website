import { createHash } from 'node:crypto';

// Gedeelde naamgeving voor og-afbeeldingen. Een hash van het bronpad in plaats
// van de bestandsnaam: uploads bevatten namen die alleen in hoofdletters
// verschillen, en emoji/speciale tekens in bestandsnamen zijn lastig voor crawlers.
export function ogNaam(bron) {
  return createHash('sha1').update(String(bron)).digest('hex').slice(0, 16) + '.jpg';
}
