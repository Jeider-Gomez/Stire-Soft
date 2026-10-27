import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MoverLeccionDto {
  @ApiProperty({ description: 'Tema de destino, de la misma clase', example: 8 })
  @IsInt()
  @Min(1)
  topicId!: number;
}
