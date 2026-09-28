import { ArrayMaxSize, IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Difficulty } from '../../common/enums/difficulty.enum';
import { QuestionType } from '../../common/enums/question-type.enum';

export class ImportClassContentDto {
  @IsInt()
  @Min(1)
  sourceClassId: number;

  /** Secciones a traer. Sin este campo se trae todo el contenido de la clase de origen. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsInt({ each: true })
  sectionIds?: number[];
}

export class CopyActivityDto {
  @IsInt()
  @Min(1)
  learningUnitId: number;

  /** «Duplicar como variante»: el título lo dice y la copia queda en borrador para cambiarle los datos. */
  @IsOptional()
  @IsBoolean()
  variant?: boolean;
}

export class BankQueryDto {
  @IsOptional()
  @IsEnum(QuestionType)
  type?: QuestionType;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;
}
