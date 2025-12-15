# OGU Platform OS (Web3 Industrial AI)

The OGU platform is a suite of multi-agent, MCP-driven, blockchain-secured Web3 applications designed for critical infrastructure. It features autonomous agents for vision, maintenance, and forecasting, all secured by an immutable audit ledger.

## 🚀 Quick Start

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Set Environment Variables:**
   Create a `.env` file (or let the app prompt for the key securely):
   ```bash
   API_KEY=your_google_gemini_api_key
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

## 🏗️ Architecture

### 1. Frontend (React + Vite)
- **Framework:** React 18 with TypeScript.
- **Styling:** TailwindCSS with a custom "Obsidian/Neon" theme.
- **State:** React Hooks + `storageService` for local persistence.

### 2. AI Layer (Google Gemini)
- **Vision:** Gemini 2.5 Flash (Multimodal) for PPE detection.
- **Orchestrator:** A dedicated system prompt in `geminiService.ts` that enforces ISO/OSHA protocols.
- **Forecasting:** Heuristic models augmented by LLM analysis of CSV telemetry.

### 3. Web3 Layer (Simulation)
- **Ledger:** Simulated Blockchain attestation with SHA-256 hashing.
- **Storage:** Mock IPFS CID generation.
- **Verification:** Links to Etherscan (simulation).

## 🧩 Modules

| Module | Function | Model / Logic |
|--------|----------|---------------|
| **Vision Agent** | PPE Compliance | YOLO/Gemini Vision |
| **Maintenance** | RUL Prediction | Random Forest (Sim) + LLM Diagnostics |
| **Outage** | Grid Forecasting | Graph Topology + Cascade Simulation |
| **Ticketing** | Auto-Workflow | GenAI SOP Generation |
| **Audit** | Compliance | Immutable Ledger |

## 🔐 Security & Persistence
- **Role-Based Access:** Toggle between `ADMIN` and `OPERATOR`.
- **Data Persistence:** All logs, tickets, and user settings persist via `localStorage` (simulating database).
- **Admin Panel:** Secure configuration for injecting CSV data streams.

## 📂 File Structure
See `docs/ARCHITECTURE.md` for a full Mermaid diagram of the repository.
