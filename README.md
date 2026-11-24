# Tech in Diagrams

<p align="center">
  <a href="https://techindiagrams.cloud">
    <img src="https://techindiagrams.cloud/og-image.jpg" alt="Tech in Diagrams — Understand IT, one diagram at a time." width="800" />
  </a>
</p>

<p align="center">
  <strong>Understand IT, one diagram at a time.</strong>
</p>

<p align="center">
  A visual learning platform for understanding IT through clear, interactive technical diagrams.
</p>

<p align="center">
  <a href="https://techindiagrams.cloud"><strong>Visit techindiagrams.cloud →</strong></a>
</p>

---

## About

**Tech in Diagrams** is a diagram-first educational project designed to make modern IT concepts easier to understand.

Instead of starting with long articles, each concept begins with a visual explanation. Interactive diagrams show how components connect, how data moves, where responsibilities sit, and what changes when a system scales or fails.

The goal is simple: preserve technical accuracy while removing unnecessary complexity from the first explanation.

## What you can learn

The current library covers four main areas:

- **IT Fundamentals** — computers, operating systems, servers, databases, APIs
- **Cloud Computing** — cloud fundamentals, service models, virtual machines, networking, security, observability, AI and modern work
- **Architecture** — load balancing, client-server systems, monoliths vs microservices, CDNs
- **DevOps** — CI/CD, containers, infrastructure as code, monitoring and alerting

The platform currently includes **22 visual concepts**, with dedicated diagrams built for desktop and mobile.

## Diagram-first learning

Each concept is structured around the diagram itself.

Typical interactions include:

- animated request and data flows
- hover highlighting and relationship tracing
- click-to-explain contextual panels
- responsive layouts designed separately for mobile
- visual representations of failure, scaling, isolation and responsibility boundaries
- concise supporting explanations and terminology

The project deliberately avoids turning the learning experience into a traditional blog or quiz platform.

## Featured concepts

A few examples:

- [What is Cloud Computing?](https://techindiagrams.cloud/concepts/what-is-cloud-computing)
- [IaaS vs PaaS vs SaaS](https://techindiagrams.cloud/concepts/iaas-paas-saas)
- [What is a Load Balancer?](https://techindiagrams.cloud/concepts/what-is-a-load-balancer)
- [What is CI/CD?](https://techindiagrams.cloud/concepts/what-is-ci-cd)
- [What are Containers?](https://techindiagrams.cloud/concepts/what-are-containers)
- [Monitoring vs Observability](https://techindiagrams.cloud/concepts/monitoring-vs-observability)

## Design principles

Tech in Diagrams is built around a consistent visual language:

- large, spacious technical diagrams
- direct labels and clear system boundaries
- animated signal and request paths
- semantic use of color
- deep navy, electric blue and cyan as the core palette
- restrained motion and visual effects
- dedicated mobile compositions rather than scaled-down desktop diagrams
- accessibility through keyboard-friendly interactions and readable typography

## Tech stack

The application is built with:

- **React 19**
- **TypeScript**
- **TanStack Start / TanStack Router**
- **Vite**
- **Tailwind CSS**
- **Radix UI**
- **Lucide**
- reusable SVG-based interactive diagram components

## Project structure

```text
src/
├── components/
│   ├── diagram/       # Bespoke interactive diagram components
│   ├── site/          # Shared site components
│   └── ui/            # UI primitives
├── content/           # Structured concept and topic content
└── routes/            # Application routes

public/
├── favicon.svg
├── og-image.jpg
└── video/             # Visual media assets
```

## Run locally

### Requirements

- Node.js
- npm, pnpm, yarn, or Bun

### Setup

```bash
git clone https://github.com/takouadab/tech-in-diagrams.git
cd tech-in-diagrams
npm install
npm run dev
```

Then open the local development URL shown in your terminal.

### Production build

```bash
npm run build
```

## Live project

**Website:** [techindiagrams.cloud](https://techindiagrams.cloud)

---

<p align="center">
  <strong>Tech in Diagrams</strong><br />
  Understand IT, one diagram at a time.
</p>
