import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTutorCredentials1789200000000 implements MigrationInterface {
  name = 'CreateTutorCredentials1789200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `tutor_credentials` (' +
        '`id` int NOT NULL AUTO_INCREMENT, ' +
        '`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
        '`updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, ' +
        '`deletedAt` timestamp(6) NULL, ' +
        '`studentId` int NOT NULL, ' +
        '`encryptedKey` text NOT NULL, ' +
        '`keyLast4` varchar(4) NOT NULL, ' +
        'UNIQUE INDEX `IDX_tutor_credentials_studentId` (`studentId`), ' +
        'PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'ALTER TABLE `tutor_credentials` ADD CONSTRAINT `FK_tutor_credentials_studentId` ' +
        'FOREIGN KEY (`studentId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `tutor_credentials` DROP FOREIGN KEY `FK_tutor_credentials_studentId`');
    await queryRunner.query('DROP INDEX `IDX_tutor_credentials_studentId` ON `tutor_credentials`');
    await queryRunner.query('DROP TABLE `tutor_credentials`');
  }
}
