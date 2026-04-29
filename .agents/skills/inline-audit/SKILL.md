---
name: inline-audit
description: >
  Detects and fixes all inline style violations in TSX files for Tensaw Skills Studio.
  Catches style={{ }}, hardcoded hex colors, AntD style props (labelStyle, bodyStyle),
  and dynamic styles that should use CSS custom properties. Use when the user says
  "check inline styles", "audit inline", "find style={{", "inline style check", or
  "/inline-audit". Always read resources/inline-rules.json before scanning. Reports
  violations with category, file, line, and fix plan. Auto-fixes upon approval.
---

# Inline Style Auditor

The Tensaw design system has one rule: **all styles live in CSS files, never in JSX**.
This skill enforces that rule end-to-end — detection, categorisation, and surgical fixing.

## The Only Allowed Inline Style Pattern

```tsx
// ✅ ONLY this is allowed — CSS custom property injection for runtime-computed values
style={{ '--panel-width': `${width}px` } as CSSProperties}
```

Everything else must be in a `.css` file using design tokens.

## Violation Categories

Read `resources/inline-rules.json` for the full rule set, token map, and fix strategies.
The four categories at a glance:

| # | Category | Severity | Description |
|---|----------|----------|-------------|
| CAT-1 | Static Inline Style | ❌ Error | `style={{ color: 'red' }}` — static, never changes |
| CAT-2 | Dynamic (tokenizable) | ❌ Error | `style={{ width: w + 'px' }}` — use CSS custom prop instead |
| CAT-3 | CSS Variable Injection | ✅ Allowed | `style={{ '--w': w } as CSSProperties}` — correct pattern |
| CAT-4 | AntD Style Props | ⚠️ Warning | `labelStyle={}`, `bodyStyle={}` — move to scoped CSS |

---

## Triggers
* "check inline styles"
* "audit inline"
* "find style={{"
* "inline style check"
* `/inline-audit`
* After any refactor where components were touched

---

## Execution Workflow

### 1. Identify Scope
- If the user provides a file or folder path → scan only that target
- If no path given → scan all `.tsx` files under `src/` recursively
- Always load `resources/inline-rules.json` first

### 2. Scan for Violations

Run these checks on every `.tsx` file in scope:

**Check A — `style={{` prop on HTML/React elements:**
Search for `style=\{\{` patterns. For each match:
- Inspect the style object properties
- If ALL values are static → CAT-1
- If ANY value is a JS expression (state/prop) → CAT-2 unless it's a CSS variable injection → CAT-3

**Check B — AntD component style props:**
Search for `labelStyle=`, `contentStyle=`, `bodyStyle=`, `headStyle=`, `wrapperStyle=`
- These are AntD-specific inline styles → CAT-4

**Check C — Hardcoded colors inside style objects:**
Search for `#[0-9a-fA-F]{3,8}` and `rgb(a)?(` inside any style prop value
- Cross-reference against `resources/inline-rules.json` → `token_map.colors` for the correct CSS variable

**Check D — Hardcoded spacing/size inside style objects:**
Search for numeric pixel values inside style props (e.g. `padding: 16`, `margin: '8px'`)
- Cross-reference against `token_map.spacing` and `token_map.font_size`

### 3. Report

Output the audit in this format:

```
## Inline Style Audit — [scope]

### ❌ CAT-1: Static Inline Styles (must fix)
| # | File | Line | Element | Properties | Action |
|---|------|------|---------|------------|--------|
| 1 | ActionCard.tsx | 42 | <div> | color, fontWeight | Move to .ac-label in ActionCard.css |

### ❌ CAT-2: Dynamic Styles — Use CSS Custom Properties
| # | File | Line | Dynamic Value | Fix |
|---|------|------|---------------|-----|
| 1 | SkillDesignerCanvas.tsx | 88 | width: panelWidth | Set --panel-width via CSS var |

### ⚠️ CAT-4: AntD Style Props
| # | File | Line | Prop | Fix |
|---|------|------|------|-----|
| 1 | CreateActionModal.tsx | 55 | bodyStyle | Add .cam-body .ant-card-body override |

### ✅ CAT-3: Approved CSS Variable Injections
- ExecutionDebuggerModal.tsx:57 — --io-width (resizer state) ✅
```

Then say: *"Found N violations across X files. Here's my fix plan. Proceed?"*

### 4. Fix (upon approval)

Execute in this order for each violation:

**CAT-1 — Static Inline Style:**
1. Open the component's `.css` file (create if missing)
2. Add a new CSS class using BEM naming: `.component-name__element`
3. Move all properties into the class, replacing hardcoded values with tokens from `inline-rules.json`
4. In the TSX: remove `style={{...}}`, add `className="..."` (merge with existing if present)

**CAT-2 — Dynamic Style:**
1. Extract the runtime value as a CSS custom property name (e.g., `--panel-width`)
2. Change `style={{ width: val }}` → `style={{ '--panel-width': `${val}px` } as CSSProperties}`
3. In CSS: `.element { width: var(--panel-width, <fallback>); }`
4. Move any static sibling properties from the style object into the CSS class

**CAT-4 — AntD Style Props:**
1. Add a `className` to the AntD component (e.g., `className="cam-section"`)
2. In the CSS file: add `.cam-section .ant-[component-part] { ... }` with `!important` as needed
3. Remove the `labelStyle`/`bodyStyle`/etc. prop from the JSX
4. Map hardcoded color values to tokens using `inline-rules.json → token_map.colors`

### 5. Verify
After all fixes:
- Grep for `style=\{\{` in the changed files to confirm only CAT-3 patterns remain
- Grep for hardcoded hex colors (`#[0-9a-fA-F]{6}`) in JSX to confirm none remain
- Report: *"All N violations resolved. Inline style compliance: 100%."*

---

## Critical Rules
- **NEVER remove** `style={{ '--var': value } as CSSProperties}` — that is the approved dynamic pattern
- **NEVER break** dynamic behavior. If a value changes at runtime, it MUST still be dynamic after the fix
- **NEVER add** a new `style={{` to fix a `style={{` — always route through CSS
- When moving a style to CSS, always **use a design token** (from `inline-rules.json`) instead of the raw value
- When in doubt about which token to use, check `src/index.css` as the source of truth
- For AntD overrides, always add the fix to the **component's own CSS file**, never to `index.css`
