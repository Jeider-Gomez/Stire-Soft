import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { Class } from '../../class/entities/class.entity';
import { User } from '../../user/entities/user.entity';
import { EnrollmentStatus } from '../enums/enrollment-status.enum';

@Entity('enrollments')
@Unique(['classId', 'studentId'])
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  classId!: number;

  @Column()
  studentId!: number;

  @Column({ type: 'enum', enum: EnrollmentStatus, default: EnrollmentStatus.ACTIVE })
  status!: EnrollmentStatus;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt!: Date;

  @Column({ name: 'left_at', type: 'timestamp', nullable: true })
  leftAt?: Date;

  @Column({ name: 'last_activity_at', type: 'timestamp', nullable: true })
  lastActivityAt?: Date;

  @ManyToOne(() => Class, (cls) => cls.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classId' })
  class!: Class;

  @ManyToOne(() => User, (user) => user.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student!: User;
}
