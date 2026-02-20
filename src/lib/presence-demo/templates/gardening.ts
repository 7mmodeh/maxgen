import type { PresenceDemoTemplate } from "../types";

export const gardening: PresenceDemoTemplate = {
  slug: "gardening",
  layoutId: "clean_classic",

  businessName: "MaxGen",
  nicheLabel: "Gardening & Tree Care",

  theme: {
    id: "gardening",
    accent: "#15803d",
    accentSoft: "#dcfce7",
    ink: "#0f172a",
    muted: "#475569",
    ring: "#e2e8f0",
  },

  hero: {
    headline: "Gardening & Tree Care — Fast Quotes, Tidy Finish",
    subheadline:
      "A clean, trusted local site with services, work photos, areas covered, and instant contact — built to convert.",
    badges: ["Fully insured", "Free quotes", "Fast response", "Clean finish"],
  },

  quickFacts: {
    ratingText: "4.9",
    reviewCountText: "100+ reviews",
    responseTimeText: "Replies fast",
    insuredText: "Fully insured",
  },

  services: [
    {
      title: "Tree Surgery & Removal",
      description: "Safe cutting, reduction and removal — tidy cleanup included.",
    },
    {
      title: "Hedge Cutting",
      description: "Shaping, trimming and maintenance for all hedge types.",
    },
    {
      title: "Garden Clearance",
      description: "Overgrown gardens cleared quickly — waste removed.",
    },
    {
      title: "Landscaping & Design",
      description: "Planting, layout refresh and durable finishes.",
    },
    {
      title: "Power Washing",
      description: "Patios, paths and driveways cleaned for an instant lift.",
    },
    {
      title: "Ongoing Maintenance",
      description: "Scheduled visits to keep the garden looking sharp.",
    },
  ],

  gallery: [
    {
      src: "/presence-demos/gardening/garden1.jpg",
      alt: "Gardening work photo 1",
      caption: "Recent work",
    },
    {
      src: "/presence-demos/gardening/garden2.jpg",
      alt: "Gardening work photo 2",
      caption: "Recent work",
    },
    {
      src: "/presence-demos/gardening/garden3.JPG",
      alt: "Gardening work photo 3",
      caption: "Recent work",
    },
    {
      src: "/presence-demos/gardening/garden4.jpg",
      alt: "Gardening work photo 4",
      caption: "Recent work",
    },
    {
      src: "/presence-demos/gardening/garden5.webp",
      alt: "Gardening work photo 5",
      caption: "Recent work",
    },
  ],

  trustBullets: [
    "Clear quote and agreed scope before starting",
    "Safety-first approach and proper equipment",
    "Respectful on-site and tidy finish",
    "Quick responses on WhatsApp",
    "Local service with consistent standards",
    "Photos of real work — no guesswork",
  ],

  testimonials: [
    {
      name: "Customer",
      location: "Offaly",
      stars: 5,
      quote: "Fast reply and a very tidy finish. Clear quote upfront.",
    },
    {
      name: "Customer",
      location: "Laois",
      stars: 5,
      quote: "Professional equipment and safe work — highly recommended.",
    },
    {
      name: "Customer",
      location: "Portarlington",
      stars: 5,
      quote: "Easy to book and the job was done quickly.",
    },
  ],

  areasCovered: [
    "Portarlington",
    "Co. Offaly",
    "Co. Laois",
    "Tullamore",
    "Edenderry",
    "Surrounding areas",
  ],

  contact: {
    phone: "+353 83 322 6565",
    phoneHref: "tel:+353833226565",
    whatsappHref: "https://wa.me/353833226565",
    note: "Demo layout — replace with your business details. Built by Maxgen Systems.",
  },
};
