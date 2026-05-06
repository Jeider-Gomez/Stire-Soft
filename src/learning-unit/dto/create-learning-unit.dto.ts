import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Difficulty } from '../../common/enums/difficulty.enum';

export class CreateLearningUnitDto {
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  title!: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  description?: string;

  @IsEnum(Difficulty, { message: 'La dificultad debe ser: basico, intermedio o avanzado' })
  @IsOptional()
  difficulty?: Difficulty;

  @IsNumber({}, { message: 'El orden debe ser un número' })
  @IsOptional()
  order?: number;

  @IsNumber({}, { message: 'El topicId debe ser un número' })
  @IsOptional()
  topicId?: number;
}
