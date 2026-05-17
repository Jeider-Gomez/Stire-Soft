import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { StireBaseEntity } from '../../common/entities/base.entity';
import { LearningUnit } from '../../learning-unit/entities/learning-unit.entity';
import { ContentType } from '../../common/enums/content-type.enum';

@Entity('contents')
@Index(['learningUnitId', 'order'])
export class Content extends StireBaseEntity {
  // FK → LearningUnit
  @ManyToOne(() => LearningUnit, (unit) => unit.contents, {
    eager: false,
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'learningUnitId' })
  learningUnit!: LearningUnit;

  @Column({ nullable: false })
  learningUnitId!: number;

  @Column({ nullable: false })
  title!: string;

  @Column({
    type: 'enum',
    enum: ContentType,
    nullable: false,
  })
  type!: ContentType;

  /**
   * Contenido principal: texto Markdown, HTML, código fuente, etc.
   * Para VIDEO/PDF/IMAGE, se deja null y se usa metadata.
   */
  @Column({ type: 'longtext', nullable: true })
  body?: string;

  /**
   * Metadatos adicionales (JSON):
   * VIDEO: { url, duration, provider }
   * PDF:   { url, pages }
   * IMAGE: { url, alt, width, height }
   * CODE:  { language, filename }
   */
  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'int', default: 0 })
  order!: number;

  @Column({ default: true })
  isVisible!: boolean;
}
