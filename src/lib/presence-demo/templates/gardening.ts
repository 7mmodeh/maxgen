import type { PresenceDemoTemplate } from "../types";

const PHONE_DISPLAY = "+353 83 871 8415";
const PHONE_HREF = "tel:+353838718415";
const WHATSAPP_HREF = "https://wa.me/353838718415";

export const gardeningDemo: PresenceDemoTemplate = {
  slug: "gardening",
  businessName: "Pat Quinn’s Gardening & Tree Care",
  nicheLabel: "Gardening & Tree Care",
  tagline: "A high-trust one-page site for quotes via WhatsApp or call.",

  theme: {
    id: "garden",
    accent: "#16a34a",
    accentSoft: "#dcfce7",
    surface: "#ffffff",
    ink: "#0f172a",
    muted: "#475569",
    ring: "#e2e8f0",
  },

  hero: {
    headline: "Tree Care & Gardening — Fast Quotes, Tidy Work",
    subheadline:
      "Show your recent work, list your services clearly, and make it easy for customers to request a quote instantly.",
    badges: ["Fully insured", "Free quotes", "Fast response", "Local & reliable"],
    ctas: [
      { label: "WhatsApp for a Quote", href: WHATSAPP_HREF, variant: "primary" },
      { label: "Call Now", href: PHONE_HREF, variant: "secondary" },
    ],
  },

  quickFacts: {
    ratingText: "4.9",
    reviewCountText: "120+ reviews",
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
    { name: "A. Murphy", location: "Portarlington", quote: "Quick reply on WhatsApp and the job was spotless. Very tidy finish.", stars: 5 },
    { name: "J. O’Connor", location: "Offaly", quote: "Arrived on time, clear quote, and the garden looks brand new.", stars: 5 },
    { name: "S. Kelly", location: "Laois", quote: "Professional equipment and safe work. Would recommend.", stars: 5 },
  ],

  contact: {
    phoneDisplay: PHONE_DISPLAY,
    phoneHref: PHONE_HREF,
    whatsappHref: WHATSAPP_HREF,
    note: "Demo layout — content will be replaced with your business details. Built by Maxgen Systems.",
  },

  seo: {
    title: "Demo — Gardening & Tree Care | Maxgen Systems",
    description:
      "Client-grade local service landing page demo: services, gallery, areas covered, testimonials and instant WhatsApp/call contact.",
  },
};
