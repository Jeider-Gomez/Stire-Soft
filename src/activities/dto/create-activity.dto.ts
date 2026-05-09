import { IsString, IsNotEmpty, IsInt, IsOptional, IsEnum, Min, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Difficulty } from '../../common/enums/difficulty.enum';

export class CreateActivityDto {
  @ApiProperty({ description: 'ID de la Unidad de Aprendizaje a la que pertenece' })
  @IsInt()
  @IsNotEmpty()
  learningUnitId: number;

  @ApiProperty({ description: 'ID del tipo de actividad' })
  @IsInt()
  @IsNotEmpty()
  activityTypeId: number;

  @ApiProperty({ description: 'Título de la actividad' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Descripción de la actividad' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Nivel de dificultad', enum: Difficulty })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiPropertyOptional({ description: 'Puntos totales que otorga', default: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalPoints?: number;

  @ApiPropertyOptional({ description: 'Puntuación mínima para aprobar', default: 60 })
  @IsOptional()
  @IsInt()
  @Min(0)
  passingScore?: number;

  @ApiPropertyOptional({ description: 'Intentos permitidos', default: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  attemptsAllowed?: number;

  @ApiPropertyOptional({ description: 'Límite de tiempo en minutos' })
  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimit?: number;

  @ApiPropertyOptional({ description: 'Orden en la unidad', default: 0 })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiPropertyOptional({ description: 'Si es obligatoria', default: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: 'Peso adaptativo', default: 1.0 })
  @IsOptional()
  @IsNumber()
  adaptiveWeight?: number;
}
