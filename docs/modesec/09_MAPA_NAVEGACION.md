# 🗺️ Insumo 09 — Mapa Completo de Navegación y Sitemap Nuxt

> **Proyecto:** STIRE-Soft Frontend (Vue 3 + Nuxt 3)  
> **Nomenclatura Oficial:** Estandarizada según [NAMING_STIRE.md](./NAMING_STIRE.md)  
> **Fecha de Actualización:** 2 de septiembre de 2026 | **Versión:** 2.0 Multi-Rol

---

## 1. Árbol de Rutas y Naming Visible en Frontend

```
/ (Acceso Público) ──────────► COMP-V00 (Iniciar Sesión / Crear Cuenta)
│
├── /auth/
│   ├── login ───────────────► COMP-V00 (Iniciar Sesión)
│   └── register ────────────► COMP-V00 (Crear Cuenta)
│
├── /estudiante/ (Layout: StudentAppLayout)
│   ├── dashboard ───────────► EST-V01 (Inicio)
│   ├── unidad/:id ──────────► EST-V02 (Lección: [Título de Unidad])
│   ├── evaluacion/:id ──────► EST-V03 (Práctica / Ejercicio: [Nombre])
│   ├── tutor ───────────────► EST-V04 (Tutor IA — Drawer Flotante)
│   ├── repasos ─────────────► EST-V05 (Repasos)
│   └── progreso ────────────► EST-V06 (Mi Progreso)
│
├── /docente/ (Layout: TeacherAppLayout)
│   ├── dashboard ───────────► DOC-V01 (Mis Clases)
│   ├── contenidos ──────────► DOC-V02 (Contenidos y Temas)
│   ├── ejercicios/crear ────► DOC-V03 (Crear Ejercicio)
│   ├── clase/:id/analitica ─► DOC-V04 (Rendimiento del Grupo)
│   ├── estudiante/:id ──────► DOC-V05 (Detalle de Estudiante)
│   └── mensajes ────────────► DOC-V06 (Mensajes)
│
└── /admin/ (Layout: AdminAppLayout)
    ├── dashboard ───────────► ADM-V01 (Estado del Sistema)
    ├── usuarios ────────────► ADM-V02 (Usuarios y Roles)
    └── sistema ─────────────► ADM-V03 (Logs y Mantenimiento)
```

---

## 2. Matriz de Rutas, Permisos y Middleware Nuxt

| Ruta Nuxt | Código Técnico | Nombre Visible en UI | Middleware de Guardia | Redirección si falla |
|---|---|---|---|---|
| `/auth/login` | `COMP-V00` | Iniciar Sesión / Registro | `guest.ts` (si tiene JWT activo, redirige a su rol) | `/estudiante/dashboard` o `/docente/dashboard` |
| `/estudiante/*` | `EST-V01` a `EST-V06` | Inicio, Lección, Ejercicio, Tutor, Repasos, Mi Progreso | `auth.ts` + `role-student.ts` | `/auth/login` |
| `/docente/*` | `DOC-V01` a `DOC-V06` | Mis Clases, Contenidos, Crear Ejercicio, Rendimiento, Detalle, Mensajes | `auth.ts` + `role-teacher.ts` | `/auth/login` |
| `/admin/*` | `ADM-V01` a `ADM-V03` | Estado del Sistema, Usuarios y Roles, Logs | `auth.ts` + `role-admin.ts` | `/auth/login` |
