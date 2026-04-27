import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { EvaluationType } from '../entities/evaluation.entity';

export class CreateEvaluationDto {
  @IsString({ message: 'El título debe ser texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(EvaluationType, { message: 'El tipo debe ser: quiz, codigo, ejercicio o proyecto' })
  @IsOptional()
  type?: EvaluationType;

  @IsNumber({}, { message: 'El puntaje máximo debe ser un número' })
  @IsNotEmpty({ message: 'El puntaje máximo es obligatorio' })
  maxScore!: number;

  @IsNumber({}, { message: 'El learningUnitId debe ser un número' })
  @IsNotEmpty({ message: 'El learningUnitId es obligatorio' })
  learningUnitId!: number;
}
