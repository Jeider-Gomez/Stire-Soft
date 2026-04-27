import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TopicService } from './topic.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('topic')
@UseGuards(JwtAuthGuard)
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  /**
   * Crear un topic (solo docentes)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('docente')
  create(@Body() createDto: CreateTopicDto, @GetUser() user: User) {
    return this.topicService.create(createDto, user.id);
  }

  /**
   * Obtener topics de una clase
   */
  @Get('class/:classId')
  findByClass(@Param('classId') classId: string) {
    return this.topicService.findByClass(+classId);
  }

  /**
   * Obtener un topic con sus unidades
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.topicService.findOne(+id);
  }

  /**
   * Actualizar un topic (docente/admin)
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  update(@Param('id') id: string, @Body() updateDto: UpdateTopicDto) {
    return this.topicService.update(+id, updateDto);
  }

  /**
   * Desactivar un topic (docente/admin)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  remove(@Param('id') id: string) {
    return this.topicService.remove(+id);
  }
}
