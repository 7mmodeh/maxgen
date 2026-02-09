import type { PresenceDemoTemplate } from "../types";

const PHONE_DISPLAY = "+353 83 871 8415";
const PHONE_HREF = "tel:+353838718415";
const WHATSAPP_HREF = "https://wa.me/353838718415";

export const gardeningDemo: PresenceDemoTemplate = {
  slug: "gardening",
  nicheLabel: "Gardening & Tree Care",
  tagline: "Clean, local, trust-first site for quotes via WhatsApp or call.",
  hero: {
    headline: "Professional Tree Care & Gardening",
    subheadline:
      "Fast quotes, tidy work, and reliable service — with clear photos of recent jobs and the areas we cover.",
    badges: ["Fully insured", "Free quotes", "Fast response", "Local & reliable"],
    ctas: [
      { label: "WhatsApp for a Quote", href: WHATSAPP_HREF, variant: "primary" },
      { label: "Call Now", href: PHONE_HREF, variant: "secondary" },
    ],
  },
  services: [
    { title: "Tree Surgery & Removal", description: "Safe cutting, reduction, and removal with tidy cleanup." },
    { title: "Hedge Cutting", description: "Seasonal trimming, shaping, and maintenance for all hedge types." },
    { title: "Garden Clearance", description: "Overgrown gardens cleared quickly — waste removed." },
    { title: "Landscaping & Design", description: "Fresh layout, planting, and tidy finishes that last." },
    { title: "Power Washing", description: "Patios, paths, and driveways cleaned for an instant lift." },
    { title: "Ongoing Maintenance", description: "Keep your garden looking sharp with scheduled visits." },
  ],
  trustBullets: [
    "Clear upfront quote — no surprises",
    "Safety-first equipment and practices",
    "Respectful on-site, tidy finish",
    "Quick turnaround on messages",
  ],
  areasCovered: [
    "Portarlington",
    "Co. Offaly",
    "Co. Laois",
    "Tullamore",
    "Edenderry",
    "Surrounding areas",
  ],
  gallery: [
    { src: "/presence-demos/gardening/01.svg", alt: "Tree trimming demo photo", caption: "Tree trimming & tidy finish" },
    { src: "/presence-demos/gardening/02.svg", alt: "Hedge cutting demo photo", caption: "Hedge cutting — clean lines" },
    { src: "/presence-demos/gardening/03.svg", alt: "Garden clearance demo photo", caption: "Garden clearance — before/after" },
    { src: "/presence-demos/gardening/04.svg", alt: "Power washing demo photo", caption: "Power washing — patio refresh" },
    { src: "/presence-demos/gardening/05.svg", alt: "Landscaping demo photo", caption: "Landscaping — planting & finish" },
    { src: "/presence-demos/gardening/06.svg", alt: "Equipment demo photo", caption: "Safety-first equipment" },
  ],
  contact: {
    phoneDisplay: PHONE_DISPLAY,
    phoneHref: PHONE_HREF,
    whatsappHref: WHATSAPP_HREF,
    note: "Demo layout — content will be replaced with your business details.",
  },
  seo: {
    title: "Demo — Gardening & Tree Care | Maxgen Systems",
    description:
      "Live demo of a one-page online presence layout for gardening and tree care businesses: services, gallery, areas covered, and instant WhatsApp/call contact.",
  },
};
