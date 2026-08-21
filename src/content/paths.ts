import { conceptBySlug } from "./concepts";
import type { LearningPath } from "./types";

const step = (slug: string) => ({ slug, title: conceptBySlug(slug)?.title ?? slug });

export const learningPaths: LearningPath[] = [
  {
    slug: "it-basics",
    name: "IT Basics",
    summary: "The vocabulary everything else assumes: machines, operating systems, servers, data and APIs.",
    level: "Beginner",
    steps: [
      step("what-is-a-computer"),
      step("what-is-an-operating-system"),
      step("what-is-a-server"),
      step("what-is-a-database"),
      step("what-is-an-api"),
    ],
  },
  {
    slug: "cloud-fundamentals",
    name: "Cloud Fundamentals",
    summary: "From the definition of cloud computing to service models, virtual machines, regions and security.",
    level: "Beginner",
    steps: [
      step("what-is-cloud-computing"),
      step("iaas-paas-saas"),
      step("what-is-a-virtual-machine"),
      step("cloud-networking-basics"),
      step("regions-and-availability-zones"),
      step("cloud-security-basics"),
    ],
  },
  {
    slug: "devops-foundations",
    name: "DevOps Foundations",
    summary: "How modern software is shipped and kept running: pipelines, containers, automation and signals.",
    level: "Intermediate",
    steps: [
      step("what-is-ci-cd"),
      step("what-are-containers"),
      step("infrastructure-as-code"),
      step("monitoring-and-alerting"),
      step("monitoring-vs-observability"),
    ],
  },
];

export const pathBySlug = (slug: string) => learningPaths.find((p) => p.slug === slug);
