import { Entity, Column, Index } from 'typeorm';
import { StireBaseEntity } from '../../common/entities/base.entity';
import type { TutorSettingScope } from '../tutor-settings';

/** Configuración del Tutor por ámbito (clase, unidad o actividad). Campos nulos = hereda del ámbito superior. */
@Entity('tutor_settings')
@Index(['scopeType', 'scopeId'], { unique: true })
export class TutorSetting extends StireBaseEntity {
  @Column({ type: 'varchar', length: 20, nullable: false })
  scopeType: TutorSettingScope;

  @Column({ type: 'int', nullable: false })
  scopeId: number;

  @Column({ type: 'boolean', nullable: true })
  enabled: boolean | null;

  @Column({ type: 'tinyint', nullable: true })
  maxGuideLevel: number | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  style: string | null;
}
