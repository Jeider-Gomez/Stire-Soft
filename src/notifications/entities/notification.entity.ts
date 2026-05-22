import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { StireBaseEntity } from '../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { NotificationType } from '../../common/enums/notification-type.enum';

@Entity('notifications')
export class Notification extends StireBaseEntity {
  @ManyToOne(() => User, { eager: false, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  message: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.INFO,
  })
  type: NotificationType;
}
