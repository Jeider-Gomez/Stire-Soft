import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordReset1789600000000 implements MigrationInterface {
  name = 'AddPasswordReset1789600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Momento del último cambio de contraseña: los JWT emitidos antes dejan de valer.
    await queryRunner.query('ALTER TABLE `users` ADD `passwordChangedAt` timestamp NULL');
    await queryRunner.query(
      'CREATE TABLE `password_reset_tokens` (' +
        '`id` int NOT NULL AUTO_INCREMENT, ' +
        '`userId` int NOT NULL, ' +
        '`tokenHash` char(64) NOT NULL, ' +
        '`expiresAt` timestamp NOT NULL, ' +
        '`usedAt` timestamp NULL, ' +
        '`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
        'UNIQUE INDEX `IDX_password_reset_tokenHash` (`tokenHash`), ' +
        'INDEX `IDX_password_reset_userId` (`userId`), ' +
        'PRIMARY KEY (`id`), ' +
        'CONSTRAINT `FK_password_reset_user` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE' +
        ') ENGINE=InnoDB',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `password_reset_tokens`');
    await queryRunner.query('ALTER TABLE `users` DROP COLUMN `passwordChangedAt`');
  }
}
