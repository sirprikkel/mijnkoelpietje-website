import type { ReactNode } from 'react';
import { CONTACT_EMAIL, LINK_GEEL, POIRET, RAND_GEEL } from './stijl';

/** Kaart met een genummerde kop, zoals op de oude disclaimer- en voorwaardenpagina. */
export function JuridischKaart({ titel, accent = false, children }: { titel: string; accent?: boolean; children: ReactNode }) {
  return (
    <div className="kaart p-8 reveal" style={accent ? RAND_GEEL : undefined}>
      <h2 style={POIRET} className="text-xl mb-4">{titel}</h2>
      {children}
    </div>
  );
}

/** Alinea in grijs, met optioneel vetgedrukt label ervoor. */
export function Alinea({ label, mb = 'mb-3', children }: { label?: string; mb?: string; children?: ReactNode }) {
  return (
    <p className={`text-gray-400 leading-relaxed ${mb}`.trim()}>
      {label && <strong className="text-gray-300">{label}</strong>}
      {label && children ? ' ' : null}
      {children}
    </p>
  );
}

export function MailLink() {
  return <a href={`mailto:${CONTACT_EMAIL}`} style={LINK_GEEL}>{CONTACT_EMAIL}</a>;
}

export function MailKnop() {
  return <a href={`mailto:${CONTACT_EMAIL}`} className="btn-geel" style={{ display: 'inline-block' }}>{CONTACT_EMAIL}</a>;
}

export function Bedrijfsgegevens({ mb = '' }: { mb?: string }) {
  return (
    <p className={`text-gray-400 leading-relaxed ${mb}`.trim()}>
      <strong className="text-gray-300">MijnKoelPietje</strong>
      <br />
      Eijmaelstraat 17
      <br />
      6412 AL Heerlen
      <br />
      Nederland
      <br />
      E-mail: <MailLink />
      <br />
      KVK: 42156376
    </p>
  );
}
