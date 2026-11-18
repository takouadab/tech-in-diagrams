# Diagrams First IT

Build a new educational web platform called **Tech in Diagrams**.

Core promise: **Understand IT, one diagram at a time.**

This product must be **diagram-first**, not article-first, not blog-first, and not quiz-based.

The website is for beginners, students, career changers, and non-technical professionals who want to understand modern IT visually.

## Primary content areas
Use only these 4 top-level learning areas:
1. IT Fundamentals
2. Cloud Computing
3. Architecture
4. DevOps

Important taxonomy rules:
- AI must NOT be a separate top-level category. Put AI topics inside **Cloud Computing → AI in the Cloud**.
- Microsoft 365 and Copilot must NOT be separate top-level categories. Put them inside **Cloud Computing → Microsoft Cloud & Modern Work**.

## Product philosophy
Every concept page should begin with a large, interactive technical diagram. The diagram is the main learning experience.

Do NOT build long educational articles.
Do NOT build quizzes.
Do NOT build a blog.
Do NOT create a generic SaaS dashboard.
Do NOT create a cyberpunk / hacker aesthetic.

The site should feel like a premium educational technology product with excellent typography, generous spacing, clear hierarchy, and modern interactive diagrams.

## Main pages
Create:
- Home
- Learn
- Explore
- Learning Paths
- Topic page
- Concept page
- About

## Navigation
Desktop navigation:
Tech in Diagrams | Learn | Explore | Learning Paths | About | Start Learning

On mobile, use a polished compact navigation.

## Home page
Hero:
Title: **Learn IT visually.**
Subtitle: **Understand cloud, architecture, DevOps and core IT concepts through clear interactive diagrams and simple explanations.**
Primary CTA: **Start Learning**
Secondary CTA: **Explore Topics**

The hero itself should contain a beautiful animated technical diagram, not a stock illustration.
Show an example system such as:
User → Application → API → Cloud Services → Database / Monitoring
with subtle animated signal/data flow.

Then show the 4 learning areas as premium cards:
- IT Fundamentals — Build the foundations.
- Cloud Computing — Understand modern cloud.
- Architecture — See how systems connect.
- DevOps — Learn how modern systems run.

Then show a section called **Learn through diagrams** with 3 featured concepts.

Then show **Learning Paths**.

## Concept page — this is the most important page
The concept page must be diagram-first.

Layout:
1. Breadcrumb
2. Concept title
3. Short metadata row: Beginner / Intermediate / Advanced + estimated reading time
4. One short one-sentence introduction
5. LARGE interactive diagram occupying the main visual area
6. Small supporting explanation sections below the diagram

The large diagram should support:
- hover a node → highlight related connection(s)
- click a node → open a small contextual explanation panel
- animated data/signal flow where relevant
- smooth subtle transitions
- clear labels directly on nodes
- responsive scaling

Below the diagram, keep supporting content concise. Use this structure:
- **What you are looking at** — 2–4 sentences
- **How it works** — short step sequence
- **Why it matters** — 2–4 sentences
- **Key terms** — compact glossary cards
- **Common misconception** — one short callout
- **Real-world example** — one practical scenario
- **Sources & further reading** — official references
- **Next concept** — strong visual CTA

Again: no quiz and no long article.

## First real concept to implement
Create a polished concept page for:
**What is Cloud Computing?**

The main diagram should visually explain:
User or team → Network / Internet → Cloud Provider → Compute / Storage / Databases / Managed Services

Use animated signal/data flow from the user toward the cloud services.

The cloud diagram should make these ideas visible:
- on-demand access
- broad network access
- shared resource pool
- elasticity
- measured usage

Use small pills or labels around the cloud provider area for these 5 ideas.

The diagram must teach that the physical infrastructure still exists; the provider operates it while the customer consumes configurable resources as services.

Supporting content should be concise and technically correct.

## Example content cards for Explore
Create starter concepts such as:
IT Fundamentals:
- What is a Computer?
- What is an Operating System?
- What is a Server?
- What is a Database?
- What is an API?

Cloud Computing:
- What is Cloud Computing?
- IaaS vs PaaS vs SaaS
- What is a Virtual Machine?
- Cloud Networking Basics
- Regions & Availability Zones
- Cloud Security Basics
- Monitoring vs Observability
- AI in the Cloud
- Microsoft Cloud & Modern Work

Architecture:
- What is a Load Balancer?
- Client-Server Architecture
- Monolith vs Microservices
- What is a CDN?

DevOps:
- What is CI/CD?
- What are Containers?
- Infrastructure as Code
- Monitoring and Alerting

## Learning Paths
Create 3 initial paths:
1. IT Basics
2. Cloud Fundamentals
3. DevOps Foundations

Keep them visual. Show concepts as connected steps, not plain lists.

## Visual design direction
Create a premium modern visual identity for Tech in Diagrams.

Style:
- light background as default
- deep navy text
- electric blue as primary accent
- cyan as secondary accent
- optional subtle violet accents
- white / soft tinted cards
- thin borders
- restrained shadows
- rounded corners
- excellent whitespace
- modern geometric technical feel

Avoid:
- cyberpunk
- dark gaming aesthetic
- rainbow gradients everywhere
- generic stock illustrations
- excessive glassmorphism
- excessive neon
- clutter

Typography should feel modern, calm and highly readable.

## Diagram visual language
Create a reusable diagram design system:
- rounded technical nodes
- direct labels
- thin connectors
- animated dots/pulses for data flow
- clear arrow direction
- hover highlighting
- contextual popovers / side panels
- consistent semantic icon style
- responsive SVG or equivalent vector-based rendering

The same visual language must be reusable across future topics.

## Content model
Build the code so concepts are reusable structured data, not hardcoded one-off pages.
Each concept should support fields for:
- title
- slug
- topic
- difficulty
- estimated time
- short introduction
- diagram definition
- what you are looking at
- how it works
- why it matters
- key terms
- misconception
- real-world example
- official sources
- next concept

## Sources
For the Cloud Computing concept, include official sources in the UI for:
- NIST SP 800-145 — The NIST Definition of Cloud Computing
- Microsoft Learn cloud fundamentals / describe cloud computing
- AWS official cloud computing overview

Do not invent technical claims. Keep beginner explanations precise.

## SEO and responsiveness
- fully responsive mobile / tablet / desktop
- accessible labels and keyboard-friendly interactions
- sensible page titles and metadata
- semantic HTML where appropriate

## Scope for this first build
Build a polished working V1 with reusable components and a strong first concept page.
Do not add authentication, payments, user accounts, comments, forums, certificates, progress tracking, gamification, newsletter, or quizzes yet.

The result should immediately communicate that **Tech in Diagrams is a visual learning platform where diagrams are the product**.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://tech-in-diagrams.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/39a53a4b-5613-4d20-b82f-da91dbdc6438).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
