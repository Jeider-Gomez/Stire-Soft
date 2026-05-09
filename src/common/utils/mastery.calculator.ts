export function calculateUnitMastery(
  allSubmissions: any[], 
  activities: any[]
): number {
  let totalAchieved = 0;
  let totalMaxWeight = 0;

  for (const activity of activities) {
    const actSubmissions = allSubmissions.filter(s => s.activityId === activity.id);
    const bestScore = actSubmissions.length > 0 
      ? Math.max(...actSubmissions.map(s => s.score)) 
      : 0;

    const weight = activity.adaptiveWeight * (activity.activityType?.baseWeight || 1);
    
    totalAchieved += (bestScore / activity.totalPoints) * weight;
    totalMaxWeight += weight;
  }

  if (totalMaxWeight === 0) return 0;
  return Math.min(100, Math.round((totalAchieved / totalMaxWeight) * 100));
}
