import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { StireBaseEntity } from '../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { NotificationType } from '../../common/enums/notification-type.enum';

@Entity('notifications')
@Index('UQ_notifications_usuario_clave', ['userId', 'clave'], { unique: true })
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

  /** A dónde lleva al tocarla: la lección, la entrega, los repasos (ruta de la app). Null: solo se lee. */
  @Column({ type: 'varchar', length: 300, nullable: true })
  enlace: string | null;

  /** Impide repetirla: «modulo:12:75», «repasos:2026-10-07». Null: puede haber varias iguales (un mensaje, una nota). */
  @Column({ type: 'varchar', length: 120, nullable: true })
  clave: string | null;
}
