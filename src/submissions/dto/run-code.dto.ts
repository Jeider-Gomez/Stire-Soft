import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RunCodeDto {
  @ApiProperty({ description: 'Código fuente a ejecutar contra los casos públicos' })
  @IsString()
  @IsNotEmpty()
  code: string;
}
