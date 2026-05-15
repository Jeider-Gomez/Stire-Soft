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
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('class')
@UseGuards(JwtAuthGuard)
export class ClassController {
  constructor(
    private readonly classService: ClassService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('docente')
  create(@Body() createClassDto: CreateClassDto, @GetUser() user: User) {
    return this.classService.create(createClassDto, user.id);
  }

  @Get()
  findAll() {
    return this.classService.findAll();
  }

  @Get('my-classes')
  @UseGuards(RolesGuard)
  @Roles('docente', 'estudiante')
  findMyClasses(@GetUser() user: User) {
    if (user.role === 'docente') {
      return this.classService.findByTeacher(user.id);
    }
    return this.classService.findAll(); // Estudiante: ver clases disponibles
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('docente')
  update(
    @Param('id') id: string,
    @Body() updateClassDto: UpdateClassDto,
    @GetUser() user: User,
  ) {
    return this.classService.update(+id, updateClassDto, user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  remove(@Param('id') id: string) {
    return this.classService.remove(+id);
  }
}
