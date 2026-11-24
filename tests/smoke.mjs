#!/usr/bin/env node

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..');
const FIXTURE_FILE = path.join(SCRIPT_DIR, 'fixtures', 'bestaande-urls.txt');
const MAX_OG_IMAGE_BYTES = 600 * 1024;
const DEFAULT_CONCURRENCY = 8;

function parseConcurrency(argv) {
  let value = DEFAULT_CONCURRENCY;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--concurrency') {
      value = Number(argv[index + 1]);
      index += 1;
    } else if (argument.startsWith('--concurrency=')) {
      value = Number(argument.slice('--concurrency='.length));
    } else {
      throw new Error(`Onbekende optie: ${argument}`);
    }
  }

  if (!Number.isInteger(value) || value < 1) {
    throw new Error('--concurrency moet een positief geheel getal zijn');
  }

  return value;
}

function encodePathname(pathname) {
  return pathname
    .split('/')
    .map((segment) => {
      if (!segment) return '';
      let decoded = segment;
      try {
        decoded = decodeURIComponent(segment);
      } catch {
        // Een letterlijk procentteken is geldige fixture-invoer en wordt hieronder gecodeerd.
      }
      return encodeURIComponent(decoded.normalize('NFC'));
    })
    .join('/');
}

function pageUrl(baseUrl, pathname) {
  return new URL(encodePathname(pathname), baseUrl).href;
}

function normalizedSlug(value) {
  return value.normalize('NFC').replace(/[. ]+$/u, '');
}

function decodeHtml(value) {
  const named = new Map([
    ['amp', '&'],
    ['apos', "'"],
    ['gt', '>'],
    ['lt', '<'],
    ['nbsp', '\u00a0'],
    ['quot', '"'],
  ]);

  return value.replace(/&(#(?:x[\da-f]+|\d+)|[a-z][\da-z]+);/giu, (entity, name) => {
    if (name[0] === '#') {
      const hexadecimal = name[1]?.toLowerCase() === 'x';
      const codePoint = Number.parseInt(name.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
      try {
        return Number.isInteger(codePoint) ? String.fromCodePoint(codePoint) : entity;
      } catch {
        return entity;
      }
    }
    return named.get(name.toLowerCase()) ?? entity;
  });
}

function normalizeText(value) {
  return decodeHtml(value).normalize('NFC').replace(/\s+/gu, ' ').trim();
}

function metaProperties(html) {
  const result = new Map();
  const tags = html.match(/<meta\b[^>]*>/giu) ?? [];

  for (const tag of tags) {
    const attributes = new Map();
    const attributePattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/gu;
    for (const match of tag.matchAll(attributePattern)) {
      attributes.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? '');
    }
    const property = attributes.get('property') ?? attributes.get('name');
    if (property?.toLowerCase().startsWith('og:') && attributes.has('content')) {
      result.set(property.toLowerCase(), decodeHtml(attributes.get('content')));
    }
  }

  return result;
}

async function readContentIndex(directoryName) {
  const directory = path.join(PROJECT_ROOT, 'content', directoryName);
  const filenames = (await readdir(directory)).filter(
    (filename) => filename.endsWith('.json') && filename !== 'index.json',
  );
  const entries = [];

  for (const filename of filenames) {
    const document = JSON.parse(await readFile(path.join(directory, filename), 'utf8'));
    const fileSlug = filename.slice(0, -'.json'.length);
    entries.push({
      ...document,
      filename,
      urlSlug: normalizedSlug(fileSlug),
    });
  }

  return entries;
}

function contentForPath(pathname, verhalen, kunstwerken) {
  const match = pathname.match(/^\/(verhaal|product)\/(.+)$/u);
  if (!match) return undefined;

  let urlSlug;
  try {
    urlSlug = decodeURIComponent(match[2]);
  } catch {
    urlSlug = match[2];
  }
  const collection = match[1] === 'verhaal' ? verhalen : kunstwerken;
  const wanted = normalizedSlug(urlSlug);
  return collection.find((entry) => entry.urlSlug === wanted);
}

function parseDutchDate(value) {
  if (typeof value !== 'string') return Number.NEGATIVE_INFINITY;
  const months = new Map([
    ['januari', 0], ['februari', 1], ['maart', 2], ['april', 3],
    ['mei', 4], ['juni', 5], ['juli', 6], ['augustus', 7],
    ['september', 8], ['oktober', 9], ['november', 10], ['december', 11],
  ]);
  const match = value.trim().toLowerCase().match(/^(\d{1,2})\s+([^\s]+)\s+(\d{4})$/u);
  if (!match || !months.has(match[2])) return Number.NEGATIVE_INFINITY;
  return Date.UTC(Number(match[3]), months.get(match[2]), Number(match[1]));
}

async function mapLimit(items, concurrency, operation) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await operation(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

async function fetchBytes(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'mijnkoelpietje-smoke-test/1.0' },
    redirect: 'follow',
    signal: AbortSignal.timeout(30_000),
  });
  const bytes = new Uint8Array(await response.arrayBuffer());
  return { response, bytes };
}

async function main() {
  const concurrency = parseConcurrency(process.argv.slice(2));
  const baseUrl = new URL(process.env.BASE_URL || 'http://localhost:3000');
  const failures = [];
  const warnings = [];
  const pageSizes = [];

  const fixtureText = await readFile(FIXTURE_FILE, 'utf8');
  const fixturePaths = fixtureText
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
  const [verhalen, kunstwerken] = await Promise.all([
    readContentIndex('verhalen'),
    readContentIndex('kunstwerken'),
  ]);

  console.log(`Smoke-test: ${baseUrl.href} (${fixturePaths.length} URL's, concurrency ${concurrency})`);

  const pages = await mapLimit(fixturePaths, concurrency, async (pathname) => {
    const url = pageUrl(baseUrl, pathname);
    try {
      const { response, bytes } = await fetchBytes(url);
      const html = new TextDecoder().decode(bytes);
      pageSizes.push({ pathname, bytes: bytes.byteLength });
      if (response.status !== 200) {
        failures.push(`${pathname}: verwacht HTTP 200, kreeg ${response.status}`);
      }
      return { pathname, url, response, html };
    } catch (error) {
      failures.push(`${pathname}: ophalen mislukt (${error.message})`);
      return { pathname, url, error, html: '' };
    }
  });

  const imageChecks = new Map();
  async function checkOgImage(imageUrl, pathname) {
    let absolute;
    try {
      absolute = new URL(imageUrl);
      if (!['http:', 'https:'].includes(absolute.protocol)) throw new Error('geen HTTP(S)-URL');
      // Lokaal/preview wijst og:image naar het productiedomein, waar de nieuwe
      // bestanden nog niet staan. Met OG_FROM_BASE=1 controleren we het pad op BASE_URL.
      if (process.env.OG_FROM_BASE === '1') absolute = new URL(absolute.pathname, baseUrl);
    } catch (error) {
      failures.push(`${pathname}: og:image is niet absoluut (${imageUrl || 'leeg'}; ${error.message})`);
      return;
    }

    if (!imageChecks.has(absolute.href)) {
      imageChecks.set(absolute.href, (async () => {
        const { response, bytes } = await fetchBytes(absolute.href);
        return {
          status: response.status,
          contentType: response.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase() ?? '',
          bytes: bytes.byteLength,
        };
      })());
    }

    try {
      const result = await imageChecks.get(absolute.href);
      if (result.status !== 200) {
        failures.push(`${pathname}: og:image geeft HTTP ${result.status} (${absolute.href})`);
      }
      if (result.contentType !== 'image/jpeg') {
        failures.push(`${pathname}: og:image is ${result.contentType || 'zonder content-type'}, verwacht image/jpeg`);
      }
      if (result.bytes >= MAX_OG_IMAGE_BYTES) {
        failures.push(`${pathname}: og:image is ${result.bytes} bytes, moet kleiner zijn dan ${MAX_OG_IMAGE_BYTES}`);
      }
    } catch (error) {
      failures.push(`${pathname}: og:image ophalen mislukt (${error.message})`);
    }
  }

  const detailPages = pages.filter(({ pathname }) => /^\/(?:verhaal|product)\//u.test(pathname));
  await mapLimit(detailPages, concurrency, async ({ pathname, html, error }) => {
    if (error) return;
    const metadata = metaProperties(html);
    for (const property of ['og:title', 'og:image', 'og:url']) {
      if (!metadata.get(property)?.trim()) failures.push(`${pathname}: ${property} ontbreekt in de ruwe HTML`);
    }

    const content = contentForPath(pathname, verhalen, kunstwerken);
    if (!content) {
      failures.push(`${pathname}: geen bijbehorend contentbestand gevonden`);
    } else if (
      // Producten tonen de prijs achter de titel ("— € 45,-"), net als de oude site.
      normalizeText(metadata.get('og:title') ?? '').replace(/ — € [^—]*$/, '') !== normalizeText(content.titel ?? '')
    ) {
      failures.push(
        `${pathname}: og:title komt niet overeen (verwacht ${JSON.stringify(content.titel)}, kreeg ${JSON.stringify(metadata.get('og:title') ?? '')})`,
      );
    }

    if (metadata.get('og:image')) await checkOgImage(metadata.get('og:image'), pathname);
  });

  const newestStories = [...verhalen]
    .sort((left, right) => parseDutchDate(right.datum) - parseDutchDate(left.datum))
    .slice(0, 6);
  const htmlByPath = new Map(pages.map((page) => [page.pathname, page.html]));

  if (!htmlByPath.has('/verhalen')) {
    const pathname = '/verhalen';
    try {
      const { response, bytes } = await fetchBytes(pageUrl(baseUrl, pathname));
      const html = new TextDecoder().decode(bytes);
      htmlByPath.set(pathname, html);
      pageSizes.push({ pathname, bytes: bytes.byteLength });
      if (response.status !== 200) failures.push(`${pathname}: verwacht HTTP 200, kreeg ${response.status}`);
    } catch (error) {
      failures.push(`${pathname}: ophalen mislukt (${error.message})`);
      htmlByPath.set(pathname, '');
    }
  }

  // Home toont (net als de oude site) de 3 nieuwste verhalen; het overzicht allemaal.
  for (const [pathname, aantal] of [['/', 3], ['/verhalen', 6]]) {
    const html = normalizeText(htmlByPath.get(pathname) ?? '');
    for (const story of newestStories.slice(0, aantal)) {
      if (!html.includes(normalizeText(story.titel))) {
        failures.push(`${pathname}: nieuwste verhaaltitel ontbreekt in ruwe HTML: ${JSON.stringify(story.titel)}`);
      }
    }
  }

  pageSizes.sort((left, right) => right.bytes - left.bytes);
  console.log('\nVijf zwaarste pagina\'s (ruwe HTML):');
  for (const page of pageSizes.slice(0, 5)) {
    console.log(`  ${String(page.bytes).padStart(9)} bytes  ${page.pathname}`);
  }

  if (warnings.length) {
    console.log(`\nWaarschuwingen (${warnings.length}):`);
    for (const warning of warnings) console.log(`  - ${warning}`);
  }

  console.log('\nSamenvatting:');
  console.log(`  URL's gecontroleerd:       ${fixturePaths.length}`);
  console.log(`  Detailpagina's met OG:     ${detailPages.length}`);
  console.log(`  Unieke OG-images:          ${imageChecks.size}`);
  console.log(`  Nieuwste titels per lijst: ${newestStories.length}`);

  if (failures.length) {
    console.error(`  Resultaat: MISLUKT (${failures.length} fout${failures.length === 1 ? '' : 'en'})`);
    console.error('\nFouten:');
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exitCode = 1;
  } else {
    console.log('  Resultaat: GESLAAGD');
  }
}

main().catch((error) => {
  console.error(`Smoke-test kon niet starten: ${error.stack || error.message}`);
  process.exitCode = 1;
});
