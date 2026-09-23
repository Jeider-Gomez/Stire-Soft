import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateSectionDto } from './create-section.dto';

// `classId` fuera: mover un módulo a otra clase no es una función y la propiedad
// solo se verificaba en el ORIGEN (se podía mover a la clase de otro docente).
export class UpdateSectionDto extends PartialType(OmitType(CreateSectionDto, ['classId'] as const)) {}
