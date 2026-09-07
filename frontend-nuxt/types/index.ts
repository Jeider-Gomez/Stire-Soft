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

export type SubmissionStatus = 'in_progress' | 'grading' | 'graded' | 'error'

export interface SubmissionResult {
  submissionId: string
  totalScore: number
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

export interface TutorMessage {
  id: string
  sender: 'student' | 'tutor'
  text: string
  scaffoldingLevel?: 1 | 2 | 3 // 1: Pista conceptual, 2: Pregunta guía, 3: Localización falla
  timestamp: string
}
