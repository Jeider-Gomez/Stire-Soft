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

  // Imagen adjunta (media_files): solo la ven el remitente y el destinatario, por GET /message/:id/imagen.
  @Column({ type: 'varchar', length: 36, nullable: true })
  imagenId!: string | null;

  // Cuándo el remitente editó el texto por última vez; la bandeja muestra «Editado».
  @Column({ type: 'datetime', nullable: true })
  editadoEn!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}
