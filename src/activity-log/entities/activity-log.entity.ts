import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum ActivityLogAction {
  CONTENT_READ = 'content_read',
  ACTIVITY_STARTED = 'activity_started',
  SUBMISSION_GRADED = 'submission_graded',
  UNIT_COMPLETED = 'unit_completed',
}

/**
 * Tabla de log de acciones del estudiante.
 * Vital para el Tutor IA: permite construir el contexto de comportamiento del estudiante.
 * Es un registro append-only (sin updates ni soft-deletes).
 */
@Entity('activity_logs')
@Index(['studentId', 'createdAt'])
@Index(['studentId', 'action'])
@Index(['referenceId', 'action'])
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false })
  studentId!: number;

  @Column({
    type: 'enum',
    enum: ActivityLogAction,
    nullable: false,
  })
  action!: ActivityLogAction;

  /**
   * ID de la entidad referenciada (contentId, activityId, submissionId)
   * Se almacena como string para soportar UUID y números.
   */
  @Column({ type: 'varchar', length: 100, nullable: false })
  referenceId!: string;

  /**
   * Tipo de entidad referenciada: 'content', 'activity', 'submission'
   */
  @Column({ type: 'varchar', length: 50, nullable: false })
  referenceType!: string;

  /**
   * Datos adicionales del contexto (learningUnitId, score, timeSpentSeconds, etc.)
   */
  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;
}
