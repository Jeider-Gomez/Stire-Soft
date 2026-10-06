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
import { Class } from '../../class/entities/class.entity';
import { Topic } from '../../topic/entities/topic.entity';

@Entity('sections')
@Index(['classId'])
export class Section {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int', default: 0 })
  order!: number;

  @Column({ default: false })
  isPublished!: boolean;

  /** Archivado (Fase 30): guarda todo, no se ve para el estudiante y se puede restaurar. Archivar también lo despublica. */
  @Column({ default: true })
  isActive!: boolean;

  // N secciones pertenecen a 1 clase
  @ManyToOne(() => Class, (cls) => cls.sections, {
    eager: false,
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'classId' })
  class!: Class;

  @Column({ nullable: false })
  classId!: number;

  // 1 sección tiene N topics
  @OneToMany(() => Topic, (topic) => topic.section, { eager: false })
  topics!: Topic[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
