import { chainDiagram } from "./diagram-helpers";
import type { Concept, DiagramDef } from "./types";

const cloudDiagram: DiagramDef = {
  width: 1320,
  height: 890,
  caption:
    "A customer reaches provider-operated infrastructure over a network and consumes it as configurable services. Click a node or a characteristic for a short explanation.",
  legend: [
    { label: "People & teams", tone: "actor" },
    { label: "Network", tone: "network" },
    { label: "Cloud services", tone: "service" },
    { label: "Physical infrastructure", tone: "platform" },
  ],
  groups: [
    {
      id: "provider",
      label: "Cloud provider",
      sub: "Operates and maintains everything inside this boundary",
      x: 560,
      y: 96,
      w: 730,
      h: 700,
      tone: "primary",
    },
  ],
  pills: [
    { label: "On-demand self-service", note: "You provision resources yourself, in minutes, without a human on the provider side.", x: 700, y: 48 },
    { label: "Broad network access", note: "Services are reachable over the network from many kinds of device and location.", x: 960, y: 48 },
    { label: "Resource pooling", note: "Physical capacity is shared across many customers and assigned dynamically.", x: 1180, y: 48 },
    { label: "Rapid elasticity", note: "Capacity can grow and shrink quickly to match real demand.", x: 720, y: 846 },
    { label: "Measured service", note: "Usage is metered, so you pay for what you actually consume.", x: 1000, y: 846 },
  ],
  nodes: [
    {
      id: "user",
      label: "User or team",
      sub: "Laptop, phone, app",
      kind: "actor",
      x: 110,
      y: 400,
      w: 180,
      h: 116,
      detail:
        "The cloud customer. A person, an application or a whole team requests resources through a portal, CLI or API instead of buying hardware.",
    },
    {
      id: "net",
      label: "Network",
      sub: "Internet · TLS requests",
      kind: "network",
      x: 410,
      y: 400,
      w: 200,
      h: 116,
      detail:
        "Cloud services are consumed over a network. That network access is what makes the same service usable from an office, a home laptop or another cloud service.",
    },
    {
      id: "compute",
      label: "Compute",
      sub: "VMs · containers · functions",
      kind: "service",
      x: 930,
      y: 236,
      w: 420,
      h: 100,
      detail:
        "Processing capacity you rent: virtual machines, container platforms or functions. You choose size and quantity; the provider supplies the servers underneath.",
    },
    {
      id: "storage",
      label: "Storage",
      sub: "Object · file · block",
      kind: "service",
      x: 930,
      y: 356,
      w: 420,
      h: 100,
      detail:
        "Durable places to keep data — object storage for files and backups, block storage for disks attached to compute, file shares for traditional workloads.",
    },
    {
      id: "db",
      label: "Databases",
      sub: "Managed relational & NoSQL",
      kind: "data",
      x: 930,
      y: 476,
      w: 420,
      h: 100,
      detail:
        "Database engines run and patched by the provider. You still design schemas and queries; you no longer install the engine or maintain its host.",
    },
    {
      id: "managed",
      label: "Managed services",
      sub: "Identity · messaging · AI",
      kind: "service",
      x: 930,
      y: 596,
      w: 420,
      h: 100,
      detail:
        "Higher-level building blocks consumed as APIs: identity, queues, analytics, AI model endpoints. The more managed the service, the less you operate.",
    },
    {
      id: "infra",
      label: "Physical infrastructure",
      sub: "Data centres · servers · disks · networking · power & cooling",
      kind: "platform",
      x: 925,
      y: 716,
      w: 640,
      h: 92,
      detail:
        "The hardware never disappears. Real servers in real data centres run every service above — the provider owns, secures and replaces them, and shares their capacity between customers.",
    },
  ],
  edges: [
    { from: "user", to: "net", label: "request", animated: true },
    { from: "net", to: "compute", animated: true, dir: "h", bend: -28 },
    { from: "net", to: "storage", animated: true, dir: "h", bend: -10 },
    { from: "net", to: "db", animated: true, dir: "h", bend: 10 },
    { from: "net", to: "managed", animated: true, dir: "h", bend: 28 },
    { from: "compute", to: "infra", dashed: true, path: "M 1140 236 C 1256 236 1256 646 1195 668" },
    { from: "storage", to: "infra", dashed: true, path: "M 1140 356 C 1238 356 1238 646 1145 668" },
    { from: "db", to: "infra", dashed: true, path: "M 1140 476 C 1222 476 1222 646 1095 668" },
    { from: "managed", to: "infra", dashed: true, path: "M 1140 596 C 1206 596 1206 642 1045 668" },
  ],
};

export const concepts: Concept[] = [
  {
    slug: "what-is-cloud-computing",
    title: "What is Cloud Computing?",
    topic: "cloud-computing",
    subArea: "Cloud Concepts",
    difficulty: "Beginner",
    estimatedMinutes: 6,
    intro:
      "Cloud computing is on-demand access to computing resources — servers, storage, databases and higher-level services — operated by a provider and consumed over a network.",
    diagram: cloudDiagram,
    whatYouAreLookingAt: [
      "On the left is the customer: a person, a team or an application that needs computing capacity.",
      "In the middle is the network. Every cloud interaction is a request travelling over a network to the provider.",
      "On the right is the provider's environment, where capacity is offered as services: compute, storage, databases and higher-level managed services.",
      "At the bottom sits the physical infrastructure. It still exists — the provider owns and operates it, and shares its capacity between many customers.",
    ],
    howItWorks: [
      { step: "Request", text: "You ask for a resource through a portal, CLI, template or API — no purchase order, no hardware delivery." },
      { step: "Provision", text: "The provider allocates capacity from a shared pool, usually in seconds or minutes." },
      { step: "Consume", text: "Your users and applications reach the resource over the network." },
      { step: "Scale", text: "You add or remove capacity as demand changes, manually or automatically." },
      { step: "Pay", text: "Usage is metered and billed for the period the resource was consumed." },
    ],
    whyItMatters: [
      "It changes computing from a capital purchase into a consumable service, so an idea can be tested without buying a server.",
      "Elasticity means capacity can follow demand rather than being sized for the worst day of the year.",
      "Responsibility is shared: the provider operates the infrastructure, while the customer remains responsible for configuration, data and access.",
    ],
    keyTerms: [
      { term: "On-demand self-service", definition: "You provision capacity yourself, without human interaction on the provider's side." },
      { term: "Resource pooling", definition: "Physical resources are shared across customers and assigned dynamically, with tenant isolation." },
      { term: "Elasticity", definition: "Capacity can be increased or released quickly to match current demand." },
      { term: "Measured service", definition: "Resource use is metered, reported and billed against actual consumption." },
      { term: "Shared responsibility", definition: "A split of duties: the provider secures the cloud, the customer secures what they put in it." },
    ],
    misconception: {
      claim: "\"The cloud means there are no servers any more.\"",
      reality:
        "The servers are still there. They live in the provider's data centres, and the provider operates them for many customers at once — you simply consume their capacity as a configurable service.",
    },
    realWorldExample:
      "A small online shop expects normal traffic all year and ten times that on launch day. Instead of buying servers for the peak, it runs on managed compute plus a managed database, scales out automatically for the launch, scales back down the next week, and pays for the extra capacity only for the days it existed.",
    sources: [
      {
        label: "SP 800-145: The NIST Definition of Cloud Computing",
        publisher: "NIST",
        url: "https://csrc.nist.gov/pubs/sp/800/145/final",
      },
      {
        label: "Describe cloud computing",
        publisher: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/",
      },
      {
        label: "What is cloud computing?",
        publisher: "AWS",
        url: "https://aws.amazon.com/what-is-cloud-computing/",
      },
    ],
    next: "iaas-paas-saas",
  },

  // ---------- IT Fundamentals ----------
  {
    slug: "what-is-a-computer",
    title: "What is a Computer?",
    topic: "it-fundamentals",
    subArea: "Hardware & Computers",
    difficulty: "Beginner",
    estimatedMinutes: 4,
    intro:
      "A computer takes input, processes it with a CPU using memory, keeps results in storage and returns output.",
    diagram: chainDiagram(
      [
        { id: "input", label: "Input", sub: "Keyboard, sensors, network", kind: "actor", detail: "Data enters the machine from a person, a device or another system." },
        { id: "cpu", label: "CPU", sub: "Fetch, decode, execute", kind: "service", detail: "The processor executes instructions, billions of simple steps per second." },
        { id: "ram", label: "Memory (RAM)", sub: "Fast, volatile", kind: "service", detail: "Working space for the data and instructions currently in use. It is cleared when power is lost." },
        { id: "storage", label: "Storage", sub: "SSD / HDD", kind: "data", detail: "Keeps data when the machine is off — the operating system, applications and files." },
        { id: "output", label: "Output", sub: "Screen, network, files", kind: "observe", detail: "Results leave the machine as pixels, sound, files or network responses." },
      ],
      { caption: "The input → process → store → output cycle behind every device." },
    ),
    whatYouAreLookingAt: [
      "The same five roles exist in a phone, a laptop and a rack server — only the scale differs.",
      "Memory is fast but temporary; storage is slower but keeps data without power.",
    ],
    whyItMatters: [
      "Almost every performance problem traces back to one of these parts: not enough CPU, not enough memory, or slow storage.",
    ],
    keyTerms: [
      { term: "CPU", definition: "The processor that executes program instructions." },
      { term: "RAM", definition: "Volatile working memory for data currently being used." },
      { term: "Storage", definition: "Non-volatile media that retains data without power." },
    ],
    next: "what-is-an-operating-system",
  },
  {
    slug: "what-is-an-operating-system",
    title: "What is an Operating System?",
    topic: "it-fundamentals",
    subArea: "Operating Systems",
    difficulty: "Beginner",
    estimatedMinutes: 4,
    intro:
      "An operating system sits between applications and hardware, sharing the machine safely between programs.",
    diagram: chainDiagram(
      [
        { id: "apps", label: "Applications", sub: "Browser, editor, service", kind: "actor", detail: "Programs ask the operating system for resources instead of touching hardware directly." },
        { id: "api", label: "System calls", sub: "Open, read, write, network", kind: "network", detail: "The controlled doorway into the kernel. Applications request work through it." },
        { id: "kernel", label: "Kernel", sub: "Scheduler, memory manager", kind: "service", detail: "Decides which program runs when, allocates memory and enforces isolation between processes." },
        { id: "drivers", label: "Drivers", sub: "Device-specific code", kind: "service", detail: "Translate generic requests into instructions a specific device understands." },
        { id: "hw", label: "Hardware", sub: "CPU, memory, disk, NIC", kind: "platform", detail: "The physical resources being shared." },
      ],
      { caption: "Applications never talk to hardware directly — the kernel arbitrates." },
    ),
    whyItMatters: [
      "Isolation between processes is what stops one misbehaving program from taking the whole machine down.",
    ],
    keyTerms: [
      { term: "Kernel", definition: "The core of the OS: scheduling, memory management and hardware access." },
      { term: "Process", definition: "A running program with its own isolated memory space." },
    ],
    next: "what-is-a-server",
  },
  {
    slug: "what-is-a-server",
    title: "What is a Server?",
    topic: "it-fundamentals",
    subArea: "Servers & Storage",
    difficulty: "Beginner",
    estimatedMinutes: 4,
    intro: "A server is a computer whose job is to answer requests from other computers, continuously.",
    diagram: chainDiagram(
      [
        { id: "client", label: "Client", sub: "Browser or app", kind: "actor", detail: "Sends a request and waits for a response." },
        { id: "net", label: "Network", sub: "TCP/IP, DNS, TLS", kind: "network", detail: "Carries the request to the server's address and port." },
        { id: "server", label: "Server process", sub: "Listens on a port", kind: "service", detail: "Software that waits for requests, does work and returns a response. The hardware is just the host." },
        { id: "data", label: "Data store", sub: "Files or database", kind: "data", detail: "Where the server reads and writes the state it serves." },
      ],
      { caption: "\"Server\" describes a role, not a shape of hardware." },
    ),
    keyTerms: [
      { term: "Port", definition: "A numbered endpoint on a host that a server process listens on." },
      { term: "Uptime", definition: "The proportion of time a service is available to answer requests." },
    ],
    next: "what-is-a-database",
  },
  {
    slug: "what-is-a-database",
    title: "What is a Database?",
    topic: "it-fundamentals",
    subArea: "Data & APIs",
    difficulty: "Beginner",
    estimatedMinutes: 5,
    intro:
      "A database stores structured data and answers queries reliably, even with many users writing at once.",
    diagram: chainDiagram(
      [
        { id: "app", label: "Application", sub: "Sends queries", kind: "actor", detail: "Issues reads and writes, usually in SQL or a driver API." },
        { id: "engine", label: "Database engine", sub: "Parser & planner", kind: "service", detail: "Turns a query into an execution plan and enforces constraints and transactions." },
        { id: "index", label: "Indexes", sub: "Fast lookup paths", kind: "service", detail: "Extra data structures that let the engine find rows without scanning everything." },
        { id: "files", label: "Data files", sub: "Tables on disk", kind: "data", detail: "The durable representation of the data, plus a write-ahead log for recovery." },
      ],
      { caption: "Queries in, consistent answers out." },
    ),
    keyTerms: [
      { term: "Transaction", definition: "A group of operations that either all take effect or none do." },
      { term: "Index", definition: "A structure that speeds up lookups at the cost of extra writes and space." },
    ],
    next: "what-is-an-api",
  },
  {
    slug: "what-is-an-api",
    title: "What is an API?",
    topic: "it-fundamentals",
    subArea: "Data & APIs",
    difficulty: "Beginner",
    estimatedMinutes: 4,
    intro: "An API is a documented contract that lets one piece of software ask another to do something.",
    diagram: chainDiagram(
      [
        { id: "client", label: "Client app", sub: "Mobile, web, service", kind: "actor", detail: "Calls the API with a method, a path and parameters." },
        { id: "contract", label: "API contract", sub: "Endpoints & schemas", kind: "network", detail: "Defines what can be asked, in what shape, and what comes back." },
        { id: "svc", label: "Service", sub: "Business logic", kind: "service", detail: "Validates the request, applies rules and decides the response." },
        { id: "resp", label: "Response", sub: "JSON + status code", kind: "observe", detail: "A structured answer the caller can rely on because the contract is stable." },
      ],
      { caption: "The contract is the product: implementations can change behind it." },
    ),
    keyTerms: [
      { term: "Endpoint", definition: "A single callable address in an API." },
      { term: "Status code", definition: "A numeric result category, such as 200 success or 404 not found." },
    ],
    next: "what-is-cloud-computing",
  },

  // ---------- Cloud Computing ----------
  {
    slug: "iaas-paas-saas",
    title: "IaaS vs PaaS vs SaaS",
    topic: "cloud-computing",
    subArea: "Cloud Concepts",
    difficulty: "Beginner",
    estimatedMinutes: 5,
    intro:
      "The three service models differ in one thing: how much of the stack the provider operates for you.",
    diagram: {
      width: 1080,
      height: 420,
      caption: "Moving right, more layers are operated by the provider.",
      nodes: [
        { id: "onprem", label: "On-premises", sub: "You run everything", kind: "platform", x: 160, y: 210, w: 200, h: 120, detail: "Hardware, virtualisation, OS, runtime and application are all yours to operate." },
        { id: "iaas", label: "IaaS", sub: "Rent compute, storage, network", kind: "service", x: 400, y: 210, w: 200, h: 120, detail: "The provider runs the data centre and virtualisation. You still manage the operating system, runtime and application." },
        { id: "paas", label: "PaaS", sub: "Deploy code, not servers", kind: "service", x: 640, y: 210, w: 200, h: 120, detail: "The provider also runs the OS and runtime. You supply the application and its configuration." },
        { id: "saas", label: "SaaS", sub: "Use finished software", kind: "service", x: 880, y: 210, w: 200, h: 120, detail: "The provider runs the whole application. You manage users, data and settings." },
      ],
      edges: [
        { from: "onprem", to: "iaas", animated: true, label: "less to operate" },
        { from: "iaas", to: "paas", animated: true },
        { from: "paas", to: "saas", animated: true },
      ],
      pills: [
        { label: "You keep: data, identities, configuration", note: "In every model the customer stays responsible for their data and who can access it.", x: 540, y: 380 },
      ],
    },
    whyItMatters: [
      "Choosing a model is choosing how much operational work your team keeps.",
      "Responsibility for data and access control never transfers to the provider, whatever the model.",
    ],
    keyTerms: [
      { term: "IaaS", definition: "Infrastructure as a Service — rented compute, storage and networking." },
      { term: "PaaS", definition: "Platform as a Service — a managed runtime for your application code." },
      { term: "SaaS", definition: "Software as a Service — a finished application delivered over the network." },
    ],
    sources: [
      { label: "SP 800-145: The NIST Definition of Cloud Computing", publisher: "NIST", url: "https://csrc.nist.gov/pubs/sp/800/145/final" },
      { label: "Describe cloud service types", publisher: "Microsoft Learn", url: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/" },
    ],
    next: "what-is-a-virtual-machine",
  },
  {
    slug: "what-is-a-virtual-machine",
    title: "What is a Virtual Machine?",
    topic: "cloud-computing",
    subArea: "Compute & Virtualisation",
    difficulty: "Beginner",
    estimatedMinutes: 4,
    intro:
      "A virtual machine is a software-defined computer that shares one physical host with other isolated machines.",
    diagram: chainDiagram(
      [
        { id: "host", label: "Physical host", sub: "CPU, RAM, disks", kind: "platform", detail: "One real server with far more capacity than a single workload needs." },
        { id: "hyp", label: "Hypervisor", sub: "Partitions the host", kind: "service", detail: "Software that divides physical resources into isolated virtual machines and schedules them." },
        { id: "vm", label: "Virtual machine", sub: "Virtual CPU, disk, NIC", kind: "service", detail: "Behaves like its own computer, with its own boot process and network identity." },
        { id: "os", label: "Guest OS", sub: "Linux or Windows", kind: "service", detail: "A full operating system installed inside the VM — you patch and secure it." },
        { id: "app", label: "Application", sub: "Your workload", kind: "observe", detail: "Runs unchanged, unaware that the hardware beneath it is virtual." },
      ],
      { caption: "One host, many isolated machines." },
    ),
    keyTerms: [
      { term: "Hypervisor", definition: "The layer that creates and runs virtual machines on physical hardware." },
      { term: "Image", definition: "A saved template of a disk used to create identical machines." },
    ],
    next: "cloud-networking-basics",
  },
  {
    slug: "cloud-networking-basics",
    title: "Cloud Networking Basics",
    topic: "cloud-computing",
    subArea: "Cloud Networking",
    difficulty: "Intermediate",
    estimatedMinutes: 5,
    intro:
      "Cloud networking gives you a private, software-defined network with explicit rules about what may talk to what.",
    diagram: chainDiagram(
      [
        { id: "internet", label: "Internet", sub: "Public clients", kind: "network", detail: "Untrusted traffic arriving from outside your network." },
        { id: "gw", label: "Gateway / Firewall", sub: "Entry and inspection", kind: "network", detail: "The controlled entry point where traffic is filtered before it reaches anything private." },
        { id: "public", label: "Public subnet", sub: "Load balancer tier", kind: "service", detail: "Holds only the components that must be reachable from outside." },
        { id: "private", label: "Private subnet", sub: "Applications", kind: "service", detail: "No direct route from the internet; reachable only from inside the virtual network." },
        { id: "data", label: "Data subnet", sub: "Databases", kind: "data", detail: "The most restricted tier — accepts connections only from the application tier." },
      ],
      { caption: "Segmentation limits how far a problem can travel." },
    ),
    keyTerms: [
      { term: "Virtual network", definition: "An isolated, software-defined network inside a cloud region." },
      { term: "Subnet", definition: "A slice of a virtual network with its own routing and access rules." },
    ],
    next: "regions-and-availability-zones",
  },
  {
    slug: "regions-and-availability-zones",
    title: "Regions & Availability Zones",
    topic: "cloud-computing",
    subArea: "Cloud Concepts",
    difficulty: "Intermediate",
    estimatedMinutes: 4,
    intro:
      "A region is a geographic location; availability zones are physically separate data centre groups inside it.",
    diagram: {
      width: 1080,
      height: 420,
      caption: "Spread across zones for resilience, across regions for geography.",
      groups: [
        { id: "region", label: "Region", sub: "One geography, low latency between zones", x: 320, y: 60, w: 700, h: 300, tone: "primary" },
      ],
      nodes: [
        { id: "users", label: "Users", sub: "Choose a nearby region", kind: "actor", x: 140, y: 210, w: 180, h: 96, detail: "Region choice affects latency, data residency and available services." },
        { id: "az1", label: "Zone A", sub: "Independent power & network", kind: "platform", x: 470, y: 210, w: 200, h: 110, detail: "A distinct data centre group with its own power, cooling and networking." },
        { id: "az2", label: "Zone B", sub: "Separate facility", kind: "platform", x: 700, y: 210, w: 200, h: 110, detail: "Far enough away to fail independently, close enough for low-latency replication." },
        { id: "az3", label: "Zone C", sub: "Separate facility", kind: "platform", x: 930, y: 210, w: 160, h: 110, detail: "Deploying across three zones lets a workload survive the loss of one." },
      ],
      edges: [
        { from: "users", to: "az1", animated: true },
        { from: "az1", to: "az2", dashed: true, label: "replication" },
        { from: "az2", to: "az3", dashed: true },
      ],
    },
    keyTerms: [
      { term: "Region", definition: "A named geographic area containing cloud infrastructure." },
      { term: "Availability zone", definition: "One or more physically separate data centres within a region." },
    ],
    next: "cloud-security-basics",
  },
  {
    slug: "cloud-security-basics",
    title: "Cloud Security Basics",
    topic: "cloud-computing",
    subArea: "Security & Governance",
    difficulty: "Intermediate",
    estimatedMinutes: 5,
    intro:
      "Cloud security starts with identity: prove who is asking, then allow only what that identity needs.",
    diagram: chainDiagram(
      [
        { id: "id", label: "Identity", sub: "User or workload", kind: "actor", detail: "Every request comes from an identity — a person or a machine identity." },
        { id: "authn", label: "Authentication", sub: "MFA, tokens", kind: "network", detail: "Establishes that the identity is genuine, ideally with more than a password." },
        { id: "authz", label: "Authorisation", sub: "Least-privilege roles", kind: "service", detail: "Decides what that identity may do. Grant the smallest useful set of permissions." },
        { id: "res", label: "Resource", sub: "Encrypted data", kind: "data", detail: "Data protected in transit and at rest, with keys managed deliberately." },
        { id: "audit", label: "Audit logs", sub: "Who did what, when", kind: "observe", detail: "A durable record used for investigation, alerting and compliance." },
      ],
      { caption: "Identity is the perimeter." },
    ),
    misconception: {
      claim: "\"The provider secures everything.\"",
      reality:
        "Providers secure the infrastructure. Customers remain responsible for identities, permissions, network rules, configuration and their own data — the shared responsibility model.",
    },
    keyTerms: [
      { term: "Least privilege", definition: "Granting only the permissions strictly required for a task." },
      { term: "MFA", definition: "Multi-factor authentication: more than one kind of proof of identity." },
    ],
    next: "monitoring-vs-observability",
  },
  {
    slug: "monitoring-vs-observability",
    title: "Monitoring vs Observability",
    topic: "cloud-computing",
    subArea: "Security & Governance",
    difficulty: "Intermediate",
    estimatedMinutes: 4,
    intro:
      "Monitoring watches for known problems; observability is being able to investigate ones you did not predict.",
    diagram: chainDiagram(
      [
        { id: "sys", label: "System", sub: "Emits signals", kind: "service", detail: "Applications and infrastructure produce telemetry as they work." },
        { id: "sig", label: "Metrics · Logs · Traces", sub: "Telemetry", kind: "observe", detail: "Metrics show trends, logs show events, traces follow one request across services." },
        { id: "mon", label: "Monitoring", sub: "Known thresholds", kind: "observe", detail: "Dashboards and alerts for conditions you already know matter, such as error rate or latency." },
        { id: "obs", label: "Investigation", sub: "Ask new questions", kind: "observe", detail: "Enough context to answer questions nobody wrote a dashboard for." },
      ],
      { caption: "Same telemetry, two different jobs." },
    ),
    keyTerms: [
      { term: "Metric", definition: "A numeric measurement recorded over time." },
      { term: "Trace", definition: "A record of one request's path through multiple services." },
    ],
    next: "ai-in-the-cloud",
  },
  {
    slug: "ai-in-the-cloud",
    title: "AI in the Cloud",
    topic: "cloud-computing",
    subArea: "AI in the Cloud",
    difficulty: "Beginner",
    estimatedMinutes: 5,
    intro:
      "Cloud AI services expose trained models as APIs, so applications can use them without owning accelerators.",
    diagram: chainDiagram(
      [
        { id: "app", label: "Application", sub: "Sends a prompt or file", kind: "actor", detail: "Your app calls a model endpoint like any other API, with authentication and quotas." },
        { id: "api", label: "Model endpoint", sub: "Authenticated API", kind: "network", detail: "A managed entry point that handles routing, throttling and versioning of the model." },
        { id: "model", label: "Model runtime", sub: "GPUs / accelerators", kind: "service", detail: "Specialised hardware runs inference. The provider operates and shares it across customers." },
        { id: "data", label: "Your data", sub: "Grounding & retrieval", kind: "data", detail: "Useful answers usually need your own content, supplied at query time from a search or database." },
        { id: "out", label: "Response", sub: "Reviewed by a human", kind: "observe", detail: "Model output is a suggestion, not a guarantee. Important decisions still need human review." },
      ],
      { caption: "Managed model endpoints, grounded on your own data." },
    ),
    keyTerms: [
      { term: "Inference", definition: "Running a trained model to produce an output for new input." },
      { term: "Grounding", definition: "Supplying trusted source data so answers reflect your content." },
    ],
    next: "microsoft-cloud-and-modern-work",
  },
  {
    slug: "microsoft-cloud-and-modern-work",
    title: "Microsoft Cloud & Modern Work",
    topic: "cloud-computing",
    subArea: "Microsoft Cloud & Modern Work",
    difficulty: "Beginner",
    estimatedMinutes: 5,
    intro:
      "Microsoft 365 is SaaS for everyday work; identity ties it together, and Copilot works on top of that same content.",
    diagram: chainDiagram(
      [
        { id: "user", label: "Employee", sub: "Signs in once", kind: "actor", detail: "One work identity gives access to mail, files, chat and apps." },
        { id: "entra", label: "Cloud identity", sub: "Microsoft Entra ID", kind: "network", detail: "Authenticates the user and applies conditional access policies before anything opens." },
        { id: "m365", label: "Microsoft 365", sub: "Teams, Exchange, SharePoint", kind: "service", detail: "SaaS productivity services. The tenant is yours; the operation of the software is Microsoft's." },
        { id: "content", label: "Work content", sub: "Mail, files, chats", kind: "data", detail: "Organisational data with existing permissions that must continue to apply everywhere." },
        { id: "copilot", label: "Copilot", sub: "Respects permissions", kind: "observe", detail: "An assistant layered over that content. It can only use what the signed-in user is already allowed to see." },
      ],
      { caption: "Identity first, then services, then assistance on top." },
    ),
    keyTerms: [
      { term: "Tenant", definition: "An organisation's dedicated instance of Microsoft cloud services." },
      { term: "Conditional access", definition: "Policies that allow or block sign-in based on user, device and risk signals." },
    ],
    next: "what-is-a-load-balancer",
  },

  // ---------- Architecture ----------
  {
    slug: "what-is-a-load-balancer",
    title: "What is a Load Balancer?",
    topic: "architecture",
    subArea: "Traffic & Scaling",
    difficulty: "Beginner",
    estimatedMinutes: 4,
    intro:
      "A load balancer spreads incoming requests across several healthy instances of the same service.",
    diagram: chainDiagram(
      [
        { id: "clients", label: "Clients", sub: "Many requests", kind: "actor", detail: "All traffic arrives at one address, whatever runs behind it." },
        { id: "lb", label: "Load balancer", sub: "Health checks + routing", kind: "network", detail: "Chooses a healthy instance for each request and stops sending traffic to failing ones." },
      ],
      {
        caption: "One entry point, several interchangeable instances.",
        branchFrom: "lb",
        branches: [
          { id: "a", label: "Instance A", sub: "Healthy", kind: "service", detail: "Handles its share of requests." },
          { id: "b", label: "Instance B", sub: "Healthy", kind: "service", detail: "Identical to A, so any request can go to either." },
          { id: "c", label: "Instance C", sub: "Failing health check", kind: "platform", detail: "Removed from rotation automatically until it passes health checks again." },
        ],
      },
    ),
    keyTerms: [
      { term: "Health check", definition: "A periodic probe deciding whether an instance should receive traffic." },
      { term: "Horizontal scaling", definition: "Adding more instances rather than making one bigger." },
    ],
    next: "client-server-architecture",
  },
  {
    slug: "client-server-architecture",
    title: "Client-Server Architecture",
    topic: "architecture",
    subArea: "System Shapes",
    difficulty: "Beginner",
    estimatedMinutes: 4,
    intro:
      "Clients request, servers respond, and state lives behind the server rather than on the device.",
    diagram: chainDiagram(
      [
        { id: "client", label: "Client", sub: "Renders UI", kind: "actor", detail: "Owns presentation and user interaction; holds little authoritative state." },
        { id: "net", label: "Network", sub: "HTTPS", kind: "network", detail: "Requests and responses travel over an encrypted connection." },
        { id: "server", label: "Server", sub: "Rules & validation", kind: "service", detail: "The authority: it validates input, applies business rules and decides what is true." },
        { id: "db", label: "Database", sub: "Shared state", kind: "data", detail: "Central state every client sees consistently." },
      ],
      { caption: "The server is the source of truth." },
    ),
    keyTerms: [{ term: "Stateless request", definition: "A request carrying everything the server needs to handle it." }],
    next: "monolith-vs-microservices",
  },
  {
    slug: "monolith-vs-microservices",
    title: "Monolith vs Microservices",
    topic: "architecture",
    subArea: "Service Boundaries",
    difficulty: "Intermediate",
    estimatedMinutes: 5,
    intro:
      "A monolith deploys as one unit; microservices split the same capabilities into independently deployable services.",
    diagram: {
      width: 1080,
      height: 440,
      caption: "Same capabilities, different deployment boundaries.",
      groups: [
        { id: "mono", label: "Monolith", sub: "One deployable unit", x: 60, y: 80, w: 400, h: 280, tone: "neutral" },
        { id: "micro", label: "Microservices", sub: "Independent deployments", x: 620, y: 80, w: 400, h: 280, tone: "primary" },
      ],
      nodes: [
        { id: "m1", label: "Orders · Billing · Users", sub: "Shared codebase & database", kind: "service", x: 260, y: 200, w: 320, h: 130, detail: "Simple to build, test and deploy early on. Scaling means running more copies of everything, and one bad change affects the whole application." },
        { id: "s1", label: "Orders", sub: "Own data", kind: "service", x: 720, y: 160, w: 160, h: 80, detail: "Deployed and scaled on its own schedule." },
        { id: "s2", label: "Billing", sub: "Own data", kind: "service", x: 920, y: 160, w: 160, h: 80, detail: "A separate team can ship it without coordinating a full release." },
        { id: "s3", label: "Users", sub: "Own data", kind: "service", x: 820, y: 300, w: 160, h: 80, detail: "Independence costs network calls, versioning and more operational tooling." },
      ],
      edges: [
        { from: "s1", to: "s2", dashed: true, label: "API" },
        { from: "s1", to: "s3", dashed: true },
      ],
    },
    misconception: {
      claim: "\"Microservices are always the modern, better choice.\"",
      reality:
        "They trade simplicity for independence. A small team with one product usually ships faster with a well-structured monolith; splitting helps when separate teams need to release separately.",
    },
    next: "what-is-a-cdn",
  },
  {
    slug: "what-is-a-cdn",
    title: "What is a CDN?",
    topic: "architecture",
    subArea: "Delivery",
    difficulty: "Beginner",
    estimatedMinutes: 4,
    intro:
      "A content delivery network serves copies of your content from locations close to the user.",
    diagram: chainDiagram(
      [
        { id: "user", label: "User", sub: "Anywhere", kind: "actor", detail: "Distance to the server adds latency to every request." },
        { id: "edge", label: "Edge location", sub: "Nearby cache", kind: "network", detail: "If the content is cached here, it is returned immediately without touching the origin." },
        { id: "origin", label: "Origin server", sub: "Source of truth", kind: "service", detail: "Contacted only on a cache miss or when the cached copy has expired." },
        { id: "store", label: "Storage", sub: "Images, video, files", kind: "data", detail: "Where the original assets live." },
      ],
      { caption: "Cache hits never reach the origin." },
    ),
    keyTerms: [
      { term: "Cache hit", definition: "A request answered from the cache instead of the origin." },
      { term: "TTL", definition: "How long a cached copy may be reused before revalidation." },
    ],
    next: "what-is-ci-cd",
  },

  // ---------- DevOps ----------
  {
    slug: "what-is-ci-cd",
    title: "What is CI/CD?",
    topic: "devops",
    subArea: "Delivery Pipelines",
    difficulty: "Beginner",
    estimatedMinutes: 5,
    intro:
      "CI/CD is an automated path from a code change to a running release, with checks at every step.",
    diagram: chainDiagram(
      [
        { id: "commit", label: "Commit", sub: "Change pushed", kind: "actor", detail: "A developer pushes a change; the pipeline starts automatically." },
        { id: "build", label: "Build", sub: "Compile & package", kind: "service", detail: "Produces one immutable artifact that will be promoted unchanged." },
        { id: "test", label: "Test", sub: "Automated checks", kind: "service", detail: "Unit, integration and security checks. A failure stops the pipeline here." },
        { id: "stage", label: "Staging", sub: "Production-like", kind: "service", detail: "The artifact is deployed to a rehearsal environment for final verification." },
        { id: "prod", label: "Production", sub: "Released to users", kind: "observe", detail: "The same artifact is released, often gradually so problems are caught early." },
      ],
      { caption: "Build once, promote the same artifact." },
    ),
    keyTerms: [
      { term: "Continuous integration", definition: "Merging and automatically verifying changes frequently." },
      { term: "Artifact", definition: "The packaged build output promoted through environments." },
    ],
    next: "what-are-containers",
  },
  {
    slug: "what-are-containers",
    title: "What are Containers?",
    topic: "devops",
    subArea: "Containers",
    difficulty: "Beginner",
    estimatedMinutes: 5,
    intro:
      "A container packages an application with its dependencies and runs as an isolated process on a shared OS kernel.",
    diagram: chainDiagram(
      [
        { id: "code", label: "App + dependencies", sub: "Dockerfile", kind: "actor", detail: "You declare exactly what the application needs to run." },
        { id: "image", label: "Image", sub: "Immutable layers", kind: "data", detail: "A versioned, read-only package. The same image runs on a laptop and in production." },
        { id: "registry", label: "Registry", sub: "Stores images", kind: "network", detail: "Central place images are pushed to and pulled from." },
        { id: "runtime", label: "Container runtime", sub: "Shared host kernel", kind: "service", detail: "Starts containers as isolated processes — lighter than a VM because there is no guest OS." },
        { id: "orch", label: "Orchestrator", sub: "Scheduling & restarts", kind: "observe", detail: "Places containers on hosts, restarts failures and scales replicas." },
      ],
      { caption: "One image, identical behaviour everywhere." },
    ),
    misconception: {
      claim: "\"A container is a small virtual machine.\"",
      reality:
        "Containers share the host's kernel and isolate processes; VMs virtualise hardware and run a full guest operating system. That is why containers start in milliseconds.",
    },
    next: "infrastructure-as-code",
  },
  {
    slug: "infrastructure-as-code",
    title: "Infrastructure as Code",
    topic: "devops",
    subArea: "Automation",
    difficulty: "Intermediate",
    estimatedMinutes: 5,
    intro:
      "Infrastructure as code describes environments in version-controlled files instead of manual console clicks.",
    diagram: chainDiagram(
      [
        { id: "def", label: "Definition files", sub: "Declarative config", kind: "actor", detail: "You describe the desired end state, not the clicks to get there." },
        { id: "vcs", label: "Version control", sub: "Review & history", kind: "data", detail: "Every infrastructure change is reviewable, attributable and revertable." },
        { id: "plan", label: "Plan", sub: "Preview the diff", kind: "service", detail: "The tool compares desired state with reality and shows what it would change." },
        { id: "apply", label: "Apply", sub: "Automated change", kind: "service", detail: "The tool makes only the differences, so repeated runs are safe." },
        { id: "env", label: "Environment", sub: "Reproducible", kind: "observe", detail: "Dev, test and production can be rebuilt from the same definitions." },
      ],
      { caption: "Desired state in, reproducible environments out." },
    ),
    keyTerms: [
      { term: "Declarative", definition: "Describing the desired result rather than the steps." },
      { term: "Drift", definition: "Divergence between the defined state and what actually exists." },
    ],
    next: "monitoring-and-alerting",
  },
  {
    slug: "monitoring-and-alerting",
    title: "Monitoring and Alerting",
    topic: "devops",
    subArea: "Operations",
    difficulty: "Beginner",
    estimatedMinutes: 4,
    intro:
      "Monitoring turns system signals into a small number of alerts that are worth waking someone for.",
    diagram: chainDiagram(
      [
        { id: "sys", label: "Systems", sub: "Apps & infrastructure", kind: "service", detail: "Emit metrics, logs and traces continuously." },
        { id: "collect", label: "Collection", sub: "Agents & exporters", kind: "network", detail: "Telemetry is gathered and stored centrally with consistent labels." },
        { id: "rules", label: "Alert rules", sub: "Symptom-based", kind: "service", detail: "Alert on user-visible symptoms such as errors and latency, not on every internal fluctuation." },
        { id: "notify", label: "Notification", sub: "On-call channel", kind: "observe", detail: "Routed to whoever can act, with enough context to start immediately." },
        { id: "fix", label: "Response", sub: "Mitigate, then learn", kind: "observe", detail: "Restore service first; review afterwards to remove the cause." },
      ],
      { caption: "Signals become action, not noise." },
    ),
    keyTerms: [
      { term: "SLO", definition: "A target level of reliability a service aims to meet." },
      { term: "Alert fatigue", definition: "Ignoring alerts because too many are not actionable." },
    ],
    next: "what-is-cloud-computing",
  },
];

export const conceptBySlug = (slug: string) => concepts.find((c) => c.slug === slug);
export const conceptsByTopic = (topic: string) => concepts.filter((c) => c.topic === topic);
export const featuredConcepts = [
  "what-is-cloud-computing",
  "what-is-ci-cd",
  "what-is-a-load-balancer",
].map((s) => conceptBySlug(s)!);
