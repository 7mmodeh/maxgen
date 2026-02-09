export type ThemeId = "gardening" | "waste" | "painting" | "premium";

export type LayoutId = "lp_premium" | "split_modern" | "clean_classic";

export type PresenceDemoTheme = {
  id: ThemeId;
  accent: string;
  accentSoft: string;
  ink: string;
  muted: string;
  ring: string;
};

export type PresenceDemoHero = {
  headline: string;
  subheadline: string;
  badges: readonly string[];
};

export type PresenceDemoQuickFacts = {
  ratingText: string;
  reviewCountText: string;
  responseTimeText: string;
  insuredText: string;
};

export type PresenceDemoContact = {
  phone: string;
  phoneHref: string;
  whatsappHref: string;
  note: string;
};

export type PresenceDemoService = {
  title: string;
  description: string;
};

/**
 * Canonical gallery image type used by DemoGalleryClient.
 * (Matches existing imports: DemoGalleryImage)
 */
export type DemoGalleryImage = {
  src: string;
  alt: string;
  caption?: string;
};

/**
 * Backwards-compatible alias (in case any file already referenced this name).
 */
export type PresenceDemoGalleryImage = DemoGalleryImage;

export type PresenceDemoTestimonial = {
  name: string;
  location?: string;
  stars: number; // 1..5
  quote: string;
};

export type PresenceDemoTemplate = {
  slug: string;
  layoutId: LayoutId;

  businessName: string;
  nicheLabel: string;

  theme: PresenceDemoTheme;

  hero: PresenceDemoHero;
  quickFacts: PresenceDemoQuickFacts;

  services: readonly PresenceDemoService[];
  gallery: readonly DemoGalleryImage[];

  trustBullets: readonly string[];
  testimonials: readonly PresenceDemoTestimonial[];
  areasCovered: readonly string[];

  contact: PresenceDemoContact;
};
