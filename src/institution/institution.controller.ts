import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { InstitutionService } from './institution.service';

@Controller()
export class InstitutionController {
  constructor(private readonly institutionService: InstitutionService) {}

  @Get('institutions')
  findAllInstitutions() {
    return this.institutionService.findAllInstitutions();
  }

  @Post('institutions')
  createInstitution(@Body() body: { name: string }) {
    return this.institutionService.createInstitution(body);
  }

  @Get('programs')
  findAllPrograms(@Query('institutionId') institutionId: string) {
    return this.institutionService.findAllPrograms(institutionId ? +institutionId : undefined);
  }

  @Post('programs')
  createProgram(@Body() body: { name: string; maxSemesters: number; institutionId: number }) {
    return this.institutionService.createProgram(body);
  }
}
