# Tensaw Skills Studio — Master PRD v0.1

## 1. Product Vision
Empower Revenue Cycle Management (AR) leaders to **visually define, safely test, and seamlessly publish** complex AI-assisted workflows ("Skills") without writing any code, ensuring a strict boundary between business logic design and backend technical execution.

---

## 2. Target Persona

**The AR Manager / Revenue Cycle Expert (e.g., "Manoj")**
- **Needs:** Guide AI and automations strictly, enforcing compliance and operational rules.
- **Capabilities:** Understands business logic, routing, and conditions perfectly, but cannot write Python or LangGraph.
- **Experience:** Requires a simple, drag-and-drop mechanism with guardrails to prevent infinite loops, hallucination leakage, and broken integrations.

**Secondary: Admin/Ops**
- Creates and publishes Actions (the building blocks AR Managers consume). Cannot be modified by AR Managers.

---

## 3. Core Epics

### Epic 1: The Skills Library (Browse & Discover)

![Skills Library — card grid with status sidebar and filters](C:/Users/Tensaw/.gemini/antigravity/brain/484365f0-50aa-4b36-80c8-3bd96e477757/ui_mockups/skills_library.png)

| Feature | Detail |
|---|---|
| **Left Sidebar** | Status-filtered navigation: **All**, **Published**, **Drafts**, **Archived** — each with a dynamic badge count. Also includes a "Getting Started" section (e.g., "+ New Connector"). |
| **Card Grid** | Each skill is rendered as a card with: skill key badge, status pill, skill name, description, last updated timestamp, and author name. |
| **Contextual Actions per Card** | Action buttons vary by status: **Draft** → Edit, Test, Publish, ⋯; **Published** → Edit, Test, Publish, Delete, ⋯; **Archived** → View, Archive, ⋯. Viewers see only "View" and "⋯". |
| **Tab Filters** | Top tabs: All, Published, Drafts, Client, Archived. |
| **Search & Filter Bar** | Search input + Filter by Status dropdown + Client dropdown + Sort dropdown. |
| **Pagination** | Pagination controls indicating current viewing range. |
| **Environment Selector** | Top-right global selector for Client, Payer, and Environment context. |
| **Lifecycle UI** | Clear status indicators: `Draft`, `Published`, `Archived`. |
| **Create Flow** | "**+ New Skill**" button (top right) opens a **2-step wizard modal** with three initialization modes: **Blank** (starts with Start→End nodes), **Template** (from pre-built baselines like "Denial Triage", "Eligibility Verification"), or **Clone** (from an existing skill/version including test cases). |

![Create Skill modal — Step 1/2: Basics](C:/Users/Tensaw/.gemini/antigravity/brain/484365f0-50aa-4b36-80c8-3bd96e477757/ui_mockups/create_skill_modal.png)

| Feature | Detail |
|---|---|
| **Create Skill Fields (Step 1/2: Basics)** | Skill Name (required, 3–80 chars), Skill Key (auto-generated `^[A-Z][A-Z0-9]{1,7}$`, editable by admin), Description (max 240 chars with counter), Category (dropdown), Tags (chip input, max 10, each ≤24 chars), Client (required, dropdown), Environment (dropdown, role-gated), **Owner** (user dropdown, defaults to current user), Optional Payer (field visible). |
| **Post-create** | Redirect to Designer at `/skills/{skillId}/versions/{skillVersionId}/design`. |

### Epic 2: The Visual Skill Editor (The Canvas)

![Canvas Designer — 3-pane layout with properties drawer](C:/Users/Tensaw/.gemini/antigravity/brain/484365f0-50aa-4b36-80c8-3bd96e477757/ui_mockups/canvas_designer.png)

**3-Pane "Domain-Specific" Layout:**

#### Left Panel — Node Library (Palette)
Collapsible, categorized list of available capability definitions pulled from the Action Catalog, with a total node count badge:
- **▸ Triggers:** e.g., Queue Trigger, Schedule, Webhook
- **▸ Actions:** e.g., AI Classify, Rules Engine, Human Review, Create Task, Update PM, Send Message
- **▸ Integrations:** e.g., PM System, Eligibility, Auth Portal, Documents, Temporal

Each item has an affordance indicating it is draggable onto the canvas.

#### Center Panel — Orchestrator Canvas (React Flow)
- **Tabs** below the top bar for different views: **Design** (active canvas), **Logic**, **Test Case**, **Monitoring**.
- Entry metadata strip: displays trigger context, source queue, and applicable rate limits.
- **View mode toggles** (list, grid, split, full-screen) and an "add element" action.
- Zoom controls and indicators.
- Diagramming workspace where users define execution sequences by linking nodes.
- Supports branching, merging, and multi-path flows with visible CEL condition labels on edges.
- Visual indicators: color-coded node icons per type, connector binding chips, prompt version labels, and decision routing labels.
- Bottom bar controls: collaborator indicators, page navigation, minimap toggle, and viewport fit controls.

#### Right Panel — Properties Drawer
Context-aware parameter configuration that opens when a node is clicked. Shows fields dynamically based on the node's underlying action definition schema:
- **Node header:** icon + node name + settings access.
- **AI/Model configuration:** (if applicable) dropdowns for model selection, prompt version linking, and direct access to prompt editing.
- **Inputs & Outputs:** displayed as mapped fields or variables.
- **Thresholds section:** sliders or numeric inputs for confidence levels, timeout limits, etc., defined by the action schema.
- **Rules & Connections:** lists defined outgoing routes with visual state matching the edge color, target step references, and an affordance to add new connections.
- **Destructive actions:** e.g., Delete Node at the bottom.

> **Key design principle:** The properties panel is **dynamically generated** from the Action Version's `ui_form_json` schema — no custom React code per action type.

#### Top Bar
- **Left:** Global back navigation, active Skill reference (key, name), lifecycle status pill, and version indicator.
- **Center:** Global search bar across the Studio domain.
- **Right:** Context selectors (Client, Payer, Environment), notifications, user profile.
- **Primary Actions:** Save (draft), Test execution, Publish artifact.

### Epic 3: Review, Validate, and Publish

| Feature | Detail |
|---|---|
| **Validation Gating** | Built-in safeguards: single Start node, all nodes reachable, no detached nodes, input mapping coverage, schema adherence, route coverage for decision nodes. |
| **Testing Harness (Sandbox)** | Test Run modal: users run a mock execution of a draft skill against sample data. Backend traverses the compiled JSON hitting mocked endpoints. |
| **Compilation** | Backend compiles the visual graph into structured JSON DSL (`graph.json`, `nodes.json`, `state.json`). Compilation produces a `compile_hash` for caching. |
| **Git Bridge Deployment** | Publish transforms the graph → JSON → Git push to BitBucket. CI/CD pipeline validates and deploys to Temporal workers. |

### Epic 4: Action Catalog (Admin Tools)

An admin-only experience to manage the building blocks AR Managers consume.

![Action Catalog — Step 1/7: Overview with Action Definition Preview](C:/Users/Tensaw/.gemini/antigravity/brain/484365f0-50aa-4b36-80c8-3bd96e477757/ui_mockups/create_action_step1.png)

#### Action Catalog Browse Screen
| Element | Detail |
|---|---|
| **Left Sidebar — "Actions"** | Status filters with badge counts: All Actions, Published, Drafts, Archived. |
| **Left Sidebar — "Categories"** | Dynamic category tree with assigned action counts (e.g., Eligibility, Denials, Auth), and capability to add new categories. |
| **Search & Filter Bar** | Search input + Capability filter dropdown + Category filter dropdown. |
| **Right-hand Action List** | Cards summarizing action definitions: icon, name, category, status, last modified, and edit actions. |
| **Pagination** | Standard pagination controls. |

#### 7-Step Action Creation Wizard

**Step 1/7: Overview** (shown in mockup):
- Action Name (required), Action Key (required, lowercase dot notation e.g. `eligibility.verify`, with validation indicator ✅)
- Description (max 400 chars with counter)
- Category (required, dropdown), Capability (required, dropdown: API/AI/RPA/Human/Rules)
- Default Connector Type (required, dropdown with clear button)
- Icon (custom icon selector with "Change" button)
- **"Visible to all clients (Global)"** toggle (ℹ️ tooltip)
- **Action Definition Preview panel** (right side): shows live preview of the action card as it will appear, including category tags, and lists "This action will require:" (Input fields count, Output fields count, Execution config, UI Form layout) plus a vertical **"Next steps"** list (2. Define Inputs → 3. Configure Execution → 4. Define Outputs → 5. Configure UI Form → 6. Set Policy & Security → 7. Review & Publish)
- Buttons: Cancel | Save Draft | **Save Draft & Continue →**

![Action Catalog — Step 1/2: Define Action with configuration](C:/Users/Tensaw/.gemini/antigravity/brain/484365f0-50aa-4b36-80c8-3bd96e477757/ui_mockups/create_action_step2.png)

**Step 1/2: Define Action** (alternate configuration view):
- **Basic Details (left column):** Action Name, Action Key, Category dropdown, Description, **Capability radio/chip selector** (API ☑️, AI, RPA, Human, Rules)
- **Connector & Operation section:** Connector Type (required, dropdown), Operation (required, dropdown showing e.g. `eligibility.check` with description), "View Connector Docs ↗" link
- **Action Configuration (right column):** Icon with "Change Icon" button, Node Title (default), "Requires Connector Instance" toggle (on), "Store Raw Response" toggle (off), Timeout (seconds), Retry (attempts)
- **Advanced Settings (expandable):** Rate Limit dropdown ("Default 100/min"), Cost Estimate ("$$ Low"), Environment chips (Sandbox / Staging / Prod 🔒), PHI Handling dropdown ("Mask Logs + Encrypt Data")
- Buttons: Cancel | Save as Draft ▾ | **Continue →**

**Remaining steps (from schema):**
2. **Inputs:** Define typed input fields (name, type, required, description, PHI flag, validations). Produces `inputs_schema_json`.
3. **Execution:** Connector type, operation, timeout/retry/rate-limit defaults, request/response templates.
4. **Outputs:** Define output schema, mark persistable outputs, gate raw response storage.
5. **UI Form:** Define what AR Managers see in Node Properties — sections for input mapping, connector selection, output storage, retry overrides, with ExpressionPicker and dropdown widgets.
6. **Policy & Security:** PHI masking, encryption-at-rest flags, environment availability toggles, approval requirements.
7. **Review & Publish:** Validation checklist; publish creates an **immutable** Action Version.

---

## 4. Routing Logic

Three route types supported on edges:
- **Unconditional:** Always flow to next node.
- **Conditional:** Expression-based using CEL (e.g., `outputs.confidence >= 0.75`).
- **Default/Fallback:** When no condition matches.

Stored as structured JSON: `{ "type": "expression", "language": "cel", "expr": "..." }`

---

## 5. Human-in-the-Loop (Wait States)

The UI and orchestration natively support pause states:
- If an Agent's confidence is too low, or policy requires human validation (e.g., high dollar amount), the workflow **pauses** and pushes the task to a **Human Review Queue**.
- The `action.human_review` node type maps directly to paused `RCM_Task` queue entries in the database.

---

## 6. The Expected Output

**The Studio does NOT produce:**
- Python `.py` files
- Running bots
- Direct database mutations to production systems

**The Studio DOES produce:**
A highly-structured **JSON Configuration Document** (the DSL) representing the entire business logic tree. This JSON is pushed to Git via the Git Bridge. An entirely separate runtime engine (Temporal + LangGraph) parses the JSON and executes tasks according to the exact routing rules specified.

> The AR Manager uses the Studio merely to draw the blueprint; the execution engine reads the blueprint to build the house.

---

## 7. Out of Scope for MVP
- Real-time execution monitoring of live workflows inside the Studio UI (mock testing only)
- Python/LangGraph code generation
- Direct manipulation of runtime production databases
- Building new Tools/Connectors (developer responsibility)
- Rules Engine implementation (acknowledged but deferred)
