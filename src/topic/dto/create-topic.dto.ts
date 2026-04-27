import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTopicDto {
  @IsString({ message: 'El título debe ser texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsNumber({}, { message: 'El classId debe ser un número' })
  @IsNotEmpty({ message: 'El classId es obligatorio' })
  classId!: number;
}
