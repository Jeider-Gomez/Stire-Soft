import { DataSource, EntityTarget } from 'typeorm';

export function createTestDataSource(entities: EntityTarget<any>[]) {
  return new DataSource({
    type: 'sqlite',
    database: ':memory:',
    synchronize: true,
    dropSchema: true,
    logging: false,
    entities,
  });
}
