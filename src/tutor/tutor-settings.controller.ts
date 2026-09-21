import { Body, Controller, Get, Param, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../user/entities/user.entity';
import { UpdateTutorSettingsDto } from './dto/tutor-settings.dto';
import { TutorSettingsService } from './tutor-settings.service';

/** Configuración del Tutor por el docente (o el administrador) para su clase, una unidad o una actividad. */
@ApiTags('AI Tutor')
@ApiBearerAuth()
@Controller('tutor/settings')
export class TutorSettingsController {
  constructor(private readonly settingsService: TutorSettingsService) {}

  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @Get(':scopeType/:scopeId')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({
    summary: 'Configuración del Tutor de un ámbito (class | unit | activity): valores propios (null = hereda) y valores efectivos',
  })
  get(@Param('scopeType') scopeType: string, @Param('scopeId', ParseIntPipe) scopeId: number, @GetUser() user: User) {
    return this.settingsService.getForTeacher(user, scopeType, scopeId);
  }

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Put(':scopeType/:scopeId')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({
    summary: 'Configura el Tutor de un ámbito: activar/desactivar, tope de ayuda (1-3) y estilo. Enviar null vuelve a heredar',
  })
  update(
    @Param('scopeType') scopeType: string,
    @Param('scopeId', ParseIntPipe) scopeId: number,
    @Body() body: UpdateTutorSettingsDto,
    @GetUser() user: User,
  ) {
    return this.settingsService.updateForTeacher(user, scopeType, scopeId, body);
  }
}
