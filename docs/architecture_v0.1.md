# Tensaw Skills Studio — System Architecture v0.1

## 1. Core Architectural Philosophy

Tensaw Skills Studio is a **domain-specific Visual Configuration Compiler** for Revenue Cycle Management (RCM). It is explicitly **not** a code generation tool. It provides a declarative, drag-and-drop interface for non-technical AR operations managers to visually assemble workflow logic from pre-built capabilities, and then compiles that visual graph into a strict **JSON DSL (Domain Specific Language)**.

The Studio never executes workflows directly. Execution is delegated to an external runtime engine (Temporal + LangGraph).

> **Key analogy (from CEO, March 2 meeting):** The Studio is like a Java Controller layer — it only orchestrates calls between pre-built services/tools. The tools (APIs, RPA, connectors) are pre-built by developers. The Studio simply sequences them and defines the flow.

---

## 2. The 3-Tier Execution Stack

The architecture enforces a strict separation of concerns between three tiers:

### Tier 1: Orchestration Layer (The Studio's Domain)
- **Function:** Manages state, logic flow, routing, and human-in-the-loop queues.
- **Components:**
  - **Temporal** — Durability engine for long-running processes (wait states, SLA timers, retries).
  - **LangGraph Agents** — Decision-making nodes that use LLMs to evaluate ambiguous context (e.g., "Classify Denial"). Agents are strictly forbidden from executing side-effects; they only output structured JSON routing decisions.
  - **LangGraph Skills** — Deterministic execution flows. If a flow does NOT call an LLM, it is a Skill. Skills actually interact with the outside world via Tools.

### Tier 2: Tools Layer (The Developer's Domain)
- **Function:** Executes actual side-effects and API calls.
- **Components:** FastAPI/Springboot microservices, atomic connectors (`s3_tool`, `llm_tool`, `claim_scrubber`, `eligibility_api`, `payer_portal_rpa`, etc.)
- **Constraint:** The Studio **NEVER** generates code for this layer. A capability cannot appear in the Studio until a developer builds the Tool for it and registers it in the backend Action Catalog.

### Tier 3: Data Layer
- **Function:** The ultimate source of truth.
- **Components:** MySQL (`coding_DB`, `Tensaw_ICD_CPT`), external PM systems, S3, clearinghouses.

---

## 3. The Studio Output: Orchestration Compilation

When a user finishes designing a workflow, the Studio compiles the visual graph into strict JSON DSL files representing:

1. **`graph.json`** — The overall routing (edges, conditions, branching)
2. **`nodes.json`** — The configuration for each step (prompt versions, timeout limits, connector bindings, input/output mappings)
3. **`state.json`** — The session memory/scratchpad required for the graph

### Example JSON DSL Output
```json
{
  "skill_id": "D01",
  "version": "1.0.0",
  "trigger": { "type": "queue", "queue_name": "denials_queue" },
  "nodes": [
    {
      "id": "node_1",
      "type": "action.api",
      "action_ref": "eligibility.verify.v1",
      "config": {
        "inputs": { "patient_id": "ctx.payload.patient_id" }
      }
    }
  ],
  "edges": [
    {
      "source": "node_1",
      "target": "node_2",
      "condition": "ctx.node_1.output.eligible == true"
    }
  ]
}
```

This payload is committed via the Git Bridge, making deployments safe, auditable, and roll-backable.

---

## 4. The Deployment Pipeline (The Git Bridge)

The Studio is physically **decoupled** from the live runtime database to ensure enterprise safety:

1. **Compile:** Studio compiles the visual graph into JSON DSL files.
2. **Validate:** Backend runs strict validation (single start node, reachability, schema adherence, input mapping coverage, route coverage).
3. **Publish (Git Push):** Clicking "Publish" pushes the compiled JSON orchestration files to a **BitBucket / Git repository**.
4. **CI/CD:** Enterprise CI/CD pipeline (e.g., Jenkins) listens to the repository, runs automated validation tests, and deploys the configuration to live Temporal workers.

---

## 5. The Runtime State Machine (Temporal)

Once deployed, the Temporal workflow engine **blindly reads** the deployed JSON configurations. Every task follows a strict 3-step polymorphic activity loop:

1. **`advanced_case` (Initializer):** Evaluates `RCM_Case` status, prioritizes open tasks, sets up the environment.
2. **`handler` (Executor):** Invokes the specific LangGraph flow (Agent or Skill) defined by the Studio's JSON output.
3. **`normalized_case` (Cleanup):** Updates the `RCM_Task` to completed, progresses the overall `RCM_Case` state.

---

## 6. Core Data Model (SQLite)

The authoring environment uses SQLite. The relational model prevents messy JSON states and supports strict versioning.

### 6.1 Skill Authoring Tables

| Table | Purpose |
|---|---|
| `skill` | Core identity and metadata (name, skill_key, client_id, payer_id, category, tags, owner) |
| `skill_version` | A specific iteration of a skill — status: `draft` / `published` / `archived`. Includes `compiled_skill_json` and `compile_hash`. Scoped by environment (`dev`/`staging`/`prod`). |
| `skill_node` | An instance of an action within a version. Contains `node_key`, `node_type`, canvas position (`pos_x`/`pos_y`), `config_json` with all parameter settings. |
| `skill_route` | Edges connecting nodes. Supports unconditional, conditional (CEL expressions), and default/fallback routes via `condition_json`. |
| `skill_node_action` | Linking table: binds a `skill_node` to a specific published `action_version_id` for referential integrity. |

### 6.2 Action Catalog Tables

| Table | Purpose |
|---|---|
| `action_definition` | The catalog entry for a reusable capability (e.g., "Verify Eligibility"). Has `action_key` (dot notation like `eligibility.verify`), `category`, `capability` (API/AI/RPA/Human/Rules/Messaging/Docs), `scope` (global/client). |
| `action_version` | Immutable versioned schemas for an action. Contains `inputs_schema_json`, `execution_json` (connector type, operation, timeout, retry, rate limit, request/response mapping), `outputs_schema_json`, `ui_form_json`, `policy_json` (PHI handling, environment chips, cost estimate). Published versions are immutable. |

### 6.3 Supporting Tables

| Table | Purpose |
|---|---|
| `connector_instance` | External integration instances per client/environment (e.g., "Epic EMR - Production"). Stores `secret_ref` (vault references, not secrets). |
| `prompt_template` / `prompt_version` | Managed LLM prompts with versioning and model family tracking. |
| `skill_test_case` | Test cases (input event JSON + expected output) attached to skill versions. |
| `skill_run` | Monitoring table for execution history (status, timing, error logs). |
| `tag` / `skill_tag` | Tagging system for skill organization and filtering. |

### 6.4 Node Type Taxonomy

```
trigger.queue | trigger.schedule | trigger.webhook
action.ai_classify
action.rules_engine
action.create_task
action.human_review
action.update_pm
action.send_message
connector.emr
connector.clearinghouse
connector.eligibility_api
connector.payer_portal_rpa
end.success | end.error | end.escalated
```

---

## 7. Routing & Condition Model

Skill Routes support three types:
- **Unconditional:** Always flow to the next node.
- **Conditional:** Expression-based routing using CEL (Common Expression Language):
  ```json
  { "type": "expression", "language": "cel", "expr": "outputs.confidence >= 0.75" }
  ```
- **Default/Fallback:** Used when no other condition matches.

---

## 8. Sub-system: Action Catalog (Admin Engine)

The Action Catalog prevents complex UI code updates whenever a new capability is added:

- Admins define reusable tool blocks in `action_definition` tables with a 7-step creation process: Overview → Inputs → Execution → Outputs → UI Form → Policy → Review.
- Each Action has a **Capability** type (API / AI / RPA / Human / Rules), a **Category** (Eligibility, Denials, Coding, etc.), and a **Scope** (Global = visible to all clients, or Client-specific).
- **Execution config** includes: Connector Type + Operation binding, Timeout (seconds), Retry (attempts), Rate Limit (default 100/min), Cost Estimate.
- **Policy config** includes: PHI Handling (e.g., Mask Logs + Encrypt Data), Environment Availability, Store Raw Response toggle.
- They provide JSON schemas for inputs and UI definitions.
- The generic `skill_node` component in React dynamically parses these schemas to render input fields in the properties panel — **no custom React code per action**.
- Published Action Versions are **immutable**.
- The admin UI provides a live **Action Definition Preview** panel during creation, summarizing input/output counts and remaining steps.

---

## 9. Compilation Boundary

```
React Flow edits → Persist as Skill Version + Nodes + Routes (DB)
        ↓
Backend "Skill Compiler" validates + produces compiled_skill_json
        ↓
Durable execution layer reads compiled_skill_json → constructs LangGraph graph
```

> **Critical:** Never execute directly from the raw React Flow graph state. The database model is canonical for execution.

---

## 10. Security & Permissions Model

- **Roles:** `viewer`, `editor`, `publisher`, `admin` (ladder-based).
- **Environment gating:** Production operations require `publisher` or `admin` role.
- **PHI handling:** Per-action policy controls for log masking, raw response storage, and encryption-at-rest flags.
- **Idempotency:** API supports `Idempotency-Key` header to prevent duplicate creates on retries.
