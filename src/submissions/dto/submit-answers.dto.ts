import { IsInt, IsNotEmpty, IsObject, ValidateNested, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerItemDto {
  @IsInt()
  @IsNotEmpty()
  questionId: number;

  @IsObject()
  @IsNotEmpty()
  answer: Record<string, any>;
}

export class SubmitAnswersDto {
  @ApiProperty({ description: 'Respuestas enviadas por el estudiante' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  answers: AnswerItemDto[];
  
  @ApiProperty({ description: 'Tiempo invertido en la actividad (segundos)', required: false })
  @IsOptional()
  @IsInt()
  timeSpentSeconds?: number;
}
