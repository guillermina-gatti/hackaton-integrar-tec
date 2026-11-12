import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { CrearReclamoDto, TIPOS_RECLAMO } from './dto/crear-reclamo.dto';

// Real claims are saved here so they survive restarts (not the board samples)
const ARCHIVO = join(__dirname, '..', '..', 'data', 'reclamos.json');

// Priority by claim type
const PRIORIDADES: Record<string, number> = {
  susto: 1,
  'sombra robada': 1,
  frio: 2,
  ruido: 3,
};

export type Reclamo = {
  expediente: string;
  nombre: string; // "Anónimo" (display text) when filed anonymously
  anonimo: boolean;
  tipo: string;
  prioridad: number;
  plazoDias: number;
  reclamadoA: string | null;
  descripcion: string;
  creado: string;
  muestra: boolean; // true for board samples generated for demo purposes
};

type DatosReclamo = Pick<Reclamo, 'nombre' | 'anonimo' | 'tipo' | 'descripcion' | 'reclamadoA'>;

// Data for the board's random claims (display text stays in Spanish)
const NOMBRES = [
  'Lucía Niebla',
  'Tomás Cripta',
  'Mirta Velo',
  'Gonzo Trasgo',
  'Elena Cuervo',
  'Bruno Sepulcro',
  'Ana Sombra',
  'Ramiro Espectro',
  'Valentina Lúgubre',
  'Iván del Desván',
  'Carmela Ectoplasma',
  'Facu Brujo',
];

const RECLAMADOS = [
  'El Vecino del 3B',
  'La Hada de los Dientes',
  'El Gnomo de la Biblioteca',
  'El Gato del Ático',
  'Don Ruperto (el sereno)',
  'La Bruja del Kiosco',
  'El Espejo del baño',
  'Mi tía abuela Olga',
  'El Cartero de Medianoche',
];

const DESCRIPCIONES: Record<string, string[]> = {
  susto: [
    'Me asusté al abrir la heladera a las 3 a.m.',
    'Un susto tan grande que se me cayó el celular.',
    'Apareció detrás de la cortina del baño sin avisar.',
  ],
  'sombra robada': [
    'Mi sombra se fue al cine sin avisar.',
    'Me quedé sin sombra en pleno mediodía.',
    'Mi sombra salió a bailar y no volvió.',
  ],
  frio: [
    'Una brisa helada en pleno verano, sin ventana abierta.',
    'Frío sospechoso dentro de la casa, bajo las mantas.',
    'Mi taza de café quedó congelada en un segundo.',
  ],
  ruido: [
    'Cadenas a medianoche y nadie en el pasillo.',
    'Golpes en la pared a las 2 a.m., todas las noches.',
    'Un llanto lejano que no supe de dónde venía.',
  ],
};

// Maximum number of claims kept on the board
const MAX_TABLERO = 200;

const azar = <T>(lista: readonly T[]): T => lista[Math.floor(Math.random() * lista.length)];

@Injectable()
export class ReclamosService {
  // Last file number used. Resets when the server restarts.
  private ultimoExpediente = 0;

  // Submitted claims, newest first. Kept in memory, like the file counter.
  private readonly reclamos: Reclamo[] = [];

  constructor() {
    this.cargarGuardados();
  }

  // Loads claims saved in a previous run and continues the file numbering
  private cargarGuardados() {
    try {
      if (!existsSync(ARCHIVO)) return;

      const guardados = JSON.parse(readFileSync(ARCHIVO, 'utf8')) as Reclamo[];
      this.reclamos.push(...guardados.filter((r) => !r.muestra));

      for (const r of this.reclamos) {
        const numero = Number(r.expediente.replace('FANT-', ''));
        if (numero > this.ultimoExpediente) this.ultimoExpediente = numero;
      }
    } catch (error) {
      console.error('Could not read saved claims, starting empty:', error);
    }
  }

  // Writes the real claims to disk after each submission
  private guardar() {
    try {
      mkdirSync(dirname(ARCHIVO), { recursive: true });
      writeFileSync(
        ARCHIVO,
        JSON.stringify(this.reclamos.filter((r) => !r.muestra), null, 2),
      );
    } catch (error) {
      console.error('Could not save claims to disk:', error);
    }
  }

  listar(): Reclamo[] {
    return this.reclamos;
  }

  registrar(dto: CrearReclamoDto) {
    const anonimo = dto.anonimo ?? false;
    const nombre = anonimo ? 'Anónimo' : (dto.nombre?.trim() ?? '');

    if (!nombre) {
      throw new BadRequestException(
        'Claimant name is required (or mark the claim as anonymous).',
      );
    }

    const reclamo = this.crear({
      nombre,
      anonimo,
      tipo: dto.tipo,
      descripcion: dto.descripcion.trim(),
      reclamadoA: dto.reclamadoA?.trim() || null,
    }, false);

    this.guardar();

    const { expediente, prioridad, plazoDias } = reclamo;
    const contra = reclamo.reclamadoA ? ` | Claimed against: ${reclamo.reclamadoA}` : '';

    return {
      expediente,
      prioridad,
      plazoDias,
      comprobante: `File ${expediente} | ${nombre} | Priority ${prioridad} | Resolution in ${plazoDias === 1 ? '1 day' : `${plazoDias} days`}${contra} | Signed: The Ghost`,
    };
  }

  generarAleatorios(cantidad: number): Reclamo[] {
    const generados: Reclamo[] = [];

    for (let i = 0; i < cantidad; i++) {
      const tipo = azar(TIPOS_RECLAMO);
      const anonimo = Math.random() < 0.35;

      generados.push(
        this.crear({
          nombre: anonimo ? 'Anónimo' : azar(NOMBRES),
          anonimo,
          tipo,
          descripcion: azar(DESCRIPCIONES[tipo]),
          reclamadoA: Math.random() < 0.7 ? azar(RECLAMADOS) : null,
        }, true),
      );
    }

    return generados;
  }

  private crear(datos: DatosReclamo, muestra: boolean): Reclamo {
    this.ultimoExpediente += 1;

    const expediente = `FANT-${String(this.ultimoExpediente).padStart(4, '0')}`;
    const prioridad = PRIORIDADES[datos.tipo];
    const plazoDias = prioridad === 1 ? 1 : prioridad === 2 ? 3 : 7;

    const reclamo: Reclamo = {
      expediente,
      ...datos,
      prioridad,
      plazoDias,
      creado: new Date().toISOString(),
      muestra,
    };

    this.reclamos.unshift(reclamo);
    this.reclamos.splice(MAX_TABLERO);

    return reclamo;
  }
}
