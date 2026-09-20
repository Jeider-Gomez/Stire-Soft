export type Role = 'estudiante' | 'docente' | 'administrador' | 'admin'

export interface User {
  id: number
  email: string
  fullName: string
  role: Role
}

export type UnitStatus = 'dominado' | 'en-progreso' | 'por-iniciar' | 'bloqueado'

export interface LearningUnit {
  id: number
  moduleId: number
  moduleTitle: string
  title: string
  description: string
  order: number
  status: UnitStatus
  masteryPercentage: number
  contentMarkdown?: string
  exerciseActivityId?: number
  activities?: Array<{
    id: number
    title: string
    adaptiveWeight?: number
    totalPoints?: number
    activityType?: {
      code: string
      name?: string
    }
  }>
}

export interface CourseModule {
  id: number
  title: string
  order: number
  units: LearningUnit[]
}

export type ReviewUrgency = 'al-dia' | 'manana' | 'vencido' | 'critico'

export interface SpacedReviewItem {
  id: number
  conceptTitle: string
  moduleTitle: string
  urgency: ReviewUrgency
  urgencyLabel: string
  easeFactor: number
  intervalDays: number
  nextReviewDate: string
  estimatedTimeMin: number
}

export interface StudentAnalytics {
  avgMastery: number
  avgSuccessRate: number
  reviewStats: {
    pending: number
    total: number
    critical: number
  }
  streakDays: number
  completedExercises: number
  masteryByUnit: Array<{
    unitId: number
    unitTitle: string
    mastery: number
    status: UnitStatus
  }>
}

export interface TestCase {
  id: number
  input: string
  expectedOutput: string
  actualOutput?: string
  isPublic: boolean
  passed?: boolean
}

export interface SubmissionAnswer {
  questionId: number
  code: string
}

// Debe coincidir con src/common/enums/submission-status.enum.ts (backend)
export type SubmissionStatus = 'in_progress' | 'submitted' | 'graded' | 'expired'

export interface SubmissionResult {
  submissionId: string
  totalScore: number
  /** Puntaje máximo real de la actividad (activity.totalPoints) — nunca asumir 100. */
  maxScore?: number
  /** true/false una vez calificado; null mientras la evaluación asíncrona (CODING) está pendiente. */
  passed?: boolean | null
  passedCount: number
  totalCount: number
  status: SubmissionStatus
  feedback?: string
  testCaseResults?: Array<{
    id: number
    passed: boolean
    input: string
    expected: string
    actual: string
  }>
}

export interface TutorSuggestedActivity {
  activityId: number
  activityTitle: string
  learningUnitId: number
  learningUnitTitle: string
  reason: 'repaso_vencido' | 'mastery_bajo' | 'contexto_actual'
  reasonMessage: string
}

export interface TutorMessage {
  id: string
  sender: 'student' | 'tutor'
  text: string
  /** Nivel de guía real del backend (§18.4). null = fuera de una actividad. */
  guidanceLevel?: 1 | 2 | 3 | null
  timestamp: string
  suggestedActivity?: TutorSuggestedActivity | null
  /** true si este mensaje es un error de red/HTTP — muestra botón Reintentar. */
  isError?: boolean
  /** true si el error fue 403 (docente desactivó Tutor) — NO mostrar Reintentar. */
  is403?: boolean
}

/** Respuesta de GET /tutor/api-key */
export interface TutorApiKey {
  success: boolean
  hasKey: boolean
  last4: string | null
}

/** Respuesta de GET /tutor/guidance (§21.2) */
export interface TutorGuidance {
  success: boolean
  guidanceLevel: 1 | 2 | 3 | null
  tutorEnabled: boolean
  maxGuideLevel: 1 | 2 | 3 | null
  dueReviews: {
    overdueCount: number
    scheduledCount: number
    oldest: {
      learningUnitId: number
      learningUnitTitle: string | null
      daysOverdue: number
    } | null
  } | null
  contentLink: {
    learningUnitId: number
    title: string
  } | null
}

export type TutorStyle = 'equilibrado' | 'motivador' | 'tecnico' | 'breve'

/** Respuesta de GET /PUT /tutor/settings/:scopeType/:scopeId */
export interface TutorSettings {
  scopeType: 'class' | 'unit' | 'activity'
  scopeId: number
  own: {
    enabled: boolean | null
    maxGuideLevel: 1 | 2 | 3 | null
    style: TutorStyle | null
  }
  effective: {
    enabled: boolean
    maxGuideLevel: 1 | 2 | 3
    style: TutorStyle
  }
}

/** Respuesta de GET /admin/system/status (§21.2) */
export interface SystemStatus {
  generatedAt: string
  api: {
    version: string
    nodeVersion: string
    environment: string
    uptimeSeconds: number
    memory: { rssMb: number; heapUsedMb: number }
    requests: {
      sampled: number
      windowSeconds: number | null
      p50Ms: number | null
      p95Ms: number | null
      serverErrorRatePct: number | null
    }
  }
  database: { ok: boolean; latencyMs: number | null }
  sandbox: {
    adapter: string
    timeoutMs: number
    maxHeapMb: number
    maxOutputKb: number
    executionsLast24h: number | null
    avgExecutionMs: number | null
  }
  judgeQueue: { driver: 'inline' | 'redis'; submissionsInProgress: number | null }
  tutor: {
    provider: string
    model: string
    studentsWithKey: number | null
    studentMessagesLast24h: number | null
  }
  users: { total: number; byRole: Record<string, number> } | null
  submissionsLast24h: number | null
}

/** Respuesta de GET /admin/system/logs (§21.2) */
export interface SystemLogs {
  entries: Array<{
    timestamp: string
    level: 'error' | 'warn' | 'log' | 'debug' | 'verbose' | 'fatal'
    context: string | null
    message: string
  }>
  capacity: number
  note: string
}

