import type { Topic } from "./types";

export const topics: Topic[] = [
  {
    slug: "it-fundamentals",
    name: "IT Fundamentals",
    tagline: "Build the foundations.",
    description:
      "The building blocks every other topic depends on: hardware, operating systems, servers, data and interfaces.",
    subAreas: ["Hardware & Computers", "Operating Systems", "Servers & Storage", "Data & APIs"],
  },
  {
    slug: "cloud-computing",
    name: "Cloud Computing",
    tagline: "Understand modern cloud.",
    description:
      "How on-demand computing works: service models, virtualisation, networking, regions, security, observability, AI services and Microsoft cloud workplaces.",
    subAreas: [
      "Cloud Concepts",
      "Compute & Virtualisation",
      "Cloud Networking",
      "Security & Governance",
      "AI in the Cloud",
      "Microsoft Cloud & Modern Work",
    ],
  },
  {
    slug: "architecture",
    name: "Architecture",
    tagline: "See how systems connect.",
    description:
      "The shapes of real systems: clients and servers, load balancing, service boundaries and content delivery.",
    subAreas: ["System Shapes", "Traffic & Scaling", "Service Boundaries", "Delivery"],
  },
  {
    slug: "devops",
    name: "DevOps",
    tagline: "Learn how modern systems run.",
    description:
      "How software gets built, shipped and operated: pipelines, containers, infrastructure as code and operational signals.",
    subAreas: ["Delivery Pipelines", "Containers", "Automation", "Operations"],
  },
];

export const topicBySlug = (slug: string) => topics.find((t) => t.slug === slug);
