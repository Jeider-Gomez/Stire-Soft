---
estado:  vigente (04/10/2026)
pregunta del dueño: «logros y medallas, como estudiar una semana, completar 3 ejercicios en un día o completar el módulo
  en una semana, pero bien estructurado; investiga gamificación y qué usan los mayores referentes»
reemplaza: la racha semanal (descartada por Jeider: «excesiva») y el módulo de medallas en pausa (borrado, código muerto)
---

# Logros y medallas

## 1. Qué hacen los referentes

| Referente | Cómo lo hace | Qué tomamos |
|---|---|---|
| **Khan Academy** | Medallas por categorías de rareza (Meteorito, Luna, Tierra, Sol, Agujero negro) y «parches» por completar unidades del curso | **Categorías**, y una medalla por **módulo dominado** |
| **Duolingo** | Logros con **niveles** apilados (racha, XP, lecciones perfectas, misiones) | Niveles **bronce → plata → oro** |
| **Codecademy** | Medallas por ejercicios y lecciones, y una **meta semanal** en lugar de exigir todos los días | «Semana de estudio»: 3 días en la semana, sin exigir semanas seguidas |
| **Moodle** | Medallas por completar actividades o el curso, con criterios explícitos (estándar Open Badges) | Cada medalla dice **exactamente** qué hay que hacer |

## 2. Qué dice la evidencia

- Las medallas **aumentaron la participación sin bajar la calidad** de lo que hacían los estudiantes (Denny, 2013).
- Un curso con **tabla de posiciones y medallas** bajó la motivación intrínseca y el rendimiento: la comparación social
  desanima a los que van atrás (Hanus y Fox, 2015).
- La gamificación tiene efectos **pequeños pero positivos**; funciona mejor con narrativa y con colaboración, no solo con
  puntos (Sailer y Homner, 2020).

**Por eso STIRE:** medallas **sí**, **privadas** (solo las ve el estudiante), **sin ranking**, y **solo por aprendizaje
real**. Un ejercicio cuenta si se **aprueba** y si es **distinto**: repetir lo fácil no suma.

## 3. El catálogo

| Categoría | Bronce | Plata | Oro |
|---|---|---|---|
| **Constancia**: semanas con 3 días o más de estudio (no hace falta que sean seguidas) | 1 semana | 4 semanas | 12 semanas |
| **Práctica**: ejercicios distintos aprobados en un mismo día | 3 | 5 | 10 |
| **Dominio**: lecciones dominadas (85 %) | 1 | 5 | 15 |
| **Desafío**: ejercicios avanzados aprobados | 1 | 5 | 15 |
| **Persistencia**: aprobados en el 3.er intento o después | 1 | 5 | 15 |
| **Memoria**: repasos hechos | 10 | 30 | 100 |

**Además, sin niveles:**
- **«Dominaste «módulo»»**: una medalla por cada módulo con todas sus lecciones dominadas.
- **«Módulo en una semana»**: dominar un módulo completo en los 7 días siguientes a la primera entrega en él.

Los días y las semanas se cuentan en hora de Colombia.

## 4. Cómo se ve

- **Inicio:** si hay medallas nuevas, se **celebran una vez** («¡Nueva medalla: Semana de estudio!»). Si no, se ve la
  última. Y **una sola meta**, la más cercana, con su barra: «Próxima: 3 ejercicios en un día · 2 de 3».
- **Mi progreso → «Mis logros»:** todas, por categoría. Las obtenidas a color y con fecha; las que faltan en gris, con lo
  que hay que hacer y cuánto falta.

## 5. Cómo funciona por dentro

- Los logros se **calculan** con lo que ya existe: entregas (con su dificultad, intento y fecha), dominio por lección y
  repasos (`src/analytics/logros.ts`). No hay que «registrarlos» en cada pantalla, y no se pierden si algo falla.
- La tabla `logros_estudiante` solo guarda **cuándo** se obtuvo cada uno y si el estudiante **ya lo vio**, para
  celebrarlo una vez.
- `GET /analytics/student/:id/logros` (el estudiante, o su docente) y `POST /analytics/logros/vistos` (el estudiante).

## 6. Lo que decide el docente (sin trabajo extra)

- **Por defecto, activados con todas las categorías.** El docente no tiene que configurar nada.
- **En Ajustes de la clase:** un interruptor «Activados / Desactivados» y, plegado, «Elegir categorías» (6 casillas; al
  menos una). Por ejemplo, quitar «Práctica» si no quiere premiar la cantidad diaria.
- **Los niveles (bronce, plata, oro) no se configuran:** son fijos y con respaldo; elegir números sería tedioso.
- **Varias clases:** el estudiante ve las categorías activas en cualquiera de sus clases; las medallas de módulo, solo de
  las clases con «Dominio». Si ninguna clase usa logros, no los ve. Si el docente quita una categoría, sus medallas
  dejan de mostrarse y no se celebran.

## Referencias

- Denny, P. (2013). The effect of virtual achievements on student engagement. En *Proceedings of the SIGCHI Conference on
  Human Factors in Computing Systems (CHI '13)*, 763-772. https://doi.org/10.1145/2470654.2470763
- Hanus, M. D. y Fox, J. (2015). Assessing the effects of gamification in the classroom: A longitudinal study on intrinsic
  motivation, social comparison, satisfaction, effort, and academic performance. *Computers & Education, 80*, 152-161.
  https://doi.org/10.1016/j.compedu.2014.08.019
- Sailer, M. y Homner, L. (2020). The Gamification of Learning: a Meta-analysis. *Educational Psychology Review, 32*(1),
  77-112. https://doi.org/10.1007/s10648-019-09498-w
- Referentes de producto (centros de ayuda, consultados el 04/10/2026): [Khan Academy, «What are energy points, badges, and
  avatars?»](https://support.khanacademy.org/hc/en-us/articles/202487710-What-are-energy-points-badges-and-avatars);
  [Codecademy, «About Badges and Weekly Targets»](https://help.codecademy.com/hc/en-us/articles/115003050088-About-Badges-and-Weekly-Targets);
  [Moodle Docs, «Using badges»](https://docs.moodle.org/502/en/Using_badges); los niveles de Duolingo, de guías de
  usuarios ([duolingoguides.com](https://duolingoguides.com/duolingo-achievements/)), no de documentación oficial.
