import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { EvaluationType } from '../entities/evaluation.entity';
import { Difficulty } from '../../common/enums/difficulty.enum';

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

  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
