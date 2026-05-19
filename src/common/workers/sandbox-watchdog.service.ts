import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import Docker = require('dockerode');

@Injectable()
export class SandboxWatchdogService {
  private readonly logger = new Logger(SandboxWatchdogService.name);
  private docker: Docker;

  constructor() {
    this.docker = new Docker(); // Asume que el daemon de Docker está disponible localmente o vía env vars
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async cleanupStaleSandboxes() {
    this.logger.debug('Iniciando escaneo de contenedores sandbox huérfanos...');
    try {
      // Filtrar contenedores usando el label específico del sandbox
      const containers = await this.docker.listContainers({
        all: true,
        filters: JSON.stringify({
          label: ['stire-sandbox=true'],
        }),
      });

      const now = Date.now();
      let removedCount = 0;

      for (const containerInfo of containers) {
        // containerInfo.Created está en segundos (unix timestamp)
        const createdAtMs = containerInfo.Created * 1000;
        const ageMs = now - createdAtMs;

        if (ageMs > 60000) { // Mayor a 60 segundos
          this.logger.warn(`Detectado sandbox obsoleto (Age: ${ageMs}ms): ${containerInfo.Id}. Procediendo a eliminar.`);
          
          const container = this.docker.getContainer(containerInfo.Id);
          
          try {
            // Intentar detener si está corriendo
            if (containerInfo.State === 'running') {
              await container.stop();
            }
            // Remover el contenedor forzosamente
            await container.remove({ force: true });
            removedCount++;
            this.logger.log(`Contenedor ${containerInfo.Id} eliminado exitosamente.`);
          } catch (err) {
            this.logger.error(`Error al eliminar contenedor ${containerInfo.Id}: ${err.message}`, err.stack);
          }
        }
      }

      if (removedCount > 0) {
        this.logger.log(`Limpieza finalizada. ${removedCount} contenedores sandbox eliminados.`);
      }
    } catch (error) {
      this.logger.error(`Fallo crítico al escanear contenedores Docker: ${error.message}`, error.stack);
    }
  }
}
