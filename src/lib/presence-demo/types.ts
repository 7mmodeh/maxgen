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

export type PresenceDemoTemplate = {
  slug: string;
  nicheLabel: string; // e.g., "Gardening & Tree Care"
  tagline: string; // short line for gallery cards
  hero: {
    headline: string;
    subheadline: string;
    badges: readonly string[];
    ctas: readonly DemoCta[];
  };
  services: readonly DemoService[];
  trustBullets: readonly string[];
  areasCovered: readonly string[];
  gallery: readonly DemoGalleryImage[];
  contact: {
    phoneDisplay: string;
    phoneHref: string; // tel:
    whatsappHref: string; // https://wa.me/...
    note: string;
  };
  seo: {
    title: string;
    description: string;
  };
};
