import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { StireBaseEntity } from '../../common/entities/base.entity';
import { LearningUnit } from '../../learning-unit/entities/learning-unit.entity';

@Entity('prerequisites')
@Index(['targetUnitId', 'requiredUnitId'], { unique: true })
export class Prerequisite extends StireBaseEntity {
  @ManyToOne(() => LearningUnit, { eager: false, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'targetUnitId' })
  targetUnit: LearningUnit;

  @Column({ nullable: false })
  targetUnitId: number;

  @ManyToOne(() => LearningUnit, { eager: false, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requiredUnitId' })
  requiredUnit: LearningUnit;

  @Column({ nullable: false })
  requiredUnitId: number;

  @Column({ type: 'float', default: 60 })
  minMasteryRequired: number; // Porcentaje de dominio mínimo requerido en la unidad previa
}
