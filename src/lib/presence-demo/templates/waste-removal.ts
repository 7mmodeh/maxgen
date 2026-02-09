import type { PresenceDemoTemplate } from "../types";

export const wasteRemoval: PresenceDemoTemplate = {
  slug: "waste-removal",
  layoutId: "split_modern",

  businessName: "MaxGen",
  nicheLabel: "Waste Removal",

  theme: {
    id: "waste",
    accent: "#0ea5e9",
    accentSoft: "#e0f2fe",
    ink: "#0b1220",
    muted: "#475569",
    ring: "#e2e8f0",
  },

  hero: {
    headline: "Waste Removal — Fast Collection, Clear Pricing",
    subheadline:
      "A modern service site designed for trust at speed: services, coverage, proof photos, and instant contact.",
    badges: ["Big items", "House clearouts", "Same-week slots", "All areas"],
  },

  quickFacts: {
    ratingText: "4.8",
    reviewCountText: "150+ reviews",
    responseTimeText: "Fast replies",
    insuredText: "Licensed & insured",
  },

  services: [
    { title: "House Clearouts", description: "Full or partial clearouts — tidy and efficient." },
    { title: "Garden Waste", description: "Green waste removed quickly — bagged or loose." },
    { title: "Rubble & Builders Waste", description: "Heavy loads handled safely with proper disposal." },
    { title: "Appliances & Furniture", description: "Collection and removal — help with lifting if needed." },
    { title: "Garage / Shed Clearout", description: "Sorted, loaded, and taken away in one visit." },
    { title: "Commercial Waste", description: "Reliable repeat collections for small businesses." },
  ],

  gallery: [
    { src: "/presence-demos/waste-removal/waste1.jpg", alt: "Waste removal photo 1", caption: "Before / after" },
    { src: "/presence-demos/waste-removal/waste2.png", alt: "Waste removal photo 2", caption: "Collection" },
    { src: "/presence-demos/waste-removal/waste3.jpg", alt: "Waste removal photo 3", caption: "Load" },
    { src: "/presence-demos/waste-removal/waste4.jpg", alt: "Waste removal photo 4", caption: "Clearout" },
    { src: "/presence-demos/waste-removal/waste5.png", alt: "Waste removal photo 5", caption: "Result" },
  ],

  trustBullets: [
    "Clear quote before collection",
    "Proper disposal and standards",
    "Reliable scheduling and updates",
    "Photos of the load when collected",
    "Fast WhatsApp booking",
    "Wide coverage for multi-county work",
  ],

  testimonials: [
    { name: "Customer", location: "Dublin", stars: 5, quote: "Booked on WhatsApp and collected quickly — no hassle." },
    { name: "Customer", location: "Kildare", stars: 5, quote: "Clear pricing and turned up exactly when said." },
    { name: "Customer", location: "Meath", stars: 5, quote: "Big clearout done fast. Great communication." },
  ],

  areasCovered: ["Dublin", "Kildare", "Meath", "Wicklow", "Louth", "Surrounding areas"],

  contact: {
    phone: "+353 83 871 8415",
    phoneHref: "tel:+353838718415",
    whatsappHref: "https://wa.me/353838718415",
    note: "Demo layout — replace with your business details. Built by Maxgen Systems.",
  },
};
