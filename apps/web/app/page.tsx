'use client';

import { CSSProperties, FormEvent, useCallback, useEffect, useState } from 'react';
import Sparks from '@/components/Sparks';

// Priority and deadline shown while the user picks a reason.
// The official calculation is done by the API; these values are only for the preview.
const TIPOS = [
  { valor: 'susto', texto: 'Un susto', prioridad: 1, plazoDias: 1 },
  { valor: 'sombra robada', texto: 'Sombra robada', prioridad: 1, plazoDias: 1 },
  { valor: 'frio', texto: 'Frío sospechoso', prioridad: 2, plazoDias: 3 },
  { valor: 'ruido', texto: 'Ruidos a medianoche', prioridad: 3, plazoDias: 7 },
];

const MAX_DESCRIPCION = 200;
const INTERVALO_TABLERO_MS = 5000;
// If the API doesn't answer in this time, we show the error instead of hanging
const TIMEOUT_MS = 8000;

// What the API returns when a claim is submitted (POST /api/reclamos)
type RespuestaAlta = {
  expediente: string;
  prioridad: number;
  plazoDias: number;
};

// A board claim (GET /api/reclamos)
type Reclamo = {
  expediente: string;
  nombre: string;
  anonimo: boolean;
  tipo: string;
  prioridad: number;
  plazoDias: number;
  reclamadoA: string | null;
  descripcion: string;
  creado: string;
  muestra: boolean;
};

// Receipt data shown after submitting
type Certificado = RespuestaAlta & {
  nombre: string;
  motivo: string;
  reclamadoA: string | null;
};

const dias = (n: number) => (n === 1 ? '1 día' : `${n} días`);
const textoTipo = (valor: string) => TIPOS.find((t) => t.valor === valor)?.texto ?? valor;

export default function Home() {
  const [nombre, setNombre] = useState('');
  const [anonimo, setAnonimo] = useState(false);
  const [reclamadoA, setReclamadoA] = useState('');
  const [tipo, setTipo] = useState('susto');
  const [descripcion, setDescripcion] = useState('');
  const [certificado, setCertificado] = useState<Certificado | null>(null);
  const [tablero, setTablero] = useState<Reclamo[]>([]);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [sinApi, setSinApi] = useState(false);
  const [serpientes, setSerpientes] = useState(0);
  const terminarSerpiente = useCallback(() => setSerpientes(0), []);

  const elegido = TIPOS.find((t) => t.valor === tipo) ?? TIPOS[0];

  // Con 2 columnas, el desfile necesita un número par de filas para repetirse sin saltos
  const base: (Reclamo | null)[] = tablero.length % 2 ? [...tablero, null] : tablero;

  const cargarTablero = useCallback(async () => {
    try {
      const res = await fetch('/api/reclamos', {
        cache: 'no-store',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setTablero(await res.json());
      setSinApi(false);
    } catch {
      // API not responding: warn on the board and retry on the next cycle
      setSinApi(true);
    }
  }, []);

  useEffect(() => {
    cargarTablero();
    const id = setInterval(cargarTablero, INTERVALO_TABLERO_MS);
    return () => clearInterval(id);
  }, [cargarTablero]);

  async function presentarReclamo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    // Validación antes de llamar a la API, con mensajes claros
    if (!anonimo && !nombre.trim()) {
      setError('Falta el nombre del reclamante. O marcá la opción de presentar de forma anónima.');
      return;
    }
    if (!descripcion.trim()) {
      setError('Contá brevemente qué pasó antes de presentar el reclamo.');
      return;
    }

    setEnviando(true);

    const persona = reclamadoA.trim();

    try {
      const res = await fetch('/api/reclamos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: anonimo ? undefined : nombre.trim(),
          anonimo,
          tipo,
          descripcion: descripcion.trim(),
          reclamadoA: persona || undefined,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (!res.ok) {
        setError(
          res.status === 400
            ? 'Revisá los datos: falta algún campo o alguno supera el largo permitido.'
            : `La oficina respondió con un error (${res.status}). Intentá de nuevo.`,
        );
        return;
      }

      const alta: RespuestaAlta = await res.json();
      setCertificado({
        ...alta,
        nombre: anonimo ? 'Anónimo' : nombre.trim(),
        motivo: elegido.texto,
        reclamadoA: persona || null,
      });
      setSerpientes((n) => n + 1);
      cargarTablero();
    } catch {
      setError('La oficina está en otro plano: la API no responde. ¿Está corriendo pnpm dev?');
    } finally {
      setEnviando(false);
    }
  }

  function presentarOtro() {
    setCertificado(null);
    setDescripcion('');
    setReclamadoA('');
    setError('');
  }

  return (
    <>
      <div className="fondo-velo" aria-hidden />
      <div className="resplandor" aria-hidden />
      <Montanas />
      <Sparks />
      <div className="vineta" aria-hidden />
      <div className="niebla" aria-hidden />
      <div className="niebla niebla-2" aria-hidden />
      <Ojos />
      <div className="trueno-luz" aria-hidden />
      <Trueno />
      <div className="grano" aria-hidden />
      {serpientes > 0 && <Serpiente key={serpientes} onFin={terminarSerpiente} />}

      <main className="pagina">
        <header className="encabezado">
          <div className="encabezado-fila">
            <div className="encabezado-texto">
              <p className="kicker">Feria de Soluciones Improbables · Mundos Inventados</p>
              <h1 className="titulo">
                La Oficina de Reclamos <em>del Fantasma</em>
              </h1>
              <p className="lead">
                Su queja es muy importante para nosotros. Por favor, espere sin moverse.
                Gracias por ser tan valiente.
              </p>
            </div>
          </div>
        </header>

        <div className="tablero-grid">
          <section className="panel panel-formulario" aria-label="Presentar reclamo">
            {certificado ? (
              <article className="certificado" aria-live="polite">
                <p className="sello-oficina">Oficina de Reclamos del Fantasma</p>
                <h2>
                  Comprobante <em>oficial</em>
                </h2>
                <dl>
                  <div>
                    <dt>Expediente</dt>
                    <dd>{certificado.expediente}</dd>
                  </div>
                  <div>
                    <dt>Reclamante</dt>
                    <dd>{certificado.nombre}</dd>
                  </div>
                  {certificado.reclamadoA && (
                    <div>
                      <dt>Reclamado a</dt>
                      <dd>{certificado.reclamadoA}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Motivo</dt>
                    <dd>{certificado.motivo}</dd>
                  </div>
                  <div>
                    <dt>Prioridad</dt>
                    <dd>{certificado.prioridad}</dd>
                  </div>
                  <div>
                    <dt>Resolución</dt>
                    <dd>en {dias(certificado.plazoDias)}</dd>
                  </div>
                </dl>
                <div className="pie-certificado">
                  <p className="firma">El Fantasma</p>
                  <div className="sello" aria-hidden>
                    Tramitado
                  </div>
                </div>
                <button type="button" className="boton-secundario boton-volver" onClick={presentarOtro}>
                  Presentar otro reclamo
                </button>
              </article>
            ) : (
              <form onSubmit={presentarReclamo} className="formulario">
                <div className="fila-2">
                  <label className="campo">
                    Nombre del reclamante
                    <input
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      maxLength={60}
                      required={!anonimo}
                      disabled={anonimo}
                      placeholder={anonimo ? 'Anónimo' : 'Ej.: Juan Pérez'}
                      autoComplete="off"
                    />
                  </label>

                  <label className="campo">
                    <span>
                      ¿A quién le reclamás? <span className="opcional">(opcional)</span>
                    </span>
                    <input
                      value={reclamadoA}
                      onChange={(e) => setReclamadoA(e.target.value)}
                      maxLength={60}
                      placeholder="Ej.: El vecino del 3B"
                      autoComplete="off"
                    />
                  </label>
                </div>

                <label className="campo">
                  Motivo de la queja
                  <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                    {TIPOS.map((t) => (
                      <option key={t.valor} value={t.valor}>
                        {t.texto}
                      </option>
                    ))}
                  </select>
                  <span className="pista">
                    Prioridad <strong>{elegido.prioridad}</strong> · resolución en{' '}
                    {dias(elegido.plazoDias)}
                  </span>
                </label>

                <label className="campo">
                  Descripción breve
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    maxLength={MAX_DESCRIPCION}
                    required
                    rows={2}
                    placeholder="Contá lo ocurrido, con el dramatismo que merece."
                  />
                  <span className="campo-meta">
                    <span>Sin revelar secretos del más allá</span>
                    <span>
                      {descripcion.length}/{MAX_DESCRIPCION}
                    </span>
                  </span>
                </label>

                <label className="check">
                  <input
                    type="checkbox"
                    checked={anonimo}
                    onChange={(e) => setAnonimo(e.target.checked)}
                  />
                  Presentar de forma anónima
                </label>

                <button type="submit" className="boton" disabled={enviando}>
                  {enviando ? 'Tramitando…' : 'Presentar reclamo →'}
                </button>

                {error && (
                  <p className="error" role="alert">
                    {error}
                  </p>
                )}
              </form>
            )}
          </section>

          <section className="panel panel-tablero" aria-label="Tablero de reclamos">
            <header className="panel-cabecera">
              <div>
                <p className="kicker">Tablero en vivo</p>
                <h2>
                  Reclamos presentados <span>({tablero.length})</span>
                </h2>
              </div>
            </header>

            {sinApi && (
              <p className="aviso" role="status">
                La API no responde en este momento. ¿Está corriendo <code>pnpm dev</code>?
              </p>
            )}

            {tablero.length === 0 ? (
              <p className="vacio">Todavía no hay reclamos. Sé el primero.</p>
            ) : (
              <div className="ticker">
                <ul
                  className="ticker-track"
                  style={
                    {
                      '--duracion': `${Math.max(14, Math.ceil(tablero.length / 2) * 3)}s`,
                    } as CSSProperties
                  }
                >
                  {[...base, ...base].map((r, i) =>
                    r ? (
                      <FilaReclamo key={`${i}-${r.expediente}`} r={r} />
                    ) : (
                      <li key={`${i}-vacia`} className="fila fila-vacia" aria-hidden />
                    ),
                  )}
                </ul>
              </div>
            )}
          </section>
        </div>

        <footer className="pie-pagina">
          <div className="marca marca-pie">
            <span className="marca-icono" aria-hidden />
            Mesa de atención · Más allá
          </div>
          <span className="pie-autor">
            Hecho por <strong>Guillermina Gatti</strong>
          </span>
          <Murcielago />
        </footer>
      </main>
    </>
  );
}

function FilaReclamo({ r }: { r: Reclamo }) {
  return (
    <li className="fila" title={r.descripcion}>
      <div className="fila-cabecera">
        <span className="fila-exp">
          {r.expediente}
          {r.muestra && <span className="etiqueta-muestra">muestra</span>}
        </span>
        <span className={`prioridad p${r.prioridad}`}>P{r.prioridad}</span>
      </div>
      <p className="fila-texto">
        <strong>{r.nombre}</strong>
        {r.reclamadoA && (
          <>
            {' '}reclama a <em>{r.reclamadoA}</em>
          </>
        )}
        {' '}· {textoTipo(r.tipo)}
      </p>
    </li>
  );
}

function Montanas() {
  return (
    <svg className="montanas" viewBox="0 0 1280 320" preserveAspectRatio="none" aria-hidden>
      <path d="M0 320 L0 230 L140 120 L260 210 L380 90 L520 220 L650 110 L800 230 L930 130 L1060 220 L1180 100 L1280 200 L1280 320 Z" />
    </svg>
  );
}

// Pairs of eyes peeking from the edges. Fixed positions and timings
// so the server and the browser render the same thing.
const OJOS: { estilo: CSSProperties; duracion: number; demora: number }[] = [
  { estilo: { top: '26%', right: '4%' }, duracion: 11, demora: 0 },
  { estilo: { top: '62%', left: '5%' }, duracion: 17, demora: -6 },
  { estilo: { bottom: '12%', right: '9%' }, duracion: 23, demora: -13 },
];

function Ojos() {
  return (
    <div className="ojos" aria-hidden>
      {OJOS.map((o, i) => (
        <div
          key={i}
          className="par-ojos"
          style={{
            ...o.estilo,
            animationDuration: `${o.duracion}s`,
            animationDelay: `${o.demora}s`,
          }}
        >
          <span className="ojo" />
          <span className="ojo" />
        </div>
      ))}
    </div>
  );
}

// Office snake: a body of 16 segments following the same path, one after another.
// The path uses a 1000 x 600 viewBox and scales to the screen.
const RUTA_SERPIENTE = 'M -80 430 C 180 40, 360 580, 540 300 S 880 40, 1080 250';
const SEGMENTOS = Array.from({ length: 16 }, (_, i) => ({
  radio: i === 0 ? 20 : Math.max(6, 16 - i * 0.6),
  demora: i * 0.06,
}));

function Serpiente({ onFin }: { onFin: () => void }) {
  useEffect(() => {
    const t = setTimeout(onFin, 3400);
    return () => clearTimeout(t);
  }, [onFin]);

  return (
    <svg className="serpiente" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" aria-hidden>
      {SEGMENTOS.map((seg, i) => (
        <g key={i}>
          <circle
            r={seg.radio}
            className={i === 0 ? 'cabeza' : i % 2 ? 'cuerpo alterno' : 'cuerpo'}
          />
          {i === 0 && (
            <>
              <circle cx={-7} cy={-8} r={3.5} className="ojo-serpiente" />
              <circle cx={-7} cy={8} r={3.5} className="ojo-serpiente" />
            </>
          )}
          <animateMotion dur="2.4s" begin={`${seg.demora}s`} fill="freeze" path={RUTA_SERPIENTE} />
        </g>
      ))}
    </svg>
  );
}

// Lightning bolt from the left. Shown in a 13-second cycle.
function Trueno() {
  return (
    <div className="trueno" aria-hidden>
      <svg viewBox="0 0 120 400" preserveAspectRatio="xMidYMid meet">
        <path d="M74 0 L44 128 L80 128 L30 262 L66 262 L16 400" />
      </svg>
    </div>
  );
}

// Golden bat that flaps slowly, next to the footer
function Murcielago() {
  return (
    <svg className="murcielago" viewBox="0 0 64 32" aria-hidden>
      {/* Alas con borde festoneado, cuerpo y orejas puntiagudas */}
      <path d="M32 10 L28 13 C22 8 12 2 1 6 L5 11 L2 14 L8 14 L9 20 L14 17 L18 22 L24 19 L29 23 L32 19 L35 23 L40 19 L46 22 L50 17 L55 20 L56 14 L62 14 L59 11 L63 6 C52 2 42 8 36 13 Z" />
      <path d="M29.5 11 L28 3 L33 9 Z M34.5 11 L36 3 L31 9 Z" />
      <ellipse cx="32" cy="14" rx="3.2" ry="4.2" />
      <circle cx="30.6" cy="13" r="0.9" className="ojo-murcielago" />
      <circle cx="33.4" cy="13" r="0.9" className="ojo-murcielago" />
    </svg>
  );
}
