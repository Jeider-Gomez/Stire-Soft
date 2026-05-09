export function calculateNextReview(
  repetitions: number, 
  currentMastery: number
): { nextReviewDate: Date, intervalDays: number } {
  let intervalDays = 1;

  if (repetitions === 0) {
    intervalDays = 1;
  } else if (repetitions === 1) {
    intervalDays = 3;
  } else {
    // Ease Factor (1.3 to 2.5) based on mastery
    const easeFactor = Math.max(1.3, 2.5 - (100 - currentMastery) * 0.02);
    const prevInterval = repetitions === 2 ? 3 : Math.pow(easeFactor, repetitions - 1);
    intervalDays = Math.round(prevInterval * easeFactor);
  }

  intervalDays = Math.min(intervalDays, 60);

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

  return { nextReviewDate, intervalDays };
}
