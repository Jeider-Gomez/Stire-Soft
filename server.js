const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// CORS & Headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Mock database in memory - CERO BASE DE DATOS EXTERNA
const USERS = [
  {
    id: 1,
    email: 'pedro.estudiante@unicor.edu.co',
    fullName: 'Pedro Romero Mendoza',
    role: 'estudiante',
    password: 'Test1234!',
  },
  {
    id: 2,
    email: 'roberto.toscano@unicor.edu.co',
    fullName: 'Prof. Roberto Toscano Miranda',
    role: 'docente',
    password: 'Test1234!',
  },
  {
    id: 3,
    email: 'admin.sistema@unicor.edu.co',
    fullName: 'Administrador del Sistema',
    role: 'administrador',
    password: 'Admin1234!',
  },
];

// Helper to generate a fake JWT
function generateToken(user) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.fullName,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
  })).toString('base64url');
  return `${header}.${payload}.mock-signature-stire`;
}

// Health check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    app: 'STIRE-Soft Visual Mode',
    database: 'in-memory-zero-db',
    roles: ['estudiante', 'docente', 'administrador'],
  });
});

// Auth Login endpoint
app.post(['/auth/login', '/api/auth/login'], (req, res) => {
  const { email, password } = req.body || {};
  if (!email) {
    return res.status(400).json({ statusCode: 400, message: 'El correo institucional es requerido.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  let found = USERS.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!found) {
    let role = 'estudiante';
    if (normalizedEmail.includes('docente') || normalizedEmail.includes('toscano') || normalizedEmail.includes('prof')) {
      role = 'docente';
    } else if (normalizedEmail.includes('admin')) {
      role = 'administrador';
    }
    const namePart = normalizedEmail.split('@')[0].replace(/[._-]/g, ' ');
    const fullName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    found = {
      id: USERS.length + 1,
      email: normalizedEmail,
      fullName: fullName || 'Usuario STIRE',
      role,
      password: password || 'Test1234!',
    };
    USERS.push(found);
  }

  const token = generateToken(found);
  return res.json({
    user: {
      id: found.id,
      email: found.email,
      fullName: found.fullName,
      role: found.role,
    },
    token,
    access_token: token,
  });
});

// Auth Register endpoint
app.post(['/auth/register', '/api/auth/register'], (req, res) => {
  const { fullName, email, password } = req.body || {};
  if (!email || !fullName) {
    return res.status(400).json({ statusCode: 400, message: 'Todos los campos son obligatorios.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  let existing = USERS.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    const token = generateToken(existing);
    return res.json({
      user: { id: existing.id, email: existing.email, fullName: existing.fullName, role: existing.role },
      token,
      access_token: token,
    });
  }

  const newUser = {
    id: USERS.length + 1,
    email: normalizedEmail,
    fullName: fullName.trim(),
    role: 'estudiante',
    password: password || 'Test1234!',
  };
  USERS.push(newUser);

  const token = generateToken(newUser);
  return res.json({
    user: { id: newUser.id, email: newUser.email, fullName: newUser.fullName, role: newUser.role },
    token,
    access_token: token,
  });
});

// Mock classes endpoint
app.get(['/class', '/api/class'], (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Algoritmos Básicos con HTML5, CSS y JavaScript',
      description: 'Diseña e implementa algoritmos básicos para interfaces web.',
      code: 'ALGO-WEB-T01',
      teacher: { fullName: 'Prof. Roberto Toscano Miranda' },
      isActive: true,
    },
    {
      id: 2,
      name: 'Algoritmia y Lógica Computacional para la Web',
      description: 'Fundamentos de lógica algorítmica y estructuras de control.',
      code: 'ALGO-WEB-V02',
      teacher: { fullName: 'Prof. Victor Castro' },
      isActive: true,
    },
    {
      id: 3,
      name: 'Desarrollo Frontend Interactivo y Algoritmos Web',
      description: 'Estructuración y dinamismo web con HTML5, CSS3 y JavaScript.',
      code: 'ALGO-WEB-A03',
      teacher: { fullName: 'Prof. Ali Pérez' },
      isActive: true,
    },
  ]);
});

// Serve frontend static output
const publicDir = path.join(__dirname, 'frontend-nuxt/.output/public');
if (fs.existsSync(publicDir)) {
  // If requesting root /, redirect directly to /auth/login
  app.get('/', (req, res) => {
    return res.redirect('/auth/login');
  });

  app.use(express.static(publicDir));

  // SPA fallback for non-API routes
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    if (req.path.startsWith('/api')) {
      return next();
    }

    const cleanPath = req.path.replace(/^\/+|\/+$/g, '');
    const specificFile = path.join(publicDir, cleanPath, 'index.html');
    if (cleanPath && fs.existsSync(specificFile)) {
      return res.sendFile(specificFile);
    }

    const fallback200 = path.join(publicDir, '200.html');
    if (fs.existsSync(fallback200)) {
      return res.sendFile(fallback200);
    }

    const fallbackIndex = path.join(publicDir, 'index.html');
    if (fs.existsSync(fallbackIndex)) {
      return res.sendFile(fallbackIndex);
    }

    next();
  });
}

const PORT = 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[STIRE-Soft] Servidor visual iniciado en http://0.0.0.0:${PORT} (Sin base de datos)`);
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
