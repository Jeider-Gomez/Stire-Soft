# Reporte de Auditoría QA — Semana 8

**Plataforma:** STIRE-Soft (`stire-soft.vercel.app`)  
**Auditor:** Jorge Iván Cervantes García (Estudiante / QA Tester)  
**Fecha:** 16 de octubre de 2026 
**Entorno de prueba:** Google Chrome (Desktop) y Chrome Mobile (375 px)  

---

## 1. Resumen Ejecutivo

Se realizó la evaluación funcional, técnica y de interfaz de usuario (UI/UX) correspondiente a los compromisos de la **Semana 8**. La auditoría cubrió en su totalidad los flujos previstos desde la cuenta de estudiante en entorno web y móvil, verificando el funcionamiento de los módulos requeridos y registrando las observaciones encontradas durante la sesión.

---

## 2. Resultados por Módulo Auditado

* **Asistencia (Estudiante):** Verificación correcta del historial de clases y de la información de asistencia dentro del panel «Mi asistencia».
* **Matriculación por QR:** Escaneo dinámico con la cámara del celular hacia el código QR de la clase de Pedro (`ALGO-203413`). Matriculación inmediata con notificación flotante (*«¡Te has matriculado exitosamente en la clase!»*) y actualización del listado.
* **Módulo de Proyectos:**
  * *Diagrama de Flujo (`Prueba 1`):* Ensamblaje de bloques de inicio, entrada, proceso y salida. Ejecución fluida y visualización de resultados en consola.
  * *Pseudocódigo (`Prueba 1 pseu`):* Redacción y ejecución de algoritmo con lectura/escritura de datos. Respuesta en consola en menos de 3 segundos.
* **Entregas y Perfil de Usuario:**
  * *Entregas:* Envío de actividad al docente Julio y lectura de comentarios de retroalimentación.
  * *Foto de perfil:* Ciclo completo validado (subida inicial, reemplazo por nueva foto y eliminación con retorno automático al avatar por iniciales `IG`).
* **Ajustes de UI/UX (S08-J01):** Ubicación accesible del Tutor al lado de la lección, comportamiento fluido del menú colapsable (*drawer*) en móvil, cajas de texto autoexpandibles (*auto-grow*) al escribir y flujo de registro en dos pasos.
* **Revalidación de Parches Anteriores:** Confirmación del enlace de restablecimiento de contraseña admin, visibilidad del indicador de ayuda (QA-06) y ejecución del autoguardado en segundo plano (QA-07).
* **Tutor AI (Pedagogía y Contexto):** Reconocimiento preciso de la lección activa y cumplimiento de la regla pedagógica (guía al estudiante mediante preguntas sin entregar la respuesta directa).

---

## 3. Matriz de Hallazgos

| ID | Severidad | Módulo | Descripción | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **QA-ERR-08** | Menor (Estilo) | Tutor AI | El Tutor no emite saludos condicionados por la hora del día (*«Buenos días / tardes / noches»*), sino que se limita a iniciar la interacción únicamente con un *«Hola»*. | Registrado para ajuste |

---

## 4. Conclusión

Durante la auditoría de la Semana 8 se comprobaron todas las funcionalidades requeridas: la matriculación por QR, la gestión completa de la foto de perfil, la creación y ejecución de proyectos en Diagrama de Flujo y Pseudocódigo, la usabilidad en móvil (menú colapsable y cajas *auto-grow*), la consulta de asistencia del estudiante, la lectura de comentarios en entregas y las correcciones de reportes anteriores. El único punto observado fue la simplificación del saludo inicial del Tutor AI (que dice únicamente *«Hola»*), el cual quedó documentado como un detalle de estilo para su posterior revisión.
