import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateClassDto } from './create-class.dto';

// F24-09: el código de ingreso NO se edita (la pantalla ya lo declara de solo lectura): cambiarlo dejaría fuera a quien lo tenía
// y permitía chocar con el de otra clase (500 por la restricción UNIQUE). Enviarlo es un 400 (forbidNonWhitelisted).
export class UpdateClassDto extends PartialType(OmitType(CreateClassDto, ['code'] as const)) {}
