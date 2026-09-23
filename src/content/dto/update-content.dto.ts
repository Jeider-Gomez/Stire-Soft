import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateContentDto } from './create-content.dto';

// `learningUnitId` fuera: la propiedad solo se verificaba en el origen.
export class UpdateContentDto extends PartialType(OmitType(CreateContentDto, ['learningUnitId'] as const)) {}
