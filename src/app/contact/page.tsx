import type { Metadata } from 'next';
import { PaginaKop } from '@/components/paginas/PaginaKop';
import { SocialLinks } from '@/components/paginas/SocialLinks';
import { ContactForm } from '@/components/forms/ContactForm';

export const metadata: Metadata = {
  title: 'Contact | MijnKoelPietje',
  description: 'Vraag, verhaal of een kritische noot? Neem contact op met MijnKoelPietje.',
};

export default function ContactPage() {
  return (
    <div id="sectie-contact">
      <div className="pt-24 pb-32 max-w-xl mx-auto px-4 sm:px-6">
        <PaginaKop
          label="Kom in contact"
          titel="Contact"
          intro="Vraag, verhaal of een kritische noot? Gooi het in de groep, koempel. We horen graag van je!"
        />

        <div className="kaart p-8 mb-8">
          <ContactForm />
        </div>

        <SocialLinks />
      </div>
    </div>
  );
}
