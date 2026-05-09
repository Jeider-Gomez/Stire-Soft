import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartSubmissionDto {
  @ApiProperty({ description: 'ID de la actividad a iniciar' })
  @IsInt()
  @IsNotEmpty()
  activityId: number;
}
