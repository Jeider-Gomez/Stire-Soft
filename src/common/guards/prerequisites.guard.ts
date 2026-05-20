import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { PrerequisitesService } from '../../prerequisites/prerequisites.service';
import { LearningProgressService } from '../../learning-progress/learning-progress.service';

@Injectable()
export class PrerequisitesGuard implements CanActivate {
  constructor(
    private readonly prerequisitesService: PrerequisitesService,
    private readonly learningProgressService: LearningProgressService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Asumimos que el ID de la unidad objetivo viene en los parámetros de la ruta (e.g. /learning-unit/:id)
    const targetUnitId = parseInt(request.params.id, 10);

    // Si no hay usuario o id válido, delegamos a otros guards/pipes
    if (!user || !user.id || isNaN(targetUnitId)) {
      return true; 
    }

    // Docentes y admins no están sujetos a prerrequisitos académicas
    if (user.role !== 'estudiante') {
      return true;
    }

    const studentId = user.id;

    // 1. Consultar los requisitos de la unidad objetivo
    const prerequisites = await this.prerequisitesService.getPrerequisitesForUnit(targetUnitId);
    
    // Si no tiene requisitos, retornamos true
    if (!prerequisites || prerequisites.length === 0) {
      return true;
    }

    // 2. Consultar el progreso del estudiante usando el método optimizado
    const requiredUnitIds = prerequisites.map(p => p.requiredUnitId);
    const progresses = await this.learningProgressService.findForUnits(studentId, requiredUnitIds);

    // 3. Verificar si cumple con el minMasteryRequired
    const missingUnits: any[] = [];

    for (const prereq of prerequisites) {
      const progress = progresses.find(p => p.learningUnitId === prereq.requiredUnitId);
      const currentMastery = progress ? progress.mastery : 0;

      if (currentMastery < prereq.minMasteryRequired) {
        missingUnits.push({
          unitId: prereq.requiredUnitId,
          title: prereq.requiredUnit?.title || `Unidad ${prereq.requiredUnitId}`,
          requiredMastery: prereq.minMasteryRequired,
          currentMastery: currentMastery,
        });
      }
    }

    if (missingUnits.length > 0) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Prerequisites not met',
        error: 'FORBIDDEN',
        details: { missingUnits },
      });
    }

    return true;
  }
}
