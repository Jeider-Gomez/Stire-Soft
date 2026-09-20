import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export const LOG_LEVEL_FILTERS = ['todos', 'error', 'warn', 'info'] as const;
export type LogLevelFilter = (typeof LOG_LEVEL_FILTERS)[number];

export class LogsQueryDto {
  @IsOptional()
  @IsIn(LOG_LEVEL_FILTERS, { message: 'level debe ser: todos, error, warn o info' })
  level?: LogLevelFilter;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit debe ser un entero' })
  @Min(1)
  @Max(500)
  limit?: number;
}
