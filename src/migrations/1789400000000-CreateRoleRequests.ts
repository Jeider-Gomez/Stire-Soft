import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoleRequests1789400000000 implements MigrationInterface {
  name = 'CreateRoleRequests1789400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `role_requests` (' +
        '`id` int NOT NULL AUTO_INCREMENT, ' +
        '`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
        '`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, ' +
        '`deletedAt` timestamp NULL, ' +
        '`userId` int NOT NULL, ' +
        "`requestedRole` varchar(20) NOT NULL DEFAULT 'docente', " +
        "`status` varchar(20) NOT NULL DEFAULT 'pending', " +
        '`reason` varchar(300) NULL, ' +
        '`reviewedById` int NULL, ' +
        '`reviewedAt` timestamp NULL, ' +
        '`reviewNote` varchar(300) NULL, ' +
        'INDEX `IDX_role_requests_status` (`status`), ' +
        'INDEX `IDX_role_requests_user` (`userId`), ' +
        'PRIMARY KEY (`id`), ' +
        'CONSTRAINT `FK_role_requests_user` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION' +
        ') ENGINE=InnoDB',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `role_requests`');
  }
}
