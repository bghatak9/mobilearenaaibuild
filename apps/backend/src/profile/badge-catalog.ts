export type BadgeDefinition = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  pointsRequired: number;
  category: string;
};

export const BADGE_CATALOG: BadgeDefinition[] = [
  {
    slug: 'welcome',
    name: 'Welcome Aboard',
    description: 'Joined the MobileArena community.',
    icon: '👋',
    pointsRequired: 0,
    category: 'membership',
  },
  {
    slug: 'first-comment',
    name: 'First Voice',
    description: 'Posted your first device comment.',
    icon: '💬',
    pointsRequired: 10,
    category: 'activity',
  },
  {
    slug: 'first-rating',
    name: 'First Rating',
    description: 'Rated your first phone.',
    icon: '⭐',
    pointsRequired: 5,
    category: 'activity',
  },
  {
    slug: 'brand-fan',
    name: 'Brand Fan',
    description: 'Added a favorite brand to your profile.',
    icon: '❤️',
    pointsRequired: 3,
    category: 'collection',
  },
  {
    slug: 'contributor',
    name: 'Contributor',
    description: 'Shared 5 comments or ratings.',
    icon: '📝',
    pointsRequired: 50,
    category: 'activity',
  },
  {
    slug: 'community-star',
    name: 'Community Star',
    description: 'Earned 100 reputation points.',
    icon: '🌟',
    pointsRequired: 100,
    category: 'reputation',
  },
  {
    slug: 'power-user',
    name: 'Power User',
    description: 'Earned 250 reputation points.',
    icon: '🏆',
    pointsRequired: 250,
    category: 'reputation',
  },
  {
    slug: 'brand-collector',
    name: 'Brand Collector',
    description: 'Followed 3 or more favorite brands.',
    icon: '📱',
    pointsRequired: 9,
    category: 'collection',
  },
];

export function computeReputationPoints(stats: {
  commentCount: number;
  ratingCount: number;
  favoriteBrandCount: number;
}): number {
  return (
    stats.commentCount * 10 +
    stats.ratingCount * 5 +
    stats.favoriteBrandCount * 3
  );
}

export function badgeSlugsToAward(stats: {
  commentCount: number;
  ratingCount: number;
  favoriteBrandCount: number;
  reputationPoints: number;
}): string[] {
  const earned: string[] = ['welcome'];

  if (stats.commentCount >= 1) earned.push('first-comment');
  if (stats.ratingCount >= 1) earned.push('first-rating');
  if (stats.favoriteBrandCount >= 1) earned.push('brand-fan');
  if (stats.favoriteBrandCount >= 3) earned.push('brand-collector');
  if (stats.commentCount + stats.ratingCount >= 5) earned.push('contributor');
  if (stats.reputationPoints >= 100) earned.push('community-star');
  if (stats.reputationPoints >= 250) earned.push('power-user');

  return earned;
}
