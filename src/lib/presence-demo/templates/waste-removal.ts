import type { PresenceDemoTemplate } from "../types";

const PHONE_DISPLAY = "+353 83 871 8415";
const PHONE_HREF = "tel:+353838718415";
const WHATSAPP_HREF = "https://wa.me/353838718415";

export const wasteRemovalDemo: PresenceDemoTemplate = {
  slug: "waste-removal",
  nicheLabel: "Waste Removal & Clearouts",
  tagline: "Multi-county credibility: areas covered, services, and instant booking CTA.",
  hero: {
    headline: "Waste Removal, Clearouts & Collection",
    subheadline:
      "Fast pickup, clear pricing, and reliable service across multiple counties — show customers exactly what you do and where you cover.",
    badges: ["Fast collection", "House & site clearouts", "Multi-county coverage", "Quote in minutes"],
    ctas: [
      { label: "WhatsApp for a Quote", href: WHATSAPP_HREF, variant: "primary" },
      { label: "Call Now", href: PHONE_HREF, variant: "secondary" },
    ],
  },
  services: [
    { title: "House Clearouts", description: "Furniture, bags, general waste — quick and tidy removal." },
    { title: "Garden Waste", description: "Green waste collection after trimming and clearance." },
    { title: "Shed / Garage Clearouts", description: "Declutter fast — we lift and load for you." },
    { title: "Construction & Site Waste", description: "Reliable site collections and clearouts." },
    { title: "Office & Commercial", description: "Clean removal for businesses and small commercial sites." },
    { title: "Same-Week Slots", description: "Flexible scheduling — message for availability." },
  ],
  trustBullets: [
    "Clear communication and arrival updates",
    "Respectful service — no mess left behind",
    "Coverage clearly listed (builds trust)",
    "Fast quote via WhatsApp",
  ],
  areasCovered: [
    "Dublin",
    "Kildare",
    "Meath",
    "Wicklow",
    "Offaly",
    "Surrounding areas",
  ],
  gallery: [
    { src: "/presence-demos/waste-removal/01.svg", alt: "Clearout demo photo", caption: "House clearout — quick turnaround" },
    { src: "/presence-demos/waste-removal/02.svg", alt: "Van loading demo photo", caption: "Lift & load — we handle it" },
    { src: "/presence-demos/waste-removal/03.svg", alt: "Garden waste demo photo", caption: "Garden waste collection" },
    { src: "/presence-demos/waste-removal/04.svg", alt: "Site waste demo photo", caption: "Construction & site waste" },
    { src: "/presence-demos/waste-removal/05.svg", alt: "Commercial demo photo", caption: "Commercial clearouts" },
    { src: "/presence-demos/waste-removal/06.svg", alt: "Coverage demo photo", caption: "Multi-county coverage" },
  ],
  contact: {
    phoneDisplay: PHONE_DISPLAY,
    phoneHref: PHONE_HREF,
    whatsappHref: WHATSAPP_HREF,
    note: "Demo layout — content will be replaced with your business details.",
  },
  seo: {
    title: "Demo — Waste Removal & Clearouts | Maxgen Systems",
    description:
      "Live demo of a one-page online presence layout for waste removal businesses: services, gallery, coverage areas, and instant WhatsApp/call contact.",
  },
};
