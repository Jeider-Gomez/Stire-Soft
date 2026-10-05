import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsObject, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResponderSusDto {
  @ApiProperty({ description: 'Las 10 respuestas, de 1 (muy en desacuerdo) a 5 (muy de acuerdo), en orden', type: [Number] })
  @IsArray()
  @ArrayMinSize(10)
  @ArrayMaxSize(10)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(5, { each: true })
  respuestas!: number[];

  @ApiProperty({ description: '¿Qué cambiarías primero? (opcional)', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comentario?: string;

  @ApiProperty({
    description: 'Facilidad de las tareas de su rol: { clave: 1 (muy difícil) a 7 (muy fácil) }; sin la clave o null = no la ha hecho (src/usabilidad/sus.ts)',
    required: false,
  })
  @IsOptional()
  @IsObject()
  tareas?: Record<string, unknown>;
}
