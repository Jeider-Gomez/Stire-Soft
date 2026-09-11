import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

// El ValidationPipe global corre con whitelist:true + forbidNonWhitelisted:true
// (src/main.ts) -- learningUnitId llegaba por un @Query('learningUnitId')
// aparte, pero el binding @Query() paginationQuery: PaginationQueryDto ve el
// query string COMPLETO y rechazaba cualquier propiedad no declarada en el
// DTO, así que GET /activities?learningUnitId=X siempre devolvía 400
// ("property learningUnitId should not exist") pese a que el controller y el
// @ApiQuery lo documentan como un filtro válido.
export class FindActivitiesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  learningUnitId?: number;
}
