import type { PresenceDemoTemplate } from "../types";

const PHONE_DISPLAY = "+353 83 871 8415";
const PHONE_HREF = "tel:+353838718415";
const WHATSAPP_HREF = "https://wa.me/353838718415";

export const paintingDemo: PresenceDemoTemplate = {
  slug: "painting",
  nicheLabel: "Painting & Interiors",
  tagline: "Premium feel: before/after gallery, service clarity, and fast contact.",
  hero: {
    headline: "Painting, Panelling & Interior Finishes",
    subheadline:
      "Turn your work into a premium online presence — show transformations, highlight services, and make it easy for customers to book.",
    badges: ["Clean finish", "Before/after photos", "Premium look", "Fast quotes"],
    ctas: [
      { label: "WhatsApp for a Quote", href: WHATSAPP_HREF, variant: "primary" },
      { label: "Call Now", href: PHONE_HREF, variant: "secondary" },
    ],
  },
  services: [
    { title: "Interior Painting", description: "Walls, ceilings, trims — sharp lines and clean coverage." },
    { title: "Wall Panelling", description: "Modern panels that lift the room instantly." },
    { title: "Feature Walls", description: "Accents, colour blocks, and statement finishes." },
    { title: "Prep & Repair", description: "Filling, sanding, smoothing — the finish starts with prep." },
    { title: "Woodwork & Doors", description: "Skirting, architraves, doors — refined, durable paintwork." },
    { title: "Refresh & Repaint", description: "Fast refresh for rentals, sales prep, or seasonal updates." },
  ],
  trustBullets: [
    "Protective covering and tidy worksite",
    "Clear quote and timeline",
    "Finish-focused approach",
    "Photos that prove quality",
  ],
  areasCovered: [
    "Dublin",
    "Kildare",
    "Meath",
    "Wicklow",
    "Laois",
    "Surrounding areas",
  ],
  gallery: [
    { src: "/presence-demos/painting/01.svg", alt: "Before/after demo photo", caption: "Before/after transformation" },
    { src: "/presence-demos/painting/02.svg", alt: "Panelling demo photo", caption: "Wall panelling finish" },
    { src: "/presence-demos/painting/03.svg", alt: "Feature wall demo photo", caption: "Feature wall — premium look" },
    { src: "/presence-demos/painting/04.svg", alt: "Prep work demo photo", caption: "Prep & repair — smooth base" },
    { src: "/presence-demos/painting/05.svg", alt: "Woodwork demo photo", caption: "Woodwork & trims" },
    { src: "/presence-demos/painting/06.svg", alt: "Clean finish demo photo", caption: "Clean lines, tidy finish" },
  ],
  contact: {
    phoneDisplay: PHONE_DISPLAY,
    phoneHref: PHONE_HREF,
    whatsappHref: WHATSAPP_HREF,
    note: "Demo layout — content will be replaced with your business details.",
  },
  seo: {
    title: "Demo — Painting & Interiors | Maxgen Systems",
    description:
      "Live demo of a one-page online presence layout for painting and interiors: services, transformation gallery, areas covered, and instant WhatsApp/call contact.",
  },
};
