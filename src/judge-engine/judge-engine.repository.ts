import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ExecutionResult } from './entities/execution-result.entity';

@Injectable()
export class ExecutionResultsRepository extends Repository<ExecutionResult> {
  constructor(private dataSource: DataSource) {
    super(ExecutionResult, dataSource.createEntityManager());
  }
}
