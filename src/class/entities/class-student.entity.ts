import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  CreateDateColumn,
} from 'typeorm';
import { Class } from './class.entity';
import { User } from '../../user/entities/user.entity';

@Entity('class_students')
export class ClassStudent {
  @PrimaryColumn({ name: 'classId' })
  classId!: number;

  @PrimaryColumn({ name: 'studentId' })
  studentId!: number;

  @CreateDateColumn({ name: 'registration_date' })
  registrationDate!: Date;

  @ManyToOne(() => Class, (cls) => cls.classStudents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classId' })
  class!: Class;

  @ManyToOne(() => User, (user) => user.classStudents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student!: User;
}
