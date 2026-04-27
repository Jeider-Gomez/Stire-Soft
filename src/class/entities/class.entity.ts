import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('classes')
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

  // Relación ManyToMany: Una clase puede tener muchos estudiantes
  @ManyToMany(() => User, { eager: false })
  @JoinTable({
    name: 'class_students',
    joinColumn: { name: 'classId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'studentId', referencedColumnName: 'id' },
  })
  students!: User[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
