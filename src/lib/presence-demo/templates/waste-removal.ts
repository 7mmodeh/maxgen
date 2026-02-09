import type { PresenceDemoTemplate } from "../types";

const PHONE_DISPLAY = "+353 83 871 8415";
const PHONE_HREF = "tel:+353838718415";
const WHATSAPP_HREF = "https://wa.me/353838718415";

export const wasteRemovalDemo: PresenceDemoTemplate = {
  slug: "waste-removal",
  businessName: "MaxGen",
  nicheLabel: "Waste Removal & Clearouts",
  tagline: "Premium credibility-first landing page demo.",

  theme: {
    id: "waste",
    accent: "#0f2a5f",
    accentSoft: "#e6eefc",
    surface: "#ffffff",
    ink: "#0b1220",
    muted: "#475569",
    ring: "#e2e8f0",
  },

  hero: {
    headline: "Waste Removal & Clearouts — Fast Collection",
    subheadline:
      "A premium trust-focused page: what you remove, where you cover, and a fast quote flow that converts visitors into bookings.",
    badges: ["Fast collection", "House & site clearouts", "Multi-area coverage", "Quote in minutes"],
    ctas: [
      { label: "WhatsApp for a Quote", href: WHATSAPP_HREF, variant: "primary" },
      { label: "Call Now", href: PHONE_HREF, variant: "secondary" },
    ],
  },

  quickFacts: {
    ratingText: "4.8",
    reviewCountText: "200+ jobs",
    responseTimeText: "Same-day replies",
    insuredText: "Trusted local service",
  },

  services: [
    { title: "House Clearouts", description: "Furniture, bags, general waste — quick and tidy removal." },
    { title: "Garden Waste", description: "Green waste collection after trimming and clearance." },
    { title: "Shed / Garage Clearouts", description: "Declutter fast — we lift and load for you." },
    { title: "Construction & Site Waste", description: "Reliable collections for building and renovation waste." },
    { title: "Office & Commercial", description: "Clean removal for businesses and small commercial sites." },
    { title: "Flexible Slots", description: "Message for availability — fast turnaround when needed." },
  ],

  trustBullets: [
    "Clear communication and arrival updates",
    "Tidy removal — no mess left behind",
    "Coverage areas listed clearly (reduces hesitation)",
    "Fast quote via WhatsApp",
    "Reliable service for repeat customers",
    "Straightforward info for Google visitors",
  ],

  areasCovered: ["Dublin", "Kildare", "Meath", "Wicklow", "Offaly", "Surrounding areas"],

  gallery: [
    { src: "/presence-demos/waste-removal/waste1.jpg", alt: "Waste removal photo 1", caption: "Clearout" },
    { src: "/presence-demos/waste-removal/waste2.png", alt: "Waste removal photo 2", caption: "Collection" },
    { src: "/presence-demos/waste-removal/waste3.jpg", alt: "Waste removal photo 3", caption: "Load & remove" },
    { src: "/presence-demos/waste-removal/waste4.jpg", alt: "Waste removal photo 4", caption: "Site waste" },
    { src: "/presence-demos/waste-removal/waste5.png", alt: "Waste removal photo 5", caption: "Job done" },
  ],

  testimonials: [
    { name: "Customer", location: "Dublin", quote: "Booked by WhatsApp — quick collection and no hassle.", stars: 5 },
    { name: "Customer", location: "Kildare", quote: "Clear quote and arrived when they said. Very reliable.", stars: 5 },
    { name: "Customer", location: "Meath", quote: "Clean removal and friendly service. Would use again.", stars: 5 },
  ],

  contact: {
    phoneDisplay: PHONE_DISPLAY,
    phoneHref: PHONE_HREF,
    whatsappHref: WHATSAPP_HREF,
    note: "Demo layout — replace with your business details. Built by Maxgen Systems.",
  },

  seo: {
    title: "Demo — Waste Removal & Clearouts | Maxgen Systems",
    description:
      "Premium landing page demo for waste removal: hero + quote form, services, areas covered, gallery, testimonials and instant WhatsApp/call contact.",
  },
};
