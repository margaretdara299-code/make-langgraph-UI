---
name: code-refactorer
description: >
  Refactors chaotic, overgrown React components into clean, modular, and maintainable
  code. Use when components are too long, logic is mixed with UI, or when the user asks
  to "clean up", "refactor", "organize", "extract the logic", or "break this down".
  Also trigger proactively when you see a component exceeding ~150 lines or mixing
  API calls directly inside JSX. Always present a refactor plan before writing code.
---

# Code Refactorer Skill

This skill breaks down monolithic React files into elegant, separated concerns suitable for an enterprise-grade SaaS project.

## Objective
Transform large, complex React components into the standard Tensaw Studio architecture:
1. A clean UI component file (`.tsx`) focused ONLY on rendering.
2. A separate custom hook for logic (`useComponentName.hook.ts`).
3. Extracted constants or interfaces if applicable (`component.constants.ts`).

## Triggers
* "refactor this component"
* "extract the logic into a hook"
* "clean up this file"
* "break this down"
* "this component is getting too big"

## Execution Workflow

### 1. Audit (Discovery)
When triggered, immediately scan the target file. Identify:
- State variables (`useState`, `useReducer`)
- Side effects (`useEffect`)
- API calls, handlers, and heavy business logic
- Render layout (JSX)

### 2. The Planning Phase (Vibe Check)
Before rewriting the code, ALWAYS present a structured Refactoring Plan. Do not proceed to write code without user approval.

Example structure:
> "Here is my refactor plan for `ActionCatalogPage`:"
> 1. Extract search and filter state into `useActionCatalog.hook.ts`.
> 2. Move table columns definition to `actionCatalog.columns.tsx`.
> 3. Leave only clean JSX in `ActionCatalogPage.tsx`.
> Proceed?

### 3. Execution (The Refactor)
Upon user approval:
1. Create the custom hook file and migrate all logic. Return only the state and handler functions the UI actually needs.
2. Create/Update standard CSS files — no inline styles allowed.
3. Update the main `.tsx` component to consume the newly created hook. Ensure semantic HTML is strictly followed.

### 4. Verification
After refactoring, review to ensure:
- The custom hook uses valid Dependency Arrays.
- The UI layer is stateless (or nearly stateless) and easy to read.

## Critical Safety Rules
**NEVER ALTER THE DATA FLOW.**
This is a pure structural refactor. You must guarantee 100% functional equivalence.
- Do NOT change variable names used in APIs.
- Do NOT change the order of asynchronous operations.
- Do NOT add missing features or remove existing ones.
- Your only job is to seamlessly move the exact current logic from the UI file into a Hook file without breaking the application.

## Reference Examples
- See `examples/spaghetti-component.tsx` — the before state (what not to do).
- See `examples/refactored-component.tsx` — the after state (the target architecture).
