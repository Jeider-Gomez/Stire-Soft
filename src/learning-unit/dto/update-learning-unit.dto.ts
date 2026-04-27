import { PartialType } from '@nestjs/mapped-types';
import { CreateLearningUnitDto } from './create-learning-unit.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateLearningUnitDto extends PartialType(CreateLearningUnitDto) {
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  @IsOptional()
  isActive?: boolean;
}
