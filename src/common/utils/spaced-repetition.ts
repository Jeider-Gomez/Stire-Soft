export function calculateNextReview(
  repetitions: number,
  currentMastery: number
): { nextReviewDate: Date, intervalDays: number, easeFactor: number } {
  let intervalDays = 1;
  // 2.5 es el punto de partida estándar SM-2, usado mientras repetitions
  // <= 1 (el algoritmo actual solo deriva un ease factor propio a partir
  // de la 2ª repetición, ver rama de abajo).
  let easeFactor = 2.5;

  if (repetitions === 0) {
    intervalDays = 1;
  } else if (repetitions === 1) {
    intervalDays = 3;
  } else {
    // Ease Factor (1.3 to 2.5) based on mastery
    easeFactor = Math.max(1.3, 2.5 - (100 - currentMastery) * 0.02);
    const prevInterval = repetitions === 2 ? 3 : Math.pow(easeFactor, repetitions - 1);
    intervalDays = Math.round(prevInterval * easeFactor);
  }

  intervalDays = Math.min(intervalDays, 60);

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

  return { nextReviewDate, intervalDays, easeFactor };
}
