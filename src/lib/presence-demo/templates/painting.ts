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
    { src: "/presence-demos/painting/paint1.jpg", alt: "Painting work photo 1", caption: "Before / After" },
    { src: "/presence-demos/painting/paint2.webp", alt: "Painting work photo 2", caption: "Interior finish" },
    { src: "/presence-demos/painting/paint3.jpg", alt: "Painting work photo 3", caption: "Clean lines" },
    { src: "/presence-demos/painting/pain4.jpg", alt: "Painting work photo 4", caption: "Panelling / detail" },
    { src: "/presence-demos/painting/paint5.jpg", alt: "Painting work photo 5", caption: "Premium finish" },
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
