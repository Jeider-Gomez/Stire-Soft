# 📋 Insumo 13 — Backlog Funcional y Priorización

**Proyecto:** STIRE-Soft  
**Metodología de Clasificación:** MoSCoW (MVP / Importante / Futuro)  
**Fecha:** 30 de agosto de 2026  

---

## 1. Nivel MVP (Esencial para Demostración y Validación de Hipótesis)

* [x] **Autenticación JWT:** Registro, login y perfil con roles (`COMP-V00`).
* [x] **Gestión de Clases & Auto-matrícula:** Creación de clase por docente con código de acceso y matrícula de estudiantes (`DOC-V01`, `EST-V01`).
* [x] **Visor de Contenidos Teóricos:** Módulos, temas y unidades renderizados desde Markdown con diagramas SVG (`EST-V02`).
* [x] **Resolución en Sandbox Aislado:** Editor de código, ejecución segura en proceso hijo con timeout y memoria limitada, calificación automática y autoguardado (`EST-V03`).
* [x] **Tutor IA Socrático Adaptativo:** Inferencia con Google Gemini (`gemini-1.5-flash`) condicionada al mastery y nivel cognitivo del estudiante (`EST-V04`).
* [x] **Cálculo de Maestría (Mastery Learning):** Algoritmo `calculateUnitMastery()` ponderado por dificultad y estado cognitivo (`EST-V06`).
* [x] **Repetición Espaciada SM-2:** Programación de fechas de repaso y lista de unidades por vencer (`EST-V05`).
* [x] **Panel Docente de Cohorte:** Promedio de maestría grupal y ranking de estudiantes (`DOC-V04`).
* [x] **Mensajería Docente-Estudiante:** Bandeja de entrada, enviados, conversación por usuario y contador de no leídos — 6 endpoints funcionando (`DOC-V06`, recuperada en FASE CC-04, D-02; el backend ya existía y no tenía ventana asignada).

---

## 2. Nivel Importante (Versión Completa y Robusta de Producción)

* [ ] **Diseñador Visual de Casos de Prueba en UI:** Interfaz enriquecida para que el docente cree y pruebe casos sin tocar base de datos (`DOC-V03`).
* [ ] **Animación Interactiva de Trazado de Memoria:** Visor paso a paso de variables y llamadas a pila en la teoría (`EST-V02`).
* [ ] **Exportación de Reportes Académicos:** Descarga de notas en formato CSV/Excel para el sistema de calificaciones institucional (`DOC-V04`).
* [ ] **Gamificación y Logros Pedagógicos:** Medallas no invasivas por constancia, racha de repasos y dominio de módulos complejos (`GamificationModule`).
* [ ] **Panel Administrativo de Monitoreo en Tiempo Real:** Tacómetros visuales de uso de memoria, colas BullMQ y logs de seguridad (`ADM-V01`, `ADM-V03`).

---

## 3. Nivel Futuro (Largo Plazo / Post-Proyecto)

* [ ] **BYOK (Bring Your Own Key):** Interfaz para que estudiantes avanzados ingresen su propia clave de OpenAI/Gemini con almacenamiento cifrado AES-256 (`EST-V04`).
* [ ] **Soporte Multi-Lenguaje en Sandbox:** Incorporación de Python, C++ y Java en el motor de ejecución aislado.
* [ ] **Integración LTI con Moodle / Canvas:** Sincronización automática de notas y matrículas con el LMS institucional.
