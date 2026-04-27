import { IsNumber, Min, Max } from 'class-validator';

export class UpdateMasteryDto {
  @IsNumber({}, { message: 'El mastery debe ser un número' })
  @Min(0, { message: 'El mastery mínimo es 0' })
  @Max(100, { message: 'El mastery máximo es 100' })
  mastery: number;
}
