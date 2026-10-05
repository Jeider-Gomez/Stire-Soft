import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type TipoEventoEntrega = 'enviada' | 'revisada' | 'nota_cambiada' | 'valoracion_cambiada' | 'comentario_editado' | 'revision_borrada' | 'reabierta';

/**
 * Historial de una entrega (docs/DISENO_INTERVENCION_DOCENTE.md §3.4): quién hizo qué y cuándo. Nada se sobrescribe sin
 * dejar rastro; es lo que da confianza si un estudiante reclama una nota.
 */
@Entity('entrega_eventos')
@Index(['entregaId', 'studentId'])
export class EntregaEvento {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'int' })
  entregaId!: number;

  @Column({ type: 'int' })
  studentId!: number;

  @Column({ type: 'int', nullable: true })
  envioId!: number | null;

  @Column({ type: 'varchar', length: 30 })
  tipo!: TipoEventoEntrega;

  /** Por ejemplo { version: 2, tarde: true } o { antes: 4, despues: 4.5 }. */
  @Column({ type: 'json', nullable: true })
  detalle!: Record<string, unknown> | null;

  /** Quién lo hizo: el estudiante al enviar, el docente al revisar o reabrir. */
  @Column({ type: 'int' })
  actorId!: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
