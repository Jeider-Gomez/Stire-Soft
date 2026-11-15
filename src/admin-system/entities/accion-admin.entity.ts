import { Column, Entity, Index } from 'typeorm';
import { StireBaseEntity } from '../../common/entities/base.entity';

/** Una acción hecha por un administrador sobre otra persona o sobre el sistema (quién, qué y sobre qué). */
@Entity('acciones_admin')
export class AccionAdmin extends StireBaseEntity {
  @Index()
  @Column({ type: 'int' })
  adminId: number;

  @Column({ type: 'varchar', length: 40 })
  accion: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  objetivoTipo: string | null;

  @Column({ type: 'int', nullable: true })
  objetivoId: number | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  detalle: string | null;
}
