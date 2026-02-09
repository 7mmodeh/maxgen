import type { PresenceDemoTemplate } from "../types";

const PHONE_DISPLAY = "+353 83 871 8415";
const PHONE_HREF = "tel:+353838718415";
const WHATSAPP_HREF = "https://wa.me/353838718415";

export const paintingDemo: PresenceDemoTemplate = {
  slug: "painting",
  businessName: "MaxGen",
  nicheLabel: "Painting & Interiors",
  tagline: "Premium lead-gen landing page demo.",

  theme: {
    id: "premium",
    accent: "#b45309",
    accentSoft: "#fff7ed",
    surface: "#ffffff",
    ink: "#0f172a",
    muted: "#475569",
    ring: "#e2e8f0",
  },

  hero: {
    headline: "Painting, Panelling & Interior Finishes",
    subheadline:
      "A premium landing page built for high-quality leads: transformations, services, testimonials and a fast quote flow above the fold.",
    badges: ["Premium finish", "Clean worksite", "Prep done right", "Fast quotes"],
    ctas: [
      { label: "WhatsApp for a Quote", href: WHATSAPP_HREF, variant: "primary" },
      { label: "Call Now", href: PHONE_HREF, variant: "secondary" },
    ],
  },

  quickFacts: {
    ratingText: "5.0",
    reviewCountText: "Top-rated",
    responseTimeText: "Fast replies",
    insuredText: "Professional finish",
  },

  services: [
    { title: "Interior Painting", description: "Walls, ceilings and trims — clean lines and tidy work." },
    { title: "Wall Panelling", description: "Modern panels that lift the room instantly." },
    { title: "Feature Walls", description: "Accents and statement finishes that look premium." },
    { title: "Prep & Repair", description: "Filling, sanding, smoothing — finish starts with prep." },
    { title: "Woodwork & Doors", description: "Skirting, architraves, doors — refined paintwork." },
    { title: "Refresh & Repaint", description: "Fast refresh for rentals, sales prep or seasonal updates." },
  ],

  trustBullets: [
    "Protective covering and tidy worksite",
    "Clear quote and timeline",
    "Finish-focused approach",
    "Photos that prove quality",
    "Premium look that matches the service level",
    "Simple quote flow that converts high-value leads",
  ],

  areasCovered: ["Dublin", "Kildare", "Meath", "Wicklow", "Laois", "Surrounding areas"],

  gallery: [
    { src: "/presence-demos/painting/paint1.jpg", alt: "Painting work photo 1", caption: "Before / After" },
    { src: "/presence-demos/painting/paint2.webp", alt: "Painting work photo 2", caption: "Interior finish" },
    { src: "/presence-demos/painting/paint3.jpg", alt: "Painting work photo 3", caption: "Clean lines" },
    { src: "/presence-demos/painting/pain4.jpg", alt: "Painting work photo 4", caption: "Panelling / detail" },
    { src: "/presence-demos/painting/paint5.jpg", alt: "Painting work photo 5", caption: "Premium finish" },
  ],

  testimonials: [
    { name: "Customer", location: "Dublin", quote: "Very clean finish and great attention to detail.", stars: 5 },
    { name: "Customer", location: "Wicklow", quote: "The panelling looks unreal — professional work.", stars: 5 },
    { name: "Customer", location: "Kildare", quote: "Quick quote, clear timeline, and the result is premium.", stars: 5 },
  ],

  contact: {
    phoneDisplay: PHONE_DISPLAY,
    phoneHref: PHONE_HREF,
    whatsappHref: WHATSAPP_HREF,
    note: "Demo layout — replace with your business details. Built by Maxgen Systems.",
  },

  seo: {
    title: "Demo — Painting & Interiors | Maxgen Systems",
    description:
      "Premium client-grade landing page demo for painting & interiors: hero + quote form, gallery, services, testimonials and instant WhatsApp/call contact.",
  },
};
