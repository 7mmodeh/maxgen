import type { PresenceDemoTemplate } from "../types";

export const painting: PresenceDemoTemplate = {
  slug: "painting",
  layoutId: "lp_premium",

  businessName: "MaxGen",
  nicheLabel: "Painting & Interiors",

  theme: {
    id: "painting",
    accent: "#7c3aed",
    accentSoft: "#ede9fe",
    ink: "#0f172a",
    muted: "#475569",
    ring: "#e2e8f0",
  },

  hero: {
    headline: "Painting & Interiors — Premium Finish, Clean Lines",
    subheadline:
      "A lead-gen landing page built for higher-value jobs: before/after proof, premium trust signals, and instant quote flow.",
    badges: ["Premium finish", "Tidy work", "Clear quote", "Fast response"],
  },

  quickFacts: {
    ratingText: "4.9",
    reviewCountText: "200+ reviews",
    responseTimeText: "Replies fast",
    insuredText: "Fully insured",
  },

  services: [
    { title: "Interior Painting", description: "Walls, ceilings, woodwork — crisp lines and clean finish." },
    { title: "Wall Panelling", description: "Feature panels fitted and finished to a premium standard." },
    { title: "Exterior Painting", description: "Weather-ready prep and durable coats." },
    { title: "Spray Finish", description: "Smooth finishes for doors, cabinets, and trim." },
    { title: "Prep & Repairs", description: "Fill, sand and prime — the difference is in the prep." },
    { title: "Commercial", description: "Offices and units — scheduled to reduce disruption." },
  ],

  gallery: [
    { src: "/presence-demos/painting/paint1.jpg", alt: "Painting work photo 1", caption: "Before / after" },
    { src: "/presence-demos/painting/paint2.webp", alt: "Painting work photo 2", caption: "Finish" },
    { src: "/presence-demos/painting/paint3.jpg", alt: "Painting work photo 3", caption: "Detail" },
    { src: "/presence-demos/painting/pain4.jpg", alt: "Painting work photo 4", caption: "Transformation" },
    { src: "/presence-demos/painting/paint5.jpg", alt: "Painting work photo 5", caption: "Result" },
  ],

  trustBullets: [
    "Detailed quote and clear scope",
    "Premium prep for long-lasting results",
    "Protective coverings and tidy finish",
    "Fast WhatsApp updates",
    "Before/after proof and references",
    "Work scheduled to suit your time",
  ],

  testimonials: [
    { name: "Customer", location: "Dublin", stars: 5, quote: "Very clean finish and excellent communication." },
    { name: "Customer", location: "Kildare", stars: 5, quote: "Quote was clear, job was tidy and on time." },
    { name: "Customer", location: "Wicklow", stars: 5, quote: "Transformed the room — high quality work." },
  ],

  areasCovered: ["Dublin", "Kildare", "Wicklow", "Meath", "Louth", "Surrounding areas"],

  contact: {
    phone: "+353 83 871 8415",
    phoneHref: "tel:+353838718415",
    whatsappHref: "https://wa.me/353838718415",
    note: "Demo layout — replace with your business details. Built by Maxgen Systems.",
  },
};
