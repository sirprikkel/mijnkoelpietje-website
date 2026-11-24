// Maakt per verhaal/product een og-afbeelding van 1200x630 (WhatsApp/Facebook).
// WhatsApp toont niets boven ~600KB en croppt zelf naar het midden, dus we
// leveren precies 1,91:1 aan. Draait als prebuild; faalt nooit de build.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { ogNaam } from './og-naam.mjs';

const ROOT = process.cwd();
const DOEL = path.join(ROOT, 'public', 'og');
fs.mkdirSync(DOEL, { recursive: true });

function bronnen() {
  const set = new Set();
  for (const col of ['verhalen', 'kunstwerken']) {
    const dir = path.join(ROOT, 'content', col);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.json') || f === 'index.json') continue;
      try {
        const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        if (typeof d.afbeelding === 'string' && d.afbeelding.startsWith('/')) set.add(d.afbeelding);
      } catch { /* kapotte JSON meldt src/lib/content.ts al */ }
    }
  }
  return [...set];
}

const lijst = bronnen();
let gemaakt = 0, actueel = 0, mislukt = 0;
await Promise.all(lijst.map(async bron => {
  const bestand = path.join(ROOT, 'public', decodeURIComponent(bron));
  const doel = path.join(DOEL, ogNaam(bron));
  try {
    if (!fs.existsSync(bestand)) { mislukt++; console.warn(`  ! og: bron ontbreekt ${bron}`); return; }
    if (fs.existsSync(doel) && fs.statSync(doel).mtimeMs >= fs.statSync(bestand).mtimeMs) { actueel++; return; }
    await sharp(bestand, { failOn: 'none' })
      .rotate()
      .resize(1200, 630, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 82, progressive: true, mozjpeg: true })
      .toFile(doel);
    gemaakt++;
  } catch (e) {
    mislukt++;
    console.warn(`  ! og mislukt voor ${bron}: ${String(e.message).split('\n')[0]}`);
  }
}));
console.log(`og-afbeeldingen: ${gemaakt} gemaakt, ${actueel} actueel, ${mislukt} mislukt (van ${lijst.length})`);
