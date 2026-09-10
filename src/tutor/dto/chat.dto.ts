import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChatContextDto {
  learningUnitId?: number;
  unitTitle?: string;
  activityId?: number;
  activityTitle?: string;
  currentCode?: string;
  currentRoute?: string;
}

export class ChatDto {
  @IsString({ message: 'El mensaje debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El mensaje es obligatorio' })
  message: string;

  @IsOptional()
  classId?: number;

  @IsOptional()
  context?: ChatContextDto;
}
