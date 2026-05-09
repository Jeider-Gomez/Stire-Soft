import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { EnrollmentService } from '../enrollment/enrollment.service';
import { LearningProgressService } from '../learning-progress/learning-progress.service';

@Controller('class')
@UseGuards(JwtAuthGuard)
export class ClassController {
  constructor(
    private readonly classService: ClassService,
    @Inject(forwardRef(() => EnrollmentService))
    private readonly enrollmentService: EnrollmentService,
    @Inject(forwardRef(() => LearningProgressService))
    private readonly learningProgressService: LearningProgressService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('docente')
  create(@Body() createClassDto: CreateClassDto, @GetUser() user: User) {
    return this.classService.create(createClassDto, user.id);
  }

  @Post('join')
  @UseGuards(RolesGuard)
  @Roles('estudiante')
  joinClass(@Body('code') code: string, @GetUser() user: User) {
    return this.enrollmentService.joinClass(user.id, code);
  }

  @Get()
  findAll() {
    return this.classService.findAll();
  }

  @Get('my-classes')
  @UseGuards(RolesGuard)
  @Roles('docente', 'estudiante')
  async findMyClasses(@GetUser() user: User) {
    if (user.role === 'docente') {
      return this.classService.findByTeacher(user.id);
    } else {
      // Estudiante
      const enrollments = await this.enrollmentService.findByStudent(user.id);
      const results: any[] = [];
      for (const enr of enrollments) {
        const progress = await this.learningProgressService.getClassProgress(user.id, enr.classId);
        results.push({
          classId: enr.classId,
          className: enr.class.name,
          teacherName: enr.class.teacher?.fullName,
          enrollmentStatus: enr.status,
          progress,
          lastActivityAt: enr.lastActivityAt,
        });
      }
      return results;
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('docente')
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto, @GetUser() user: User) {
    return this.classService.update(+id, updateClassDto, user.id);
  }

  @Get(':id/students')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  async getStudents(@Param('id') id: string) {
    const enrollments = await this.enrollmentService.findByClass(+id);
    const results: any[] = [];
    for (const enr of enrollments) {
      const progress = await this.learningProgressService.getClassProgress(enr.studentId, +id);
      
      // Calculate basic riskLevel based on activity and progress (for now a simple heuristic)
      let riskLevel = 'LOW';
      if (enr.status === 'active') {
        const inactiveDays = enr.lastActivityAt ? (new Date().getTime() - enr.lastActivityAt.getTime()) / (1000 * 3600 * 24) : 30;
        if (progress < 40 && inactiveDays > 14) riskLevel = 'HIGH';
        else if (progress < 60 || inactiveDays > 7) riskLevel = 'MEDIUM';
      }

      results.push({
        studentId: enr.studentId,
        name: enr.student.fullName,
        enrollmentStatus: enr.status,
        joinedAt: enr.joinedAt,
        progress,
        lastActivityAt: enr.lastActivityAt,
        riskLevel,
      });
    }
    return results;
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  remove(@Param('id') id: string) {
    return this.classService.remove(+id);
  }
}
