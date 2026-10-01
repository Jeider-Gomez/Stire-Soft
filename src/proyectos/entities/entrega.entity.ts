import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Difficulty } from '../../common/enums/difficulty.enum';
import type { ArchivoProyecto } from '../proyecto-reglas';
import type { TipoEntrega } from '../entrega-reglas';

/**
 * Un espacio de entrega que el docente crea en su clase (docs/DISENO_INTERVENCION_DOCENTE.md §3 y §10). Puede estar en
 * una lección (y contar para su dominio) o ser una nota suelta de la materia.
 */
@Entity('entregas')
@Index(['classId'])
@Index(['learningUnitId'])
export class Entrega {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'int' })
  classId!: number;

  /** Lección a la que pertenece; null = entrega de la materia, sin lección. */
  @Column({ type: 'int', nullable: true })
  learningUnitId!: number | null;

  @Column({ type: 'varchar', length: 150 })
  titulo!: string;

  @Column({ type: 'text' })
  consigna!: string;

  /** Qué se entrega: 'web', 'javascript' o 'cualquiera'. */
  @Column({ type: 'varchar', length: 20, default: 'cualquiera' })
  tipoProyecto!: TipoEntrega;

  /** Código inicial: «Empezar desde la plantilla» crea el proyecto del estudiante con estos archivos. */
  @Column({ type: 'json', nullable: true })
  plantilla!: ArchivoProyecto[] | null;

  @Column({ type: 'timestamp', nullable: true })
  abreAt!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  cierraAt!: Date | null;

  @Column({ default: true })
  aceptaTarde!: boolean;

  @Column({ type: 'int', default: 3 })
  maxVersiones!: number;

  /** Si el docente pone nota (0,0 a 5,0) además del comentario. */
  @Column({ default: false })
  conNota!: boolean;

  /** La nota cuenta como evidencia en el dominio de la lección (exige lección y nota). */
  @Column({ default: false })
  cuentaParaDominio!: boolean;

  @Column({ type: 'enum', enum: Difficulty, default: Difficulty.BASICO })
  dificultad!: Difficulty;

  @Column({ default: false })
  publicada!: boolean;

  /** Solo para estos estudiantes; null = toda la clase. */
  @Column({ type: 'json', nullable: true })
  asignadaA!: number[] | null;

  @Column({ type: 'int' })
  createdBy!: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
