import { Body, Controller, Get, Param, ParseIntPipe, Optional, Patch, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../user/entities/user.entity';
import { DecideRoleRequestDto, RoleRequestsQueryDto } from './dto/role-request.dto';
import { RoleRequestsService } from './role-requests.service';
import { AccionesAdminService } from '../admin-system/acciones-admin.service';

@Controller('role-requests')
export class RoleRequestsController {
  constructor(
    private readonly service: RoleRequestsService,
    @Optional() private readonly acciones?: AccionesAdminService,
  ) {}

  // Cualquier usuario autenticado ve solo la suya (el id sale del JWT, nunca de la URL).
  @Roles('estudiante', 'docente', 'admin')
  @Get('me')
  findMine(@GetUser() user: User) {
    return this.service.findMine(user.id).then((request) => ({ request }));
  }

  @Roles('admin')
  @Get()
  list(@Query() query: RoleRequestsQueryDto) {
    return this.service.list(query.status);
  }

  // Decidir una solicitud cambia el rol de una persona: solo admin y con límite propio.
  @Roles('admin')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Patch(':id')
  async decide(@Param('id', ParseIntPipe) id: number, @Body() dto: DecideRoleRequestDto, @GetUser() admin: User) {
    const r = await this.service.decide(id, dto, admin.id);
    await this.acciones?.registrar({ adminId: admin.id, accion: 'decidir_solicitud', objetivoTipo: 'solicitud_rol', objetivoId: id, detalle: String(dto.decision) });
    return r;
  }
}
