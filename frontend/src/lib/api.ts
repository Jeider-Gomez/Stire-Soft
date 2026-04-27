// API client para comunicación con el backend STIRE

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Obtener el token JWT del localStorage
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('stire_token');
}

/**
 * Función base para hacer peticiones al backend
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error de red' }));
    throw new Error(error.message || `Error ${response.status}`);
  }

  // Algunos endpoints devuelven texto plano (como progress summary)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  return response.text() as unknown as T;
}

// ==========================================
// AUTH API
// ==========================================

export const authApi = {
  login: (email: string, password: string) =>
    request<{ user: any; token: string }>('auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, fullName: string) =>
    request<{ user: any; token: string }>('auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    }),

  getProfile: () =>
    request<{ user: any }>('auth/profile'),
};

// ==========================================
// USER API
// ==========================================

export const userApi = {
  getAll: () => request<any[]>('user'),
  getOne: (id: number) => request<any>(`user/${id}`),
  update: (id: number, data: any) =>
    request<any>(`user/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  remove: (id: number) =>
    request<void>(`user/${id}`, { method: 'DELETE' }),
};

// ==========================================
// CLASS API
// ==========================================

export const classApi = {
  getAll: () => request<any[]>('class'),
  getOne: (id: number) => request<any>(`class/${id}`),
  create: (data: { name: string; description?: string; code: string }) =>
    request<any>('class', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    request<any>(`class/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  getMyClasses: () => request<any[]>('class/my-classes'),
  getMyEnrollments: () => request<any[]>('class/my-enrollments'),
  addStudent: (classId: number, studentId: number) =>
    request<any>(`class/${classId}/students/${studentId}`, { method: 'POST' }),
  removeStudent: (classId: number, studentId: number) =>
    request<void>(`class/${classId}/students/${studentId}`, { method: 'DELETE' }),
  getStudents: (classId: number) => request<any[]>(`class/${classId}/students`),
};

// ==========================================
// LEARNING UNIT API
// ==========================================

export const learningUnitApi = {
  getAll: () => request<any[]>('learning-unit'),
  getAllAdmin: () => request<any[]>('learning-unit/all'),
  getOne: (id: number) => request<any>(`learning-unit/${id}`),
  create: (data: { title: string; description?: string; difficulty?: string; order?: number }) =>
    request<any>('learning-unit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    request<any>(`learning-unit/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  remove: (id: number) =>
    request<void>(`learning-unit/${id}`, { method: 'DELETE' }),
};

// ==========================================
// PROGRESS API
// ==========================================

export const progressApi = {
  getMyProgress: () => request<any[]>('progress/my-progress'),
  getRecommendations: () => request<any>('progress/recommendations'),
  markAsViewed: (unitId: number) =>
    request<any>(`progress/view/${unitId}`, { method: 'POST' }),
  updateMastery: (unitId: number, mastery: number) =>
    request<any>(`progress/update-mastery/${unitId}`, {
      method: 'PATCH',
      body: JSON.stringify({ mastery }),
    }),
  getStudentProgress: (studentId: number) =>
    request<any[]>(`progress/student/${studentId}`),
  updateStudentMastery: (studentId: number, unitId: number, mastery: number) =>
    request<any>(`progress/student/${studentId}/unit/${unitId}`, {
      method: 'PATCH',
      body: JSON.stringify({ mastery }),
    }),
};

// ==========================================
// MESSAGE API
// ==========================================

export const messageApi = {
  send: (receiverId: number, content: string) =>
    request<any>('message', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content }),
    }),
  getInbox: () => request<any[]>('message/inbox'),
  getSent: () => request<any[]>('message/sent'),
  getConversation: (userId: number) => request<any[]>(`message/conversation/${userId}`),
  markAsRead: (id: number) =>
    request<any>(`message/${id}/read`, { method: 'PATCH' }),
  getUnreadCount: () => request<number>('message/unread-count'),
};

// ==========================================
// TUTOR API
// ==========================================

export const tutorApi = {
  chat: (message: string) =>
    request<{ response: string }>('tutor/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};
