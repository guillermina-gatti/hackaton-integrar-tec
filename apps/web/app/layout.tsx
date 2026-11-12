import type { Metadata } from 'next';
import { Instrument_Serif, Space_Grotesk } from 'next/font/google';
import Cursor from '@/components/Cursor';
import './globals.css';

// Geometric sans for the text and italic serif for the accents,
// as in the reference phrase "Aprendo a construir software que funciona."
const sans = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'La Oficina de Reclamos del Fantasma',
  description: 'Presentá tu queja ante la oficina más dramática del más allá.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <Cursor />
        {children}
      </body>
    </html>
  );
}
