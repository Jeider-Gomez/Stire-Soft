import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Enrollment } from '../../enrollment/entities/enrollment.entity';
import { Section } from '../../section/entities/section.entity';
import { Asignatura } from '../../institution/entities/asignatura.entity';

/** Con quién se comparte el contenido de una clase, de lo más cercano a lo más amplio. */
export const ALCANCES_PLANTILLA = ['nadie', 'asignatura', 'programa', 'facultad', 'institucion', 'todos'] as const;
export type AlcancePlantilla = (typeof ALCANCES_PLANTILLA)[number];

@Entity('classes')
@Index(['teacherId'])
export class Class {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ unique: true, nullable: false })
  code!: string;

  // Relación ManyToOne: Un docente puede tener muchas clases
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'teacherId' })
  teacher!: User;

  @Column()
  teacherId!: number;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  requiresApproval!: boolean;

  /**
   * El docente comparte el CONTENIDO de esta clase como plantilla: otros docentes pueden copiarlo a sus propias clases
   * (docs/DISENO_CLASES_Y_DOCENTES.md). Se copia, nunca se enlaza; los estudiantes, entregas y notas no se comparten.
   */
  @Column({ default: false })
  compartidaComoPlantilla!: boolean;

  /**
   * Con quién se comparte el contenido (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md §2.3). `compartidaComoPlantilla` queda
   * como resumen (alcance distinto de «nadie») para lo que ya lo usaba.
   */
  @Column({ type: 'varchar', length: 20, default: 'nadie' })
  alcancePlantilla!: AlcancePlantilla;

  /** El enfoque de esta plantilla en una línea: «Con JavaScript, según el plan de clase», «Solo pseudocódigo». */
  @Column({ type: 'varchar', length: 160, nullable: true })
  enfoque?: string | null;

  /** Cuántas veces otros docentes copiaron este contenido: una señal de que sirve. */
  @Column({ type: 'int', default: 0 })
  vecesCopiada!: number;

  /** Logros y medallas en esta clase (docs/DISENO_LOGROS.md §6). Activados por defecto: no hay que configurar nada. */
  @Column({ default: true })
  logrosActivos!: boolean;

  /** Categorías de logros que usa la clase, separadas por coma; vacío = todas. */
  @Column({ type: 'varchar', length: 120, nullable: true })
  categoriasLogro?: string | null;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'int', nullable: true })
  maxStudents?: number;

  /**
   * Bloqueo suave por módulo (MOD-01 y UI-02 de la lista de chequeo de Sistemas Tutores): el módulo siguiente se abre
   * cuando el dominio promedio del anterior llega a este porcentaje. 0 = sin bloqueo. Lo que el estudiante ya empezó
   * nunca se bloquea. El docente lo cambia en Ajustes de la clase.
   */
  @Column({ type: 'int', default: 50 })
  dominioParaAvanzar!: number;

  /**
   * Motor del dominio (docs/DISENO_DOMINIO.md): con el límite de intentos usado, cada cuántas horas se reabre UN intento
   * (1 a 168). Nunca «cerrado para siempre»: así ninguna lección queda sin forma de llegar al 100 %.
   */
  @Column({ type: 'int', default: 24 })
  horasParaReabrir!: number;

  /** Si los niveles altos pesan más en el dominio de la lección (básico 1, intermedio 1,5, avanzado 2). Opcional. */
  @Column({ type: 'boolean', default: false })
  nivelesPesanDistinto!: boolean;

  /**
   * Qué enseña esta clase y para quién (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md). Opcional: sin asignatura la clase
   * funciona igual. De ella salen la institución, el programa y el semestre que muestra la barra superior.
   */
  @ManyToOne(() => Asignatura, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'asignaturaId' })
  asignatura?: Asignatura | null;

  @Column({ type: 'int', nullable: true })
  asignaturaId?: number | null;

  /** Periodo académico («2026-2»). */
  @Column({ type: 'varchar', length: 20, nullable: true })
  periodo?: string | null;

  /** Grupo o sección («Grupo 2»). */
  @Column({ type: 'varchar', length: 40, nullable: true })
  grupo?: string | null;

  // Relación OneToMany: Una clase tiene muchas inscripciones (Enrollment)
  @OneToMany(() => Enrollment, (enrollment) => enrollment.class, { eager: false })
  enrollments!: Enrollment[];

  // Relación OneToMany: Una clase tiene muchas secciones/módulos
  @OneToMany(() => Section, (section) => section.class, { eager: false })
  sections!: Section[];

  // Propiedad virtual para mantener compatibilidad con el frontend
  students?: User[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
