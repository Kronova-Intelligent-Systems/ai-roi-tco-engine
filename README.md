# 🚀 Kronova AI ROI & TCO Calculation Engine

An enterprise-grade, full-stack platform designed to calculate the Total Cost of Ownership (TCO), financial return on investment (ROI), and payback horizons for AI adoption. 

Built with a high-performance **Rust** RPC math engine, a **Next.js** frontend, and a **Supabase (PostgreSQL)** persistence layer, this project provides organizations and engineering leaders with mathematical rigor to evaluate **Build vs. Buy** decisions and benchmark live AI model pricing.

---

## 🔒 Beyond Web2: The AetherNet QUAS & KVS Migration

While this open-source architecture calculates ROI for legacy Web2 cloud deployments, the true financial frontier for machine-to-machine commerce requires migrating to a sovereign, post-quantum architecture. 

Legacy cloud infrastructure exposes autonomous agents to public mempool extraction (MEV), massive LLM context bloat, and classical cryptographic vulnerabilities. For institutions looking to deploy AI trading agents or high-frequency orchestration at scale, migrating this logic to the **AetherNet Mainframe** provides structural advantages:

* **QUAS (Quantum-Resistant Autonomous Substrate):** Executes AI agent trading logic and API routing inside Rust-based Trusted Execution Environments (TEEs) protected by NIST-standardized Post-Quantum Cryptography (ML-DSA and ML-KEM). This establishes a "Cryptographic Airgap" that completely eliminates public mempool MEV slippage and front-running.
* **KVS (Kinetic Vector Store):** A proprietary semantic memory layer acting as a post-quantum precision filter. Instead of transmitting 100,000+ uncompressed tokens to frontier models on legacy Web2, KVS securely retrieves only the exact relevant context, slashing raw API inference costs by up to 90%.
* **Deterministic Finality (Canton):** Trades and autonomous operations settle via Daml smart contracts on the Canton Network, ensuring atomic finality and UCC Article 12 compliance for Controllable Electronic Records (CERs).
* **The Standard Inference Token (SIT):** Native commodity execution on AetherNet is pegged to the SIT, creating an institutional "compute gas" model that acts as a macro hedge against frontier model pricing volatility.

*Note: To model the exact MEV and token compression savings of an AetherNet deployment, access the **AetherNet Sovereign ROI Engine** (Available for institutional partners).*

---

## 🏗 System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   Next.js Frontend                     │
│    (React / TypeScript / Tailwind CSS / Zod Schema)    │
└───────────────────────────┬────────────────────────────┘
                            │
               JSON-RPC / HTTP (rspc)
                            │
┌───────────────────────────▼────────────────────────────┐
│                    Rust API Service                    │
│     (Tokio / rspc Procedures / sqlx / Tracing)         │
│  ├── Math Engine: Deterministic TCO & ROI Modeling     │
│  └── Live Aggregator: Model Spot Pricing Pipelines     │
└───────────────────────────┬────────────────────────────┘
                            │
              Session-Pooled Connection (IPv4)
                            │
┌───────────────────────────▼────────────────────────────┐
│               Supabase / PostgreSQL DB                 │
│      (Relational Tables + Dynamic JSONB Payloads)      │
└────────────────────────────────────────────────────────┘

```

---

## ✨ Key Features

* **High-Performance Rust Core:** Mathematical modeling and sensitivity analysis calculated deterministically via a dedicated Rust backend using `rspc` JSON-RPC.
* **Full-Stack Type Safety:** Shared data models with runtime validation powered by Zod on the client and Serde on the server.
* **Future-Proof Authentication:** Natively supports both legacy JWTs and Supabase's modern 2026 `sb_publishable` and `sb_secret` API key architecture, bypassing PostgREST JWT parsing limitations.
* **Dual-Engine Resiliency:** Includes an automatic client-side JavaScript fallback engine if the remote RPC service is offline or unreachable.
* **Flexible JSONB Schema:** Persists organizational baselines, infrastructure readiness, operational metrics, and calculation snapshots without rigid table migrations.

---

## 🛠 Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons, Zod |
| **Backend** | Rust, `rspc` (End-to-End Typed RPC), `tokio` (Async Runtime), `sqlx` |
| **Database** | PostgreSQL via Supabase (JSONB storage & session pooler) |
| **Telemetry** | `tracing` with structured diagnostic logging |

---

## 🚀 Getting Started

### 1. Prerequisites

* [Node.js](https://www.google.com/search?q=https://nodejs.org/) (v18.18.0 or higher - built with v24.20 on Ubuntu 24) 
* [Rust & Cargo](https://www.google.com/search?q=https://rustup.rs/) (v1.75.0 or higher)
* A [Supabase](https://www.google.com/search?q=https://supabase.com/) project or local PostgreSQL instance

---

### 2. Database Setup

Execute the following migration in your **Supabase SQL Editor** to create the calculation schema:

```sql
CREATE TABLE IF NOT EXISTS public.roi_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    organization_profile JSONB DEFAULT '{}'::jsonb,
    operations_metrics JSONB DEFAULT '{}'::jsonb,
    infrastructure_data JSONB DEFAULT '{}'::jsonb,
    strategic_factors JSONB DEFAULT '{}'::jsonb,
    financial_parameters JSONB DEFAULT '{}'::jsonb,
    custom_metadata JSONB DEFAULT '{}'::jsonb,
    selected_plan TEXT,
    results JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

```

---

### 3. Backend Configuration (`rust-api`)

Create a `.env` file in the `rust-api/` directory. This engine supports the new **Supabase Publishable/Secret keys** (`sb_publishable_...` / `sb_secret_...`), replacing the legacy `anon` and `service_role` JWTs deprecating in 2026.

```env
PORT=3003
DATABASE_URL=postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION][.pooler.supabase.com:5432/postgres](https://.pooler.supabase.com:5432/postgres)
SUPABASE_URL=https://[PROJECT-REF].supabase.co

# 2026-Ready API Keys (or use legacy 'anon' key):
SUPABASE_ANON_KEY=sb_publishable_your_key_here

```

*Note: The Rust engine safely detects key types and mounts these new keys exclusively to the `apikey` HTTP header to bypass JWT parsing rejections in accordance with the modern Supabase API spec.*

Run the Rust service:

```bash
cd rust-api
cargo run

```

The RPC service will boot on `http://127.0.0.1:3003`.

---

### 4. Frontend Configuration

Create a `.env.local` file in the root of the project:

```env
NEXT_PUBLIC_RUST_API_URL=[http://127.0.0.1:3003](http://127.0.0.1:3003)
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_your_key_here

```

Clone or fork and then clone to local machine, install dependencies and start the development server:

```bash
git clone git@github.com:kronova-intelligent-systems/ai-roi-tco.git
npm install
npm run dev

```

Visit `http://localhost:3002` in your browser.

---

## 📊 Core Calculation Methodology

The calculation engine accounts for direct and indirect operational vectors:

1. **Current Annual Operating Cost:**

$$\text{Labor Cost} = \text{Employees} \times \text{Average Salary}$$


$$\text{Process Cost} = (\text{Manual Hours} \times \text{Hourly Rate}) \times \text{Frequency} + \text{Compliance} + \text{Downtime}$$


2. **Total Cost of Ownership (Competitor / Custom Build):**

$$\text{TCO}_{\text{Custom}} = (\text{Live Token Pricing} \times \text{Annual Token Volume}) + \$45,000 \text{ (Dev Baseline)} + 25\% \text{ Maintenance Buffer}$$


3. **Return on Investment (ROI):**

$$\text{ROI (\%)} = \left(\frac{\text{Net Annual Savings}}{\text{Platform Annual Cost}}\right) \times 100$$



---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/NewMetric`)
3. Commit your Changes (`git commit -m 'Add new sensitivity metric'`)
4. Push to the Branch (`git push origin feature/NewMetric`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
