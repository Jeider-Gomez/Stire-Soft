import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Organización académica (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md): tipo y sigla de la institución, facultad y tipo del
 * programa, la tabla de asignaturas y, en la clase, su asignatura, periodo y grupo. Todo opcional: las clases de hoy no
 * cambian. Deja precargado el programa para el que se hace STIRE: Licenciatura en Informática, Universidad de Córdoba.
 */
export class AddOrganizacionAcademica1791600000000 implements MigrationInterface {
  name = 'AddOrganizacionAcademica1791600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `institutions` ADD `sigla` varchar(40) NULL, ADD `tipo` varchar(20) NOT NULL DEFAULT 'universidad'");
    await queryRunner.query("ALTER TABLE `programs` ADD `tipo` varchar(20) NOT NULL DEFAULT 'carrera', ADD `facultad` varchar(150) NULL");
    await queryRunner.query(
      'CREATE TABLE `asignaturas` (' +
        '`id` int NOT NULL AUTO_INCREMENT, `nombre` varchar(150) NOT NULL, `codigo` varchar(30) NULL, `periodoPlan` int NULL, ' +
        '`programId` int NULL, `institutionId` int NULL, `creadaPorId` int NULL, ' +
        '`createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), ' +
        'INDEX `IDX_asignaturas_nombre` (`nombre`), PRIMARY KEY (`id`), ' +
        'CONSTRAINT `FK_asignaturas_program` FOREIGN KEY (`programId`) REFERENCES `programs`(`id`) ON DELETE SET NULL, ' +
        'CONSTRAINT `FK_asignaturas_institution` FOREIGN KEY (`institutionId`) REFERENCES `institutions`(`id`) ON DELETE SET NULL' +
        ') ENGINE=InnoDB',
    );
    await queryRunner.query(
      'ALTER TABLE `classes` ADD `asignaturaId` int NULL, ADD `periodo` varchar(20) NULL, ADD `grupo` varchar(40) NULL, ' +
        'ADD CONSTRAINT `FK_classes_asignatura` FOREIGN KEY (`asignaturaId`) REFERENCES `asignaturas`(`id`) ON DELETE SET NULL',
    );

    // Catálogo inicial (si ya existe, como en el seed local, solo se completa).
    await queryRunner.query(
      "INSERT INTO `institutions` (`name`, `sigla`, `tipo`) SELECT 'Universidad de Córdoba', 'Unicórdoba', 'universidad' " +
        "FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `institutions` WHERE `name` = 'Universidad de Córdoba')",
    );
    await queryRunner.query("UPDATE `institutions` SET `sigla` = 'Unicórdoba' WHERE `name` = 'Universidad de Córdoba' AND `sigla` IS NULL");
    await queryRunner.query(
      "INSERT INTO `programs` (`name`, `maxSemesters`, `tipo`, `facultad`, `institutionId`) " +
        "SELECT 'Licenciatura en Informática', 10, 'carrera', 'Facultad de Educación y Ciencias Humanas', i.`id` FROM `institutions` i " +
        "WHERE i.`name` = 'Universidad de Córdoba' AND NOT EXISTS " +
        "(SELECT 1 FROM `programs` p WHERE p.`name` = 'Licenciatura en Informática' AND p.`institutionId` = i.`id`)",
    );
    await queryRunner.query(
      "INSERT INTO `asignaturas` (`nombre`, `codigo`, `periodoPlan`, `programId`, `institutionId`) " +
        "SELECT 'Fundamentos de Algoritmia', '203413', 3, p.`id`, p.`institutionId` FROM `programs` p " +
        "WHERE p.`name` = 'Licenciatura en Informática' AND NOT EXISTS " +
        "(SELECT 1 FROM `asignaturas` a WHERE a.`nombre` = 'Fundamentos de Algoritmia' AND a.`programId` = p.`id`)",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `classes` DROP FOREIGN KEY `FK_classes_asignatura`');
    await queryRunner.query('ALTER TABLE `classes` DROP COLUMN `grupo`, DROP COLUMN `periodo`, DROP COLUMN `asignaturaId`');
    await queryRunner.query('DROP TABLE `asignaturas`');
    await queryRunner.query('ALTER TABLE `programs` DROP COLUMN `facultad`, DROP COLUMN `tipo`');
    await queryRunner.query('ALTER TABLE `institutions` DROP COLUMN `tipo`, DROP COLUMN `sigla`');
  }
}
