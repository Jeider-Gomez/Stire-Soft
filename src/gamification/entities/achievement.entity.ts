import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { StireBaseEntity } from '../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity('achievements')
export class Achievement extends StireBaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: false })
  iconUrl: string;

  @Column({ type: 'int', default: 10 })
  points: number;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'unlockedById' })
  unlockedBy: User;

  @Column({ nullable: true })
  unlockedById: number;
}
