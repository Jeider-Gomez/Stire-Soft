import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { Paso, TipoRefuerzo } from '../refuerzo-reglas';

/**
 * Un refuerzo o un reto que el docente asigna a uno o varios estudiantes (docs/DISENO_INTERVENCION_DOCENTE.md §4 y
 * §10.4): una secuencia corta de pasos que cuenta en una o varias lecciones, con el dominio de partida guardado para ver
 * después si funcionó.
 */
@Entity('refuerzos')
@Index(['classId'])
export class Refuerzo {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'int' })
  classId!: number;

  @Column({ type: 'varchar', length: 10 })
  tipo!: TipoRefuerzo;

  @Column({ type: 'varchar', length: 150 })
  titulo!: string;

  /** Lo que el docente le dice al estudiante; también se le envía como mensaje. */
  @Column({ type: 'text', nullable: true })
  mensaje!: string | null;

  /** Lecciones en las que cuenta: sus ejercicios y entregas son evidencia del dominio de esas lecciones. */
  @Column({ type: 'json' })
  learningUnitIds!: number[];

  @Column({ type: 'json' })
  estudiantes!: number[];

  @Column({ type: 'json' })
  pasos!: Paso[];

  @Column({ type: 'timestamp', nullable: true })
  fechaLimite!: Date | null;

  /** Dominio de cada estudiante en cada lección al crearse: { [studentId]: { [learningUnitId]: dominio } }. */
  @Column({ type: 'json' })
  dominioInicial!: Record<string, Record<string, number>>;

  @Column({ default: false })
  archivado!: boolean;

  @Column({ type: 'int' })
  createdBy!: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
