---
estado:     vigente
verificado: 2026-09-03 contra commit HEAD (FASE CC-04)
fuente:     normativo
codigos:    EST-V05
---

# ⏳ Insumo 07 — Mecanismo y Visualización de Repetición Espaciada (SM-2)

**Proyecto:** STIRE-Soft  
**Fundamentación Pedagógica:** Modelo de Ebbinghaus (Curva del Olvido) + Algoritmo SuperMemo-2 (SM-2)  
**Fecha:** 30 de agosto de 2026  

---

## 1. Fundamentación del Modelo de Repetición Espaciada

La enseñanza tradicional de algoritmia sufre del fenómeno de "desentrenamiento rápido": los estudiantes aprueban una evaluación sobre estructuras condicionales o ciclos y, al cabo de 3 semanas, olvidan la lógica de invariantes o actualización de acumuladores.

STIRE integra **Repetición Espaciada** en el flujo diario para convertir la práctica en memoria procedural a largo plazo.

---

## 2. Estados Cognitivos del Aprendizaje en STIRE

El sistema modela el dominio del estudiante a través de 5 estados discretos derivados del `mastery` [0, 100] calculado por `calculateUnitMastery()`:

```mermaid
stateDiagram-v2
    [*] --> NO_VISTO: Unidad no iniciada
    NO_VISTO --> EXPLORADO: Primer intento realizado (Mastery < 20%)
    EXPLORADO --> EN_PRACTICA: Intentos iterativos (20% <= Mastery < 60%)
    EN_PRACTICA --> COMPRENSION_PARCIAL: Práctica constante (60% <= Mastery < 85%)
    COMPRENSION_PARCIAL --> DOMINADO: Exámenes superados (Mastery >= 85%)
    DOMINADO --> EN_PRACTICA: Si la evaluación de repaso vence y falla
```

| Estado | Rango de Maestría | Significado Pedagógico | Indicador Visual en UI |
|---|---|---|---|
| `NO_VISTO` | 0% | El estudiante no ha interactuado con la unidad. | Círculo gris tenue `○` |
| `EXPLORADO` | 1% - 19% | Ha leído la teoría o realizado un intento inicial sin aprobar. | Círculo punteado `◌` |
| `EN_PRACTICA` | 20% - 59% | Resuelve ejercicios básicos pero comete errores conceptuales. | Media luna amarilla `◐` |
| `COMPRENSION_PARCIAL` | 60% - 84% | Supera la mayoría de los casos de prueba; requiere afianzar casos límite. | Tres cuartos azul `◕` |
| `DOMINADO` | 85% - 100% | Domina sintaxis, lógica y casos de borde de forma consistente. | Círculo verde con check `✔` |

---

## 3. Algoritmo SM-2 en Backend y Programación de Revisiones

Cuando un estudiante completa una evaluación o sesión de práctica, la entidad `ReviewSchedule` actualiza:
1. **Factor de Facilidad (`easeFactor`):** Inicializado en 2.5, ajustado según la calificación obtenida.
2. **Intervalo (`intervalDays`):**
   * Repetición 1: 1 día.
   * Repetición 2: 6 días.
   * Repetición $N$: $Intervalo_{N-1} \times easeFactor$.
3. **Próxima Fecha de Revisión (`nextReviewDate`):** $FechaActual + Intervalo$.

---

## 4. Representación en la Interfaz (Ventana `EST-V05`)

En `EST-V05 (Mantenimiento de Algoritmos)`, las unidades se agrupan en tres niveles de urgencia visual:

```
[▲ CRÍTICO] - Vencido hace más de 3 días (Riesgo alto de desaprendizaje)
             Unidad 1.3: Ciclos While y Condición de Parada (Mastery actual: 55%)
             [Iniciar Repaso Rápido (3 min)]

[◐ PARA HOY] - Vence hoy
             Unidad 2.1: Arreglos Unidimensionales (Mastery: 78%)
             [Iniciar Repaso]  [Posponer 24h]

[⬤ AL DÍA]   - Programado para el 4 de septiembre
             Unidad 1.1: Asignación y Variables (Mastery: 95%)
```
