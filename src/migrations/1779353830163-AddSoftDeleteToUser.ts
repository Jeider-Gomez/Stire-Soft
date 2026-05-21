import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSoftDeleteToUser1779353830163 implements MigrationInterface {
    name = 'AddSoftDeleteToUser1779353830163'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` ADD `deletedAt` timestamp(6) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `deletedAt`");
    }
}
