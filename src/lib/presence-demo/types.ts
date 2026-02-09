export type DemoCta = {
  label: string;
  href: string;
  variant: "primary" | "secondary";
};

export type DemoService = {
  title: string;
  description: string;
};

export type DemoGalleryImage = {
  src: string; // public/ path
  alt: string;
  caption?: string;
};

export type DemoTestimonial = {
  name: string;
  location?: string;
  quote: string;
  stars: 5 | 4;
};

export type DemoTheme = {
  id: "garden" | "waste" | "premium";
  accent: string; // CSS color value e.g. "#16a34a"
  accentSoft: string; // lighter background tint e.g. "#dcfce7"
  surface: string; // card surface e.g. "#ffffff"
  ink: string; // primary text e.g. "#0f172a"
  muted: string; // secondary text e.g. "#475569"
  ring: string; // border / divider e.g. "#e2e8f0"
};

export type PresenceDemoTemplate = {
  slug: string;

  // client-facing identity for the demo site
  businessName: string;
  nicheLabel: string; // e.g. "Gardening & Tree Care"
  tagline: string; // for gallery cards and meta

  theme: DemoTheme;

  hero: {
    headline: string;
    subheadline: string;
    badges: readonly string[];
    ctas: readonly DemoCta[];
  };

  quickFacts: {
    ratingText: string; // e.g. "4.9"
    reviewCountText: string; // e.g. "120+ reviews"
    responseTimeText: string; // e.g. "Replies fast"
    insuredText: string; // e.g. "Fully insured"
  };

  services: readonly DemoService[];
  trustBullets: readonly string[];
  areasCovered: readonly string[];
  gallery: readonly DemoGalleryImage[];
  testimonials: readonly DemoTestimonial[];

  contact: {
    phoneDisplay: string;
    phoneHref: string; // tel:
    whatsappHref: string; // https://wa.me/...
    note: string; // demo disclosure
  };

  seo: {
    title: string;
    description: string;
  };
};
