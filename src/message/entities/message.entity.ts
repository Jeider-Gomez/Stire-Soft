import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  // Quien envía el mensaje
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'senderId' })
  sender!: User;

  @Column()
  senderId!: number;

  // Quien recibe el mensaje
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'receiverId' })
  receiver!: User;

  @Column()
  receiverId!: number;

  // Contenido del mensaje
  @Column({ type: 'text' })
  content!: string;

  // Si fue leído
  @Column({ default: false })
  isRead!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
