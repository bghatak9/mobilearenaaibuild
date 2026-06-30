export type AdPriority = 'high' | 'medium' | 'low' | 'later' | 'careful' | 'optional';

export type AdCategoryId =
  | 'display'
  | 'in-article'
  | 'native'
  | 'sticky'
  | 'video'
  | 'interstitial'
  | 'sponsored'
  | 'affiliate'
  | 'featured'
  | 'newsletter'
  | 'push'
  | 'classified'
  | 'bulk-import'
  | 'adsense';

export type AdPlacementDef = {
  id: string;
  label: string;
  category: AdCategoryId;
  categoryLabel: string;
  width?: number;
  height?: number;
  priority: AdPriority;
  recommended: boolean;
  description?: string;
};

export type AdCategoryDef = {
  id: AdCategoryId;
  label: string;
  description: string;
  priority: AdPriority;
  recommended: boolean;
  placements: AdPlacementDef[];
};

const cat = (
  id: AdCategoryId,
  label: string,
  description: string,
  priority: AdPriority,
  recommended: boolean,
  placements: Omit<AdPlacementDef, 'category' | 'categoryLabel'>[],
): AdCategoryDef => ({
  id,
  label,
  description,
  priority,
  recommended,
  placements: placements.map((p) => ({
    ...p,
    category: id,
    categoryLabel: label,
  })),
});

export const AD_CATEGORIES: AdCategoryDef[] = [
  cat(
    'display',
    'Display Ads',
    'Traditional banner advertisements.',
    'high',
    true,
    [
      { id: 'display-header-728x90', label: 'Header Banner (728×90)', width: 728, height: 90, priority: 'high', recommended: true },
      { id: 'display-mobile-320x50', label: 'Mobile Banner (320×50)', width: 320, height: 50, priority: 'high', recommended: true },
      { id: 'display-sidebar-300x250', label: 'Sidebar Rectangle (300×250)', width: 300, height: 250, priority: 'high', recommended: true },
      { id: 'display-large-336x280', label: 'Large Rectangle (336×280)', width: 336, height: 280, priority: 'high', recommended: true },
      { id: 'display-leaderboard-970x90', label: 'Leaderboard (970×90)', width: 970, height: 90, priority: 'high', recommended: true },
      { id: 'display-skyscraper-160x600', label: 'Skyscraper (160×600)', width: 160, height: 600, priority: 'high', recommended: true },
      { id: 'homepage-top', label: 'Homepage top banner', width: 728, height: 90, priority: 'high', recommended: true, description: 'Legacy placement alias' },
    ],
  ),
  cat(
    'in-article',
    'In-Article Ads',
    'Ads inserted between paragraphs in news articles and reviews.',
    'high',
    true,
    [
      { id: 'in-article-top', label: 'Top of article', priority: 'high', recommended: true },
      { id: 'in-article-middle', label: 'Middle of article', priority: 'high', recommended: true },
      { id: 'in-article-end', label: 'End of article', priority: 'high', recommended: true },
      { id: 'in-article-between-sections', label: 'Between related content sections', priority: 'high', recommended: true },
    ],
  ),
  cat(
    'native',
    'Native Ads',
    'Advertisements designed to match your site look and feel.',
    'high',
    true,
    [
      { id: 'native-sponsored-card', label: 'Sponsored news cards', priority: 'high', recommended: true },
      { id: 'native-recommended-product', label: 'Recommended products', priority: 'high', recommended: true },
      { id: 'native-promoted-phone', label: 'Promoted phone listings', priority: 'high', recommended: true },
      { id: 'native-brand-sponsored', label: 'Brand-sponsored content', priority: 'high', recommended: true },
      { id: 'homepage-mid', label: 'Homepage native card', priority: 'high', recommended: true, description: 'Legacy placement alias' },
    ],
  ),
  cat(
    'sticky',
    'Sticky Ads',
    'Ads that remain visible while scrolling.',
    'medium',
    true,
    [
      { id: 'sticky-footer-mobile', label: 'Sticky footer ads (mobile)', priority: 'medium', recommended: true },
      { id: 'sticky-sidebar-desktop', label: 'Sticky sidebar ads (desktop)', priority: 'medium', recommended: true },
      { id: 'sticky-floating-corner', label: 'Floating corner ads', priority: 'medium', recommended: true },
    ],
  ),
  cat(
    'video',
    'Video Ads',
    'Video-based monetization.',
    'later',
    false,
    [
      { id: 'video-pre-roll', label: 'Pre-roll ads', priority: 'later', recommended: false },
      { id: 'video-mid-roll', label: 'Mid-roll ads', priority: 'later', recommended: false },
      { id: 'video-review-sponsorship', label: 'Video review sponsorships', priority: 'later', recommended: false },
      { id: 'video-rewarded', label: 'Rewarded video ads', priority: 'later', recommended: false },
    ],
  ),
  cat(
    'interstitial',
    'Interstitial Ads',
    'Full-screen ads shown during navigation. Use carefully.',
    'careful',
    false,
    [
      { id: 'interstitial-page-transition', label: 'Between page transitions', priority: 'careful', recommended: false },
      { id: 'interstitial-welcome', label: 'App-style welcome ads', priority: 'careful', recommended: false },
      { id: 'interstitial-exit-intent', label: 'Exit-intent advertisements', priority: 'careful', recommended: false },
    ],
  ),
  cat(
    'sponsored',
    'Sponsored Content',
    'Paid promotional content — always labeled Sponsored.',
    'high',
    true,
    [
      { id: 'sponsored-article', label: 'Sponsored articles', priority: 'high', recommended: true },
      { id: 'sponsored-brand-review', label: 'Brand reviews', priority: 'high', recommended: true },
      { id: 'sponsored-launch', label: 'Launch event coverage', priority: 'high', recommended: true },
      { id: 'sponsored-comparison', label: 'Featured comparisons', priority: 'high', recommended: true },
    ],
  ),
  cat(
    'affiliate',
    'Affiliate Ads',
    'Earn commissions from purchases.',
    'high',
    true,
    [
      { id: 'affiliate-buy-now', label: 'Buy Now buttons', priority: 'high', recommended: true },
      { id: 'affiliate-price-widget', label: 'Price comparison widgets', priority: 'high', recommended: true },
      { id: 'affiliate-amazon', label: 'Amazon affiliate links', priority: 'high', recommended: true },
      { id: 'affiliate-ecommerce', label: 'E-commerce partner links', priority: 'high', recommended: true },
    ],
  ),
  cat(
    'featured',
    'Featured Listings',
    'Premium placement for brands.',
    'high',
    true,
    [
      { id: 'featured-homepage-phone', label: 'Featured phones on homepage', priority: 'high', recommended: true },
      { id: 'featured-search-top', label: 'Top search results', priority: 'high', recommended: true },
      { id: 'featured-brand-page', label: 'Premium brand pages', priority: 'high', recommended: true },
      { id: 'featured-comparison', label: 'Sponsored comparison results', priority: 'high', recommended: true },
    ],
  ),
  cat(
    'newsletter',
    'Newsletter Ads',
    'Advertising inside email campaigns.',
    'medium',
    false,
    [
      { id: 'newsletter-sponsored', label: 'Sponsored newsletters', priority: 'medium', recommended: false },
      { id: 'newsletter-featured-product', label: 'Featured products', priority: 'medium', recommended: false },
      { id: 'newsletter-promo', label: 'Promotional announcements', priority: 'medium', recommended: false },
    ],
  ),
  cat(
    'push',
    'Push Notification Ads',
    'Monetization through web notifications.',
    'optional',
    false,
    [
      { id: 'push-product-alert', label: 'New product alerts', priority: 'optional', recommended: false },
      { id: 'push-sponsored-launch', label: 'Sponsored launches', priority: 'optional', recommended: false },
      { id: 'push-partner-promo', label: 'Partner promotions', priority: 'optional', recommended: false },
    ],
  ),
  cat(
    'classified',
    'Classified Ads',
    'User-submitted advertisements.',
    'low',
    false,
    [
      { id: 'classified-used-phone', label: 'Used phones for sale', priority: 'low', recommended: false },
      { id: 'classified-repair', label: 'Repair services', priority: 'low', recommended: false },
      { id: 'classified-accessories', label: 'Mobile accessories', priority: 'low', recommended: false },
      { id: 'classified-local-retailer', label: 'Local retailers', priority: 'low', recommended: false },
    ],
  ),
  cat(
    'bulk-import',
    'Bulk Advertisement Upload',
    'Enterprise advertiser feeds.',
    'high',
    true,
    [
      { id: 'bulk-csv', label: 'CSV uploads', priority: 'high', recommended: true, description: 'Upload format' },
      { id: 'bulk-xlsx', label: 'Excel (.xlsx) uploads', priority: 'high', recommended: true, description: 'Upload format' },
      { id: 'bulk-json', label: 'JSON feeds', priority: 'high', recommended: true, description: 'Upload format' },
      { id: 'bulk-xml', label: 'XML feeds', priority: 'medium', recommended: false, description: 'Planned' },
      { id: 'bulk-api', label: 'API-based uploads', priority: 'medium', recommended: false, description: 'Planned' },
      { id: 'bulk-scheduled', label: 'Scheduled uploads', priority: 'medium', recommended: false, description: 'Planned' },
    ],
  ),
  cat(
    'adsense',
    'Google AdSense',
    'Google AdSense ad format reference.',
    'optional',
    false,
    [
      { id: 'adsense-display', label: 'Display Ads', priority: 'optional', recommended: false },
      { id: 'adsense-in-feed', label: 'In-feed Ads', priority: 'optional', recommended: false },
      { id: 'adsense-in-article', label: 'In-article Ads', priority: 'optional', recommended: false },
      { id: 'adsense-multiplex', label: 'Multiplex Ads', priority: 'optional', recommended: false },
      { id: 'adsense-anchor', label: 'Anchor Ads', priority: 'optional', recommended: false },
      { id: 'adsense-vignette', label: 'Vignette Ads', priority: 'optional', recommended: false },
      { id: 'adsense-auto', label: 'Auto Ads', priority: 'optional', recommended: false },
      { id: 'adsense-search', label: 'Search Ads', priority: 'optional', recommended: false },
      { id: 'adsense-rewarded', label: 'Rewarded Ads', priority: 'optional', recommended: false },
    ],
  ),
];

export const AD_PLACEMENTS: AdPlacementDef[] = AD_CATEGORIES.flatMap((c) => c.placements);

export const PLACEMENT_IDS = new Set(AD_PLACEMENTS.map((p) => p.id));

export const AD_PRIORITY_MATRIX = [
  { type: 'Display Ads', priority: 'High' as const, recommended: true },
  { type: 'In-Article Ads', priority: 'High' as const, recommended: true },
  { type: 'Native Ads', priority: 'High' as const, recommended: true },
  { type: 'Sponsored Articles', priority: 'High' as const, recommended: true },
  { type: 'Featured Phones', priority: 'High' as const, recommended: true },
  { type: 'Affiliate Links', priority: 'High' as const, recommended: true },
  { type: 'Sticky Ads', priority: 'Medium' as const, recommended: true },
  { type: 'Video Ads', priority: 'Medium' as const, recommended: false },
  { type: 'Interstitial Ads', priority: 'Low' as const, recommended: false },
  { type: 'Push Ads', priority: 'Low' as const, recommended: false },
];

export function resolvePlacementMeta(placement: string): AdPlacementDef | undefined {
  return AD_PLACEMENTS.find((p) => p.id === placement);
}

export function normalizeAdType(raw: string | undefined, placement: string): AdCategoryId {
  const fromPlacement = resolvePlacementMeta(placement)?.category;
  if (fromPlacement && fromPlacement !== 'bulk-import' && fromPlacement !== 'adsense') {
    return fromPlacement;
  }
  const key = (raw ?? '').trim().toLowerCase().replace(/\s+/g, '-');
  const aliases: Record<string, AdCategoryId> = {
    display: 'display',
    banner: 'display',
    'in-article': 'in-article',
    inarticle: 'in-article',
    native: 'native',
    sticky: 'sticky',
    video: 'video',
    interstitial: 'interstitial',
    sponsored: 'sponsored',
    affiliate: 'affiliate',
    featured: 'featured',
    newsletter: 'newsletter',
    push: 'push',
    classified: 'classified',
  };
  return aliases[key] ?? 'display';
}
