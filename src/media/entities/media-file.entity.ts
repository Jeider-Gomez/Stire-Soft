import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

/**
 * Imagen subida por un docente para sus lecciones. Se guarda en la base de datos (no en una carpeta del servidor) para
 * que la copia diaria (deploy/backup-db.sh) la incluya sin pasos extra; con 1 MB por imagen y 50 MB por docente, el
 * tamaño es manejable. El id es un UUID: la dirección de la imagen no se puede adivinar recorriendo números.
 */
@Entity('media_files')
@Index(['ownerId'])
export class MediaFile {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ type: 'int' })
  ownerId!: number;

  @Column({ type: 'varchar', length: 40 })
  mimeType!: string;

  @Column({ type: 'int' })
  sizeBytes!: number;

  /** No se trae en las consultas normales (listas, cuotas): solo al servir la imagen. */
  @Column({ type: 'mediumblob', select: false })
  data!: Buffer;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
