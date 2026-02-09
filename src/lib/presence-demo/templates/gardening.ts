import type { PresenceDemoTemplate } from "../types";

const PHONE_DISPLAY = "+353 83 871 8415";
const PHONE_HREF = "tel:+353838718415";
const WHATSAPP_HREF = "https://wa.me/353838718415";

export const gardeningDemo: PresenceDemoTemplate = {
  slug: "gardening",
  businessName: "MaxGen",
  nicheLabel: "Gardening & Tree Care",
  tagline: "Premium local service landing page demo.",

  theme: {
    id: "garden",
    accent: "#15803d",
    accentSoft: "#dcfce7",
    surface: "#ffffff",
    ink: "#0f172a",
    muted: "#475569",
    ring: "#e2e8f0",
  },

  hero: {
    headline: "Gardening & Tree Care — Fast Quotes, Tidy Finish",
    subheadline:
      "A premium one-page site that shows your services, recent work, areas covered and a fast quote flow — designed to convert visitors into enquiries.",
    badges: ["Fully insured", "Free quotes", "Fast response", "Clean finish"],
    ctas: [
      { label: "WhatsApp for a Quote", href: WHATSAPP_HREF, variant: "primary" },
      { label: "Call Now", href: PHONE_HREF, variant: "secondary" },
    ],
  },

  quickFacts: {
    ratingText: "4.9",
    reviewCountText: "100+ reviews",
    responseTimeText: "Replies fast",
    insuredText: "Fully insured",
  },

  services: [
    { title: "Tree Surgery & Removal", description: "Safe cutting, reduction and removal — tidy cleanup included." },
    { title: "Hedge Cutting", description: "Shaping, trimming and maintenance for all hedge types." },
    { title: "Garden Clearance", description: "Overgrown gardens cleared quickly — waste removed." },
    { title: "Landscaping & Design", description: "Planting, layout refresh and durable finishes." },
    { title: "Power Washing", description: "Patios, paths and driveways cleaned for an instant lift." },
    { title: "Ongoing Maintenance", description: "Scheduled visits to keep the garden looking sharp." },
  ],

  trustBullets: [
    "Clear quote and agreed scope before starting",
    "Safety-first approach and proper equipment",
    "Respectful on-site and tidy finish",
    "Quick responses on WhatsApp",
    "Local service with consistent standards",
    "Photos of real work — no guesswork",
  ],

  areasCovered: ["Portarlington", "Co. Offaly", "Co. Laois", "Tullamore", "Edenderry", "Surrounding areas"],

  gallery: [
    { src: "/presence-demos/gardening/garden1.jpg", alt: "Gardening work photo 1", caption: "Recent work" },
    { src: "/presence-demos/gardening/garden2.jpg", alt: "Gardening work photo 2", caption: "Recent work" },
    { src: "/presence-demos/gardening/garden3.JPG", alt: "Gardening work photo 3", caption: "Recent work" },
    { src: "/presence-demos/gardening/garden4.jpg", alt: "Gardening work photo 4", caption: "Recent work" },
    { src: "/presence-demos/gardening/garden5.webp", alt: "Gardening work photo 5", caption: "Recent work" },
  ],

  testimonials: [
    { name: "Customer", location: "Offaly", quote: "Fast reply and a very tidy finish. Clear quote upfront.", stars: 5 },
    { name: "Customer", location: "Laois", quote: "Professional equipment and safe work — highly recommended.", stars: 5 },
    { name: "Customer", location: "Portarlington", quote: "Easy to book and the job was done quickly.", stars: 5 },
  ],

  contact: {
    phoneDisplay: PHONE_DISPLAY,
    phoneHref: PHONE_HREF,
    whatsappHref: WHATSAPP_HREF,
    note: "Demo layout — replace with your business details. Built by Maxgen Systems.",
  },

  seo: {
    title: "Demo — Gardening & Tree Care | Maxgen Systems",
    description:
      "Premium client landing page demo: hero + quote form, services, gallery, areas covered, testimonials, and instant WhatsApp/call contact.",
  },
};
