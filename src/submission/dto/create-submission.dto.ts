import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateSubmissionDto {
  @IsNumber({}, { message: 'El evaluationId debe ser un número' })
  @IsNotEmpty({ message: 'El evaluationId es obligatorio' })
  evaluationId!: number;

  @IsNumber({}, { message: 'El score debe ser un número' })
  @Min(0, { message: 'El score no puede ser negativo' })
  @IsNotEmpty({ message: 'El score es obligatorio' })
  score!: number;

  @IsString()
  @IsOptional()
  answers?: string;
}
