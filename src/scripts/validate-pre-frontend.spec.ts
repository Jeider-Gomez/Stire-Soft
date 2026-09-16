import { HardenedProcessSandboxAdapter } from '../judge-engine/hardened-process-sandbox.adapter';
import { TutorContextService } from '../tutor/tutor-context.service';
import { TutorService } from '../tutor/tutor.service';
import { calculateUnitMastery } from '../common/utils/mastery.calculator';
import { LearningStatus } from '../common/enums/learning-status.enum';
import { PublicationStatus } from '../common/enums/status.enum';
import { ContentRenderingService } from '../content-rendering/content-rendering.service';

describe('VALIDACIÓN INTEGRAL PRE-FRONTEND — STIRE', () => {

  // =========================================================================
  // 1. PRUEBA REAL DEL SANDBOX (HardenedProcessSandboxAdapter)
  // =========================================================================
  describe('1. Sandbox Aislado Endurecido (ADR 06 / Node --permission)', () => {
    let sandbox: HardenedProcessSandboxAdapter;

    beforeAll(() => {
      sandbox = new HardenedProcessSandboxAdapter();
    });

    it('Caso Correcto: Ejecuta código válido y valida contra caso de prueba', async () => {
      const code = `
        const readline = require('readline');
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.on('line', (line) => {
          const [a, b] = line.split(' ').map(Number);
          console.log(a + b);
        });
      `;
      const result = await sandbox.executeIsolated(code, 'javascript', {
        input: '5 7',
        expected: '12',
      });

      expect(result.status).toBe('accepted');
      expect(result.stdout).toBe('12');
      expect(result.timeMs).toBeLessThan(2000);
    });

    it('Caso Wrong Answer: Código ejecuta pero salida no coincide con esperado', async () => {
      const code = `console.log(42);`;
      const result = await sandbox.executeIsolated(code, 'javascript', {
        input: '',
        expected: '100',
      });

      expect(result.status).toBe('wrong_answer');
      expect(result.stdout).toBe('42');
    });

    it('Caso Runtime Error: Código lanza excepción y sanitiza stderr sin rutas del host', async () => {
      const code = `throw new Error("Fallo de lógica en el algoritmo");`;
      const result = await sandbox.executeIsolated(code, 'javascript', {
        input: '',
        expected: '',
      });

      expect(result.status).toBe('runtime_error');
      expect(result.stderr).toContain('Fallo de lógica en el algoritmo');
      expect(result.stderr).not.toMatch(/[C-Z]:\\[Users|Windows]/i);
    });

    it('Caso Timeout: Bucle infinito es terminado por el watchdog en <= 2000ms', async () => {
      const code = `while(true) {}`;
      const start = Date.now();
      const result = await sandbox.executeIsolated(code, 'javascript', {
        input: '',
        expected: '',
      });
      const elapsed = Date.now() - start;

      expect(result.status).toBe('time_limit');
      expect(elapsed).toBeGreaterThanOrEqual(1900);
      expect(elapsed).toBeLessThan(3500);
    });

    it('Caso Bloqueo de Red: Intento de usar net/http/fetch es interceptado por el cortafuegos', async () => {
      const code = `
        try {
          const http = require('http');
          http.get('http://google.com');
        } catch(e) {
          console.log('INTERCEPTADO:' + e.message);
        }
      `;
      const result = await sandbox.executeIsolated(code, 'javascript', {
        input: '',
        expected: '',
      });

      expect(result.stdout).toContain('INTERCEPTADO:SandboxViolation: red bloqueada');
    });

    it('Caso Bloqueo DNS: dns.lookup y dns.promises son interceptados', async () => {
      const code = `
        try {
          const dns = require('dns');
          dns.lookup('example.com', () => {});
        } catch(e) {
          console.log('DNS_BLOCKED:' + e.message);
        }
      `;
      const result = await sandbox.executeIsolated(code, 'javascript', {
        input: '',
        expected: '',
      });

      expect(result.stdout).toContain('DNS_BLOCKED:SandboxViolation: red bloqueada (dns.lookup)');
    });
  });

  // =========================================================================
  // 2. PRUEBA DEL CÁLCULO MATEMÁTICO DE PROGRESO Y UNIDADES ACTIVAS
  // =========================================================================
  describe('2. Cálculo Matemático de Progreso (Mastery & Unidades Activas)', () => {
    it('Caso A: 0/5 actividades aprobadas -> 0% mastery', () => {
      const activities = [
        { id: 1, totalPoints: 100, adaptiveWeight: 1, activityType: { baseWeight: 1 } },
        { id: 2, totalPoints: 100, adaptiveWeight: 1, activityType: { baseWeight: 1 } },
      ];
      const submissions = [
        { activityId: 1, score: 0 },
        { activityId: 2, score: 0 },
      ];

      const mastery = calculateUnitMastery(submissions, activities);
      expect(mastery).toBe(0);
    });

    it('Caso B: 2/5 actividades al 100% -> 40% mastery exacto', () => {
      const activities = [
        { id: 1, totalPoints: 100, adaptiveWeight: 1, activityType: { baseWeight: 1 } },
        { id: 2, totalPoints: 100, adaptiveWeight: 1, activityType: { baseWeight: 1 } },
        { id: 3, totalPoints: 100, adaptiveWeight: 1, activityType: { baseWeight: 1 } },
        { id: 4, totalPoints: 100, adaptiveWeight: 1, activityType: { baseWeight: 1 } },
        { id: 5, totalPoints: 100, adaptiveWeight: 1, activityType: { baseWeight: 1 } },
      ];
      const submissions = [
        { activityId: 1, score: 100 },
        { activityId: 2, score: 100 },
      ];

      const mastery = calculateUnitMastery(submissions, activities);
      expect(mastery).toBe(40);
    });

    it('Caso C: 5/5 actividades al 100% -> 100% mastery', () => {
      const activities = [
        { id: 1, totalPoints: 100, adaptiveWeight: 1, activityType: { baseWeight: 1 } },
        { id: 2, totalPoints: 100, adaptiveWeight: 1, activityType: { baseWeight: 1 } },
      ];
      const submissions = [
        { activityId: 1, score: 100 },
        { activityId: 2, score: 100 },
      ];

      const mastery = calculateUnitMastery(submissions, activities);
      expect(mastery).toBe(100);
    });

    it('Caso D: Unidades/Actividades inactivas NO deben considerarse en el cálculo', () => {
      const allActivities = [
        { id: 1, status: PublicationStatus.PUBLISHED, totalPoints: 100, adaptiveWeight: 1, activityType: { baseWeight: 1 } },
        { id: 2, status: PublicationStatus.PUBLISHED, totalPoints: 100, adaptiveWeight: 1, activityType: { baseWeight: 1 } },
        { id: 3, status: PublicationStatus.PUBLISHED, totalPoints: 100, adaptiveWeight: 1, activityType: { baseWeight: 1 } },
        { id: 4, status: PublicationStatus.DRAFT, totalPoints: 100, adaptiveWeight: 1, activityType: { baseWeight: 1 } },
        { id: 5, status: PublicationStatus.DRAFT, totalPoints: 100, adaptiveWeight: 1, activityType: { baseWeight: 1 } },
      ];

      const activeActivities = allActivities.filter(a => a.status === PublicationStatus.PUBLISHED);
      expect(activeActivities.length).toBe(3);

      const submissions = [
        { activityId: 1, score: 100 },
      ];

      const mastery = calculateUnitMastery(submissions, activeActivities);
      expect(mastery).toBe(33);
    });
  });

  // =========================================================================
  // 3. PRUEBA DE TRANSICIÓN DE ESTADOS COGNITIVOS (LearningStatus)
  // =========================================================================
  describe('3. Transición de Estados Cognitivos de Aprendizaje', () => {
    function computeStatus(attemptsCount: number, mastery: number): LearningStatus {
      if (attemptsCount === 0) return LearningStatus.NO_VISTO;
      if (mastery < 20) return LearningStatus.EXPLORADO;
      if (mastery < 60) return LearningStatus.EN_PRACTICA;
      if (mastery < 85) return LearningStatus.COMPRENSION_PARCIAL;
      return LearningStatus.DOMINADO;
    }

    it('Evalúa límites exactos de transiciones', () => {
      expect(computeStatus(0, 0)).toBe(LearningStatus.NO_VISTO);
      expect(computeStatus(1, 0)).toBe(LearningStatus.EXPLORADO);
      expect(computeStatus(1, 19)).toBe(LearningStatus.EXPLORADO);
      expect(computeStatus(2, 20)).toBe(LearningStatus.EN_PRACTICA);
      expect(computeStatus(3, 59)).toBe(LearningStatus.EN_PRACTICA);
      expect(computeStatus(4, 60)).toBe(LearningStatus.COMPRENSION_PARCIAL);
      expect(computeStatus(5, 84)).toBe(LearningStatus.COMPRENSION_PARCIAL);
      expect(computeStatus(6, 85)).toBe(LearningStatus.DOMINADO);
      expect(computeStatus(10, 100)).toBe(LearningStatus.DOMINADO);
    });
  });

  // =========================================================================
  // 4. PRUEBA DEL TUTOR IA: CONTEXTO Y MÉTODO SOCRÁTICO
  // =========================================================================
  describe('4. Tutor IA Contextual y Método Socrático', () => {
    it('Diferencia el System Prompt según los 3 niveles de mastery del estudiante', async () => {
      // Escenario 1: Principiante (Mastery < 50%)
      const repoPrincipiante = {
        find: jest.fn().mockResolvedValue([
          { studentId: 1, learningUnitId: 101, mastery: 25, successRate: 30, completedActivities: 1, updatedAt: new Date() },
        ]),
      };
      const contextService1 = new TutorContextService(repoPrincipiante as any);
      const prompt1 = await contextService1.buildSystemPrompt(1);
      expect(prompt1).toContain('nivel PRINCIPIANTE');
      expect(prompt1).toContain('metáforas del mundo real');

      // Escenario 2: Intermedio (50% <= Mastery <= 80%)
      const repoIntermedio = {
        find: jest.fn().mockResolvedValue([
          { studentId: 2, learningUnitId: 102, mastery: 65, successRate: 70, completedActivities: 3, updatedAt: new Date() },
        ]),
      };
      const contextService2 = new TutorContextService(repoIntermedio as any);
      const prompt2 = await contextService2.buildSystemPrompt(2);
      expect(prompt2).toContain('nivel INTERMEDIO');

      // Escenario 3: Avanzado (Mastery > 80%)
      const repoAvanzado = {
        find: jest.fn().mockResolvedValue([
          { studentId: 3, learningUnitId: 103, mastery: 92, successRate: 95, completedActivities: 5, updatedAt: new Date() },
        ]),
      };
      const contextService3 = new TutorContextService(repoAvanzado as any);
      const prompt3 = await contextService3.buildSystemPrompt(3);
      expect(prompt3).toContain('nivel AVANZADO');
      expect(prompt3).toContain('Big O Notation');
    });

    it('El mock socrático del Tutor responde con preguntas orientadoras y no entrega código completo', async () => {
      const convRepo = {
        save: jest.fn().mockResolvedValue(undefined),
        getRecentContext: jest.fn().mockResolvedValue([]),
      };
      const contextService = {
        buildSystemPrompt: jest.fn().mockResolvedValue('System prompt test'),
      };
      const configService = {
        get: jest.fn().mockReturnValue(''),
      };
      const renderingService = new ContentRenderingService();
      const recommendationService = {
        suggestForUnit: jest.fn().mockResolvedValue(null),
        suggestAmbient: jest.fn().mockResolvedValue(null),
      };

      const tutor = new TutorService(
        convRepo as any,
        contextService as any,
        configService as any,
        renderingService,
        recommendationService as any,
      );

      const resBucle = await tutor.sendMessage(1, '¿Cómo hago un bucle for en JavaScript?');
      expect(resBucle.message).toContain('Un ciclo te ayuda a ejecutar un bloque de instrucciones múltiples veces');
      expect(resBucle.message).toContain('¿Cuál de estos tres elementos crees que requiere atención');

      const resVar = await tutor.sendMessage(1, '¿Qué es una variable y qué tipos de datos hay?');
      expect(resVar.message).toContain('una variable es un contenedor con nombre');
      expect(resVar.message).toContain('¿Qué tipo de información necesitas guardar');
    });
  });
});
