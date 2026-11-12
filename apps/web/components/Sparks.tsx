import type { CSSProperties } from 'react';

// Fixed values (not random) so the server and the browser render the same thing
// and no hydration errors appear.
const CHISPAS = Array.from({ length: 30 }, (_, i) => ({
  izquierda: (i * 53) % 100,
  tamano: 2 + (i % 4),
  duracion: 6 + (i % 7) * 1.3,
  demora: -((i * 7) % 12),
  deriva: ((i % 5) - 2) * 40,
}));

export default function Sparks() {
  return (
    <div className="chispas" aria-hidden>
      {CHISPAS.map((c, i) => {
        const estilo = {
          left: `${c.izquierda}%`,
          width: c.tamano,
          height: c.tamano,
          animationDuration: `${c.duracion}s`,
          animationDelay: `${c.demora}s`,
          '--deriva': `${c.deriva}px`,
        } as CSSProperties;

        return <span key={i} className="chispa" style={estilo} />;
      })}
    </div>
  );
}
