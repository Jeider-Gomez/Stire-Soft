import { Entity, Column } from 'typeorm';
import { StireBaseEntity } from '../../common/entities/base.entity';

@Entity('activity_types')
export class ActivityType extends StireBaseEntity {
  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  code: string;

  @Column({ type: 'boolean', default: true })
  autoGradable: boolean;

  @Column({ type: 'float', default: 1.0 })
  baseWeight: number;

  @Column({ type: 'json', nullable: true })
  configSchema: Record<string, any>;
}
