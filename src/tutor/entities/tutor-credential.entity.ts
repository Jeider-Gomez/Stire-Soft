import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { StireBaseEntity } from '../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';

/** Clave de Google AI Studio del propio estudiante, cifrada en reposo (ver TutorKeyCryptoService). */
@Entity('tutor_credentials')
@Index(['studentId'], { unique: true })
export class TutorCredential extends StireBaseEntity {
  @ManyToOne(() => User, { eager: false, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column({ nullable: false })
  studentId: number;

  @Column({ type: 'text', nullable: false })
  encryptedKey: string;

  @Column({ type: 'varchar', length: 4, nullable: false })
  keyLast4: string;
}
