import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { StireBaseEntity } from '../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity('tutor_conversations')
@Index(['studentId'])
export class TutorConversation extends StireBaseEntity {
  @ManyToOne(() => User, { eager: false, nullable: false })
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column({ nullable: false })
  studentId: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  role: 'user' | 'assistant' | 'system';

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>; // detectedTopic, emotion, etc.
}
