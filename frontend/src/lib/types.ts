// Tipos TypeScript para el frontend STIRE

// ==========================================
// ENUMS
// ==========================================

export enum UserRole {
  ADMIN = 'admin',
  DOCENTE = 'docente',
  ESTUDIANTE = 'estudiante',
}

export enum ProgressState {
  NO_VISTO = 'no_visto',
  VISTO = 'visto',
  EN_PRACTICA = 'en_practica',
  DOMINADO = 'dominado',
}

export enum Difficulty {
  BASICO = 'basico',
  INTERMEDIO = 'intermedio',
  AVANZADO = 'avanzado',
}

// ==========================================
// ENTITIES
// ==========================================

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  semestre?: number;
  programa?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassEntity {
  id: number;
  name: string;
  description: string;
  code: string;
  teacherId: number;
  teacher: User;
  students: User[];
  createdAt: string;
  updatedAt: string;
}

export interface LearningUnit {
  id: number;
  title: string;
  description: string;
  difficulty: Difficulty;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Progress {
  learningUnit: LearningUnit;
  state: ProgressState;
  mastery: number;
  lastReview: string | null;
  reviewCount: number;
}

export interface Message {
  id: number;
  senderId: number;
  sender: User;
  receiverId: number;
  receiver: User;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Recommendations {
  recommendations: Progress[];
  totalUnits: number;
  dominated: number;
  inProgress: number;
  viewed: number;
  notViewed: number;
}

// ==========================================
// AUTH
// ==========================================

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

// ==========================================
// TUTOR
// ==========================================

export interface TutorChatResponse {
  response: string;
}

export interface ChatMessage {
  role: 'user' | 'tutor';
  content: string;
  timestamp: Date;
}
