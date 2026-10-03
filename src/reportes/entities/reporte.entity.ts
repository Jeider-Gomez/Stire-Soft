import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { EstadoReporte, TipoReporte } from '../reporte-reglas';

/**
 * Lo que un usuario reporta desde la app («Reportar»): un problema, algo confuso o una idea, con la pantalla donde
 * estaba. Pensado para la prueba con el equipo (docs/calidad/PRUEBA_DOS_SEMANAS.md) y para después.
 */
@Entity('reportes')
@Index(['estado'])
@Index(['userId'])
export class Reporte {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'int' })
  userId!: number;

  @Column({ type: 'varchar', length: 20 })
  rol!: string;

  @Column({ type: 'varchar', length: 12 })
  tipo!: TipoReporte;

  /** 1 detalle · 2 confunde · 3 no me deja seguir; null en una idea. */
  @Column({ type: 'tinyint', nullable: true })
  gravedad!: number | null;

  @Column({ type: 'text' })
  texto!: string;

  /** Pantalla donde estaba (ruta de la app); la anota la app sola. */
  @Column({ type: 'varchar', length: 300 })
  ruta!: string;

  /** «375×800 · Mozilla/5.0 (Linux; Android…)»: para reproducir problemas de pantalla. */
  @Column({ type: 'varchar', length: 300, default: '' })
  dispositivo!: string;

  /** La clase en la que estaba («Fundamentos de Algoritmia (ALGO-WEB-570)»): con dos cursos cruzados, separa los resultados. */
  @Column({ type: 'varchar', length: 160, default: '' })
  clase!: string;

  @Column({ type: 'varchar', length: 10, default: 'nuevo' })
  estado!: EstadoReporte;

  /**
   * Pantallazo opcional (una imagen de media_files). El id no sale del servidor: solo quien envió la sugerencia y el
   * admin lo ven, por GET /reportes/:id/captura.
   */
  @Column({ type: 'varchar', length: 36, nullable: true })
  capturaId!: string | null;

  /** Nota del admin al revisarlo («arreglado», «no se reproduce»); la ve quien lo reportó. */
  @Column({ type: 'text', nullable: true })
  nota!: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
