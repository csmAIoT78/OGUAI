# OGU Platform Architecture & Repository Structure

## Repository Map

```mermaid
graph TD
    root[ogu-platform-os/]
    
    subgraph "Configuration"
        git[.gitignore]
        pkg[package.json]
        req[requirements.txt]
        vite[vite.config.ts]
        tail[tailwind.config.js]
        meta[metadata.json]
    end

    subgraph "Source Code (src/)"
        src[src/] --> main[index.tsx]
        src --> app[App.tsx]
        src --> types[types.ts]
        
        subgraph "Services (API & Logic)"
            serv[services/]
            serv --> gem[geminiService.ts]
            serv --> chain[blockchainService.ts]
            serv --> data[dataService.ts]
            serv --> store[storageService.ts]
        end

        subgraph "Components (UI Modules)"
            comp[components/]
            comp --> dash[Dashboard.tsx]
            comp --> sidebar[OrchestratorSidebar.tsx]
            comp --> settings[SettingsPanel.tsx]
            comp --> docs[DocumentationLibrary.tsx]
            
            subgraph "DApps"
                comp --> vision[LiveScanner.tsx]
                comp --> maint[MaintenancePredictor.tsx]
                comp --> outage[OutageForecaster.tsx]
                comp --> ticket[TicketingSystem.tsx]
                comp --> audit[AuditLog.tsx]
                comp --> nlp[LogIntelligence.tsx]
            end
        end
    end

    root --> src
    root --> Configuration
```

## System Architecture

```mermaid
classDiagram
    class Orchestrator {
        +orchestratorChat(context)
        +enforceProtocol(ISO_45001)
    }
    
    class VisionAgent {
        +analyzeFrame(base64)
        +detectPPE()
        +hashToIPFS()
    }
    
    class MaintenanceAgent {
        +ingestTelemetry(csv)
        +predictRUL()
        +visualizeDigitalTwin()
    }

    class OutageAgent {
        +mapTopology(substations)
        +simulateCascade()
        +calcRiskScore()
    }

    class BlockchainLayer {
        +attestScan(hash)
        +verifyRecord(id)
        +emitEvent(LogAttested)
    }

    Orchestrator --> VisionAgent : Directs
    Orchestrator --> MaintenanceAgent : Monitors
    VisionAgent --> BlockchainLayer : Commits Proof
    MaintenanceAgent --> Orchestrator : Sends Alerts
    OutageAgent --> Orchestrator : Sends Risk Data
```

## Orchestrator AI Interface

The Orchestrator Logic resides in `src/services/geminiService.ts`.

**Interface Flow:**
1. **Input:** `OrchestratorSidebar.tsx` captures user command.
2. **Context:** Frontend aggregates `InteractionEvent[]` + `currentApp` state.
3. **Processing:** `GeminiService.orchestratorChat()` constructs a "System Prompt" defining the `OGU_ORCHESTRATOR_CORE` persona.
4. **Execution:** Request sent to Google Gemini 2.5 Flash.
5. **Output:** Response returned as raw text, formatted by UI as system logs.
