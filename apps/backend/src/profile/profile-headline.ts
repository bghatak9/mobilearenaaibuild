export function defaultHeadline(reputationPoints: number): string {
  if (reputationPoints >= 250) return 'Power User';
  if (reputationPoints >= 100) return 'Tech Enthusiast';
  if (reputationPoints >= 50) return 'Phone Fan';
  return 'New Member';
}

export function displayHeadline(
  headline: string | null | undefined,
  reputationPoints: number,
): string {
  return headline?.trim() || defaultHeadline(reputationPoints);
}
