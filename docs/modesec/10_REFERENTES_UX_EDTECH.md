---
estado:     vigente
verificado: 2026-09-03 contra commit HEAD (FASE CC-04)
fuente:     normativo (benchmarking)
codigos:    EST-V01..V06 · DOC-V01..V06 · ADM-V01..V03 · COMP-V00
---

# 💡 Insumo 10 — Análisis Comparativo con Referentes EdTech

**Proyecto:** STIRE-Soft  
**Propósito:** Analizar patrones de UX educativa consolidados y adaptarlos a la identidad algorítmica de STIRE sin copiar interfaces.  
**Fecha:** 30 de agosto de 2026  

---

## 1. Matriz de Patrones UX Analizados

| Plataforma | Patrón de Diseño | ¿Aplica a STIRE? | Adaptación Específica a STIRE-Soft |
|---|---|:---:|---|
| **Platzi** | **Dashboard de Inicio con Rutas y Metas Diarias** | ✅ Sí | En `EST-V01`, el estudiante no ve publicidad ni catálogo infinito, sino una **Ruta de Dominio Algorítmico** clara con tarjetas de "Continuar donde ibas" y la "Meta de repaso de hoy". |
| **Platzi** | **Medición de Tiempo y Racha** | ✅ Sí | Se adopta el contador de racha de estudio en días consecutivos en `EST-V06` para incentivar la constancia sin convertirlo en gamificación invasiva. |
| **Udemy** | **Estructura Curricular por Secciones y Clases** | ✅ Sí | En `DOC-V02` y `EST-V02`, el árbol temático se desglosa en *Módulos › Temas › Unidades de Aprendizaje*. Cada unidad agrupa lectura, código y ejercicios. |
| **Udemy** | **Integración de Quizzes y Coding Exercises dentro del flujo** | ✅ Sí | En `EST-V03`, el editor de código convive en contigüidad con el enunciado y los casos de prueba sin forzar cambios bruscos de pantalla. |
| **Duolingo** | **Repetición Espaciada y Práctica de Fortalecimiento** | ✅ Sí | En `EST-V05`, la "Dumbbell" de Duolingo se adapta como el **"Mantenimiento del Taller"**: tarjetas de ejercicios priorizadas por el algoritmo SM-2 según la curva del olvido. |
| **Duolingo** | **Sistema de Vidas / Corazones que bloquea el estudio** | ❌ **NO** | Descartado totalmente por principios pedagógicos de STIRE. El error de compilación o caso fallido es formativo; el botón `[Ejecutar]` es gratis e ilimitado. |
| **Coursera** | **Evaluaciones Sumativas con Límite Estricto de Intentos** | ✅ Sí | En `EST-V03`, el botón `[Entregar]` consume intento formal (`attemptsAllowed`), permitiendo al docente configurar evaluaciones sumativas con límite si lo requiere. |
| **Coursera** | **Certificados y Verificación de Identidad** | ⚠️ Futuro | No forma parte del MVP actual. Las instituciones aliadas podrán emitir constancias de aprobación en fases posteriores. |

---

## 2. Síntesis de la Identidad Visual y Conceptual de STIRE

* **Metáfora Rectora:** El **Taller de Algoritmia y Forja de Software**.
* **El Estudiante:** Es el *Aprendiz de Forja*.
* **El Tutor IA:** Es el *Maestro de Taller* que guía el martillado lógico sin forjar la pieza por él.
* **El Juez/Sandbox:** Es la *Prensa de Prueba y Calibre*.
* **El Repaso Espaciado:** Es el *Mantenimiento Preventivo de Herramientas*.
