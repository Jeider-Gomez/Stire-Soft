import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { EvaluationType } from '../entities/evaluation.entity';

export class UpdateEvaluationDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(EvaluationType)
  @IsOptional()
  type?: EvaluationType;

  @IsNumber()
  @IsOptional()
  maxScore?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
