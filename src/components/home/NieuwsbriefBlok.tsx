import Image from 'next/image';
import { NieuwsbriefForm } from '@/components/forms/NieuwsbriefForm';

/** CLIMAX CTA — Chapter 5: Nieuwsbrief */
export function NieuwsbriefBlok() {
  return (
    <section
      className="py-24 px-4 sm:px-6 text-center border-t border-b"
      style={{ background: 'linear-gradient(135deg,#0a0800,#000)', borderColor: 'rgba(245,196,0,0.1)' }}
    >
      <div className="max-w-xl mx-auto reveal">
        <div className="kanarie-flutter inline-block mb-6" aria-hidden="true">
          <Image
            src="/logo-rond.png"
            alt=""
            width={72}
            height={72}
            style={{ borderRadius: '50%', filter: 'drop-shadow(0 0 16px rgba(245,196,0,0.5))' }}
          />
        </div>
        <h2 style={{ fontFamily: "'Poiret One',sans-serif", fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: 400 }} className="mb-4">
          Blijf op de hoogte
        </h2>
        <p className="text-gray-400 mb-8">Nieuwe verhalen, kunst en activiteiten — rechtstreeks in je inbox.</p>
        <NieuwsbriefForm />
      </div>
    </section>
  );
}
