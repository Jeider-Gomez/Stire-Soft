import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Institution } from './institution.entity';
import { Program } from './program.entity';

/**
 * Una asignatura o curso (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md): lo que una clase enseña. Tres formas, todas válidas:
 * - de un programa: «Fundamentos de Algoritmia», Licenciatura en Informática, 3.er semestre;
 * - de una institución, sin programa: una electiva libre de la universidad o un curso de extensión;
 * - libre, sin institución: un curso que un docente dicta por su cuenta.
 * La crea cualquier docente desde «Nueva clase»; el admin solo une duplicados.
 */
@Entity('asignaturas')
@Index(['nombre'])
@Index('IDX_asignaturas_ambito_nombre', ['ambito', 'nombreNormalizado'], { unique: true })
export class Asignatura {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  nombre!: string;

  /** Código del plan de estudios (p. ej. 203413), si lo tiene. */
  @Column({ type: 'varchar', length: 30, nullable: true })
  codigo!: string | null;

  /** Semestre o grado del plan en que va (3 = 3.er semestre o grado 3.°), si va en uno. */
  @Column({ type: 'int', nullable: true })
  periodoPlan!: number | null;

  @ManyToOne(() => Program, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'programId' })
  program!: Program | null;

  @Column({ type: 'int', nullable: true })
  programId!: number | null;

  @ManyToOne(() => Institution, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'institutionId' })
  institution!: Institution | null;

  @Column({ type: 'int', nullable: true })
  institutionId!: number | null;

  @Column({ type: 'int', nullable: true })
  creadaPorId!: number | null;

  /**
   * Orden del catálogo (§2.2.1 del diseño). El nombre normalizado (normalizar.ts) y el ámbito («p:7», «i:1» o «libre»)
   * forman un índice único: dos asignaturas iguales no pueden existir en el mismo lugar.
   */
  @Column({ length: 150 })
  nombreNormalizado!: string;

  @Column({ length: 20 })
  ambito!: string;

  /** Del plan de estudios, o confirmada por el admin: sale primero y marcada. La agregada por un docente funciona igual. */
  @Column({ default: false })
  oficial!: boolean;

  /** Nombres normalizados de las asignaturas que se unieron a esta, separados por «|»: quien busca el viejo la encuentra. */
  @Column({ type: 'varchar', length: 600, nullable: true })
  sinonimos!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
