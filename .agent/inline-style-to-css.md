---
name: inline-style-to-css
description: >
  Converts React inline styles to regular CSS class files. Use this skill whenever the user mentions
  inline styles, style={{...}}, style objects, converting to className, extracting styles to CSS,
  cleaning up React components with too many inline styles, auditing components for inline styling,
  or refactoring to plain CSS architecture. Triggers: "remove inline styles", "convert style props
  to CSS", "extract styles", "clean up inline styles", "refactor to CSS classes", "too many inline styles",
  "convert style={{}} to className", "check for inline styles", "CSS rule check".
---

# Inline Style → Regular CSS Converter Skill

A **production-grade** skill for scanning React/TSX components, extracting all inline `style={{...}}`
declarations, and replacing them with clean, semantic CSS classes in standard `.css` files.

---

## 🎯 Objective

Transform this:
```tsx
<div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px' }}>
  <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>Label</span>
</div>
```

Into this:
```tsx
import './MyComponent.css';

<div className="my-component-row">
  <span className="my-component-label">Label</span>
</div>
```

With a generated `MyComponent.css`:
```css
.my-component-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
}

.my-component-label {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
}
```

---

## 📋 When to Trigger This Skill

| User says…                              | Action                                      |
|-----------------------------------------|---------------------------------------------|
| "remove inline styles from X"           | Full refactor of the target file            |
| "convert style={{}} to className"       | Extract + replace all static inline styles  |
| "check this component for inline styles"| Audit mode — report only, no changes        |
| "clean up my React styles"              | Scan all TSX/JSX and batch-refactor         |
| "too many inline styles in my project"  | Run repo-wide audit then convert            |
| "extract styles to a CSS file"          | Generate `.css` file, update imports        |
| "CSS rule check"                        | Combined: audit CSS + detect inline abuse   |

---

## 🛠️ Tools & Dependencies

### Required npm Packages
```bash
npm install --save-dev @babel/parser @babel/traverse @babel/types @babel/generator
```

### Built-in Node.js APIs
- `fs` / `path` — file reading, writing, path resolution
- `process` — CLI argument handling

---

## 🔍 Phase 1: Discovery & Audit

Before making any changes, **always audit first**.

### Step 1.1 — Identify Target Files

Use `grep_search` or `run_command` to find all files with inline styles:

```bash
# Find all TSX/JSX files containing style={{
grep -rl "style={{" src/ --include="*.tsx" --include="*.jsx"

# Also catch style prop passed as variable
grep -rl "style={styles" src/ --include="*.tsx" --include="*.jsx"
```

### Step 1.2 — Build Audit Report

For each file found, extract:

| Column        | Description                                           |
|---------------|-------------------------------------------------------|
| File          | Relative path to the component                        |
| Line          | Line number where inline style occurs                 |
| Element       | HTML element or component name (e.g. `<div>`, `<span>`) |
| Style Preview | First 60 chars of the style object                    |
| Static?       | `YES` if all values are literals, `NO` if dynamic     |
| Action        | `CONVERT` / `KEEP` / `SPLIT`                          |

### Step 1.3 — Classify Each Style

```
STATIC   → All values are string/number literals → Safe to extract to CSS
DYNAMIC  → Contains template literals, ternary, or variable references → Keep inline
MIXED    → Has both static and dynamic values → Split: static → CSS, dynamic → inline
```

---

## ⚙️ Phase 2: Core Conversion Logic

### 2.1 — JavaScript camelCase → CSS kebab-case

```typescript
function camelToKebab(prop: string): string {
  return prop.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`);
}
```

**Full Property Map Table:**

| JS Property           | CSS Property            |
|-----------------------|-------------------------|
| `backgroundColor`     | `background-color`      |
| `fontSize`            | `font-size`             |
| `fontWeight`          | `font-weight`           |
| `lineHeight`          | `line-height`           |
| `borderRadius`        | `border-radius`         |
| `flexDirection`       | `flex-direction`        |
| `alignItems`          | `align-items`           |
| `justifyContent`      | `justify-content`       |
| `marginTop`           | `margin-top`            |
| `paddingLeft`         | `padding-left`          |
| `zIndex`              | `z-index`               |
| `pointerEvents`       | `pointer-events`        |
| `textTransform`       | `text-transform`        |
| `letterSpacing`       | `letter-spacing`        |
| `boxShadow`           | `box-shadow`            |
| `textDecoration`      | `text-decoration`       |
| `overflowX`           | `overflow-x`            |
| `whiteSpace`          | `white-space`           |
| `wordBreak`           | `word-break`            |
| `userSelect`          | `user-select`           |

### 2.2 — Numeric Value Handling

```typescript
// Properties that stay unitless when number
const UNITLESS_PROPERTIES = new Set([
  'opacity', 'zIndex', 'flex', 'flexGrow', 'flexShrink',
  'order', 'fontWeight', 'lineHeight', 'zoom',
]);

function valueToCSS(prop: string, value: string | number): string {
  if (typeof value === 'number') {
    return UNITLESS_PROPERTIES.has(prop) ? String(value) : `${value}px`;
  }
  return value;
}
```

### 2.3 — Full Style Object → CSS Rule Conversion

```typescript
function styleObjectToCSS(className: string, styles: Record<string, any>): string {
  const rules = Object.entries(styles)
    .map(([prop, value]) => {
      const cssProp = camelToKebab(prop);
      const cssValue = valueToCSS(prop, value);
      return `  ${cssProp}: ${cssValue};`;
    })
    .join('\n');

  return `.${className} {\n${rules}\n}`;
}
```

---

## 🏷️ Phase 3: Class Naming Strategy

### 3.1 — Naming Convention (STRICT: kebab-case only)

```
{component-name}-{element-role}[-{modifier}]
```

**Examples:**

| Component       | Element Context  | Generated Class Name          |
|-----------------|-----------------|-------------------------------|
| `ActionCard`    | wrapper `<div>` | `.action-card-wrapper`        |
| `ActionCard`    | title `<span>`  | `.action-card-title`          |
| `ActionCard`    | icon container  | `.action-card-icon`           |
| `GroupCard`     | header row      | `.group-card-header`          |
| `NodePalette`   | scroll area     | `.node-palette-scroll`        |
| `SkillDesigner` | toolbar `<div>` | `.skill-designer-toolbar`     |

### 3.2 — Role Detection Heuristic

Derive the role from:
1. **`className` attribute** already on the element → use as hint
2. **Element type**: `<header>` → `-header`, `<footer>` → `-footer`, `<nav>` → `-nav`
3. **Children content**: if only text → `-label` or `-text`
4. **Style signature**:
   - Has `display: flex` → `-row` or `-container`
   - Has `position: absolute/fixed` → `-overlay`
   - Has `fontSize` only → `-text` or `-label`
   - Has `width + height` → `-box` or `-icon`
   - Has `border` → `-border` or `-card`

### 3.3 — Collision Avoidance

Track generated class names per file. If collision:
```
.action-card-text        ← first occurrence
.action-card-text-2      ← second occurrence
.action-card-text-3      ← third
```

---

## 🔀 Phase 4: Handling Special Cases

### 4.1 — DYNAMIC Styles (Keep Inline)

```tsx
// ❌ Cannot convert — value is dynamic
<div style={{ width: `${progress}%` }} />
<div style={{ opacity: isVisible ? 1 : 0 }} />
<div style={{ color: theme.primary }} />

// ✅ Mark with TODO comment in output
{/* INLINE-STYLE: dynamic — cannot auto-convert */}
<div style={{ width: `${progress}%` }} />
```

### 4.2 — MIXED Styles (Split)

```tsx
// Before:
<div style={{ display: 'flex', opacity: isActive ? 1 : 0.5 }} />

// After — static part goes to CSS, dynamic stays inline:
<div className="my-component-row" style={{ opacity: isActive ? 1 : 0.5 }} />
```

Generated CSS:
```css
.my-component-row {
  display: flex;
}
```

### 4.3 — Conditional Class Application

```tsx
// BEFORE:
<div style={{ color: isActive ? 'green' : 'gray', padding: '8px' }} />

// AFTER:
<div
  className={`my-component-status ${isActive ? 'my-component-status--active' : 'my-component-status--inactive'}`}
/>
```

Generated CSS:
```css
.my-component-status {
  padding: 8px;
}
.my-component-status--active {
  color: green;
}
.my-component-status--inactive {
  color: gray;
}
```

### 4.4 — Spread / Merged Styles

```tsx
// BEFORE:
const baseStyle = { padding: '12px', display: 'flex' };
<div style={{ ...baseStyle, color: 'red' }} />

// STRATEGY:
// 1. Resolve `baseStyle` to its literal object
// 2. Merge with inline overrides
// 3. Classify full merged object (static/dynamic/mixed)
// 4. Extract as usual
```

### 4.5 — Externally Defined Style Objects

```tsx
// BEFORE:
const cardStyles = {
  wrapper: { padding: '20px', borderRadius: '8px' },
  title: { fontSize: '16px', fontWeight: 700 },
};
<div style={cardStyles.wrapper}>
  <span style={cardStyles.title}>Title</span>
</div>

// AFTER:
// Convert entire `cardStyles` object to CSS classes
// Remove the const declaration from the component
```

---

## 📁 Phase 5: File Generation

### 5.1 — CSS File Creation Rules

| Rule                                       | Detail                                        |
|--------------------------------------------|-----------------------------------------------|
| File name                                  | Same as component, same directory             |
| If CSS already exists                      | **Append** new classes; never overwrite       |
| CSS file extension                         | `.css` only — NOT `.module.css`               |
| Class name scope                           | Global (no CSS modules, no hash suffixes)     |
| Comments in CSS                            | Add section header comment per component      |

**CSS File Header Template:**
```css
/* ============================================================
   ComponentName — Extracted from inline styles
   Auto-generated by inline-style-to-css skill
   Date: YYYY-MM-DD
   ============================================================ */
```

### 5.2 — Import Injection Rules

```tsx
// If import already exists → skip
// If no CSS file existed before → add import:
import './ComponentName.css';

// Placement: after all other imports, one blank line above the function
```

---

## 📊 Phase 6: Output Report Format

After completing all conversions, generate a **markdown report** with:

### Summary Table
```
## Inline Style Conversion Report
**Date:** 2026-04-24
**Scope:** src/components/

| Metric                      | Count |
|-----------------------------|-------|
| Files Scanned               |  24   |
| Files with Inline Styles    |   9   |
| Total Inline Style Blocks   |  47   |
| CONVERTED (static)          |  38   |
| KEPT (dynamic)              |   6   |
| SPLIT (mixed)               |   3   |
| CSS Files Created           |   7   |
| CSS Files Updated           |   2   |
| New CSS Classes Generated   |  41   |
```

### Per-File Breakdown
```
### src/components/ActionCard/ActionCard.tsx

| Line | Element  | Classes Generated            | Action    |
|------|----------|------------------------------|-----------|
|  24  | <div>    | .action-card-wrapper         | CONVERTED |
|  31  | <span>   | .action-card-title           | CONVERTED |
|  45  | <div>    | (dynamic: width)             | KEPT      |
|  52  | <button> | .action-card-btn             | CONVERTED |

→ Created: ActionCard.css
→ Added import to ActionCard.tsx
```

### Dynamic Styles Remaining
```
### ⚠️ Dynamic Styles NOT Converted (manual review needed)

| File                           | Line | Reason                          |
|--------------------------------|------|---------------------------------|
| ActionCard.tsx                 |  45  | `width: \`${progress}%\``       |
| NodePalette.tsx                |  78  | `color: theme.colors.primary`   |
```

---

## 🔄 Phase 7: Execution Workflow

```
1. AUDIT
   ├── Run grep to find all files with inline styles
   ├── For each file: classify all style occurrences (STATIC / DYNAMIC / MIXED)
   └── Generate pre-conversion audit report → ask user to confirm

2. CONFIRM
   └── Present audit findings. Ask: "Proceed with conversion? (yes/skip-file/manual)"

3. CONVERT (per file)
   ├── Read the component file
   ├── Parse JSX to locate all inline style props
   ├── For STATIC: extract → generate class name → write CSS → replace with className
   ├── For DYNAMIC: add TODO comment, leave as-is
   ├── For MIXED: split into className + remaining style prop
   ├── Write updated component file
   └── Write/update CSS file

4. IMPORT INJECTION
   └── Add `import './ComponentName.css'` if not already present

5. REPORT
   └── Generate final markdown report with full conversion summary
```

---

## 🚨 Safety Rules (NEVER Violate)

| Rule | Reason |
|------|--------|
| Never convert dynamic/computed values | Would break runtime behavior |
| Never delete style constants referenced from multiple places | Risk of breaking other components |
| Always check if CSS file exists before creating | Prevent overwriting hand-crafted CSS |
| Never use `.module.css` | Project uses global CSS, not CSS Modules |
| Never use scoped or hashed class names | Must remain globally addressable |
| Keep original file backup or use git before bulk changes | Safety net for bulk rewrites |
| Run `npm run dev`/build after conversion to verify | Catch regressions early |

---

## 🧪 Validation Checklist

After conversion, verify:

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` produces no TypeScript errors
- [ ] No `style={{}}` attributes remain on converted elements
- [ ] Generated CSS classes are not empty
- [ ] Import is present at top of each converted file
- [ ] Dynamic styles are still inline and functional
- [ ] No duplicate class names in the same CSS file
- [ ] All visual output matches pre-conversion appearance (manual check)

---

## 📂 This Project's CSS Architecture

> For this project (Tensaw Skills Studio UI):

| Convention                    | Value                            |
|-------------------------------|----------------------------------|
| CSS File Type                 | Plain `.css` (no CSS Modules)    |
| Class Naming                  | `kebab-case` with component prefix |
| CSS File Location             | Same directory as the component  |
| Import Style                  | `import './ComponentName.css'`   |
| Existing CSS files            | Check `.agent/css-rules.MD` for audit history |
| Global Variables/Tokens       | Defined in `src/index.css`       |
| Component prefix pattern      | `{component-name}-{role}`        |

---

## 💡 Quick Reference: Common Patterns

### Pattern A — Simple Container
```tsx
// BEFORE
<div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} />

// AFTER
<div className="my-component-row" />

// CSS
.my-component-row { display: flex; gap: 8px; align-items: center; }
```

### Pattern B — Text Styling
```tsx
// BEFORE
<span style={{ fontSize: '12px', color: '#888', fontWeight: 500 }} />

// AFTER
<span className="my-component-meta" />

// CSS
.my-component-meta { font-size: 12px; color: #888; font-weight: 500; }
```

### Pattern C — Positioned Overlay
```tsx
// BEFORE
<div style={{ position: 'absolute', top: 0, left: 0, width: '100%' }} />

// AFTER
<div className="my-component-overlay" />

// CSS
.my-component-overlay { position: absolute; top: 0; left: 0; width: 100%; }
```

### Pattern D — Icon Wrapper
```tsx
// BEFORE
<div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex' }} />

// AFTER
<div className="my-component-icon-wrap" />

// CSS
.my-component-icon-wrap { width: 36px; height: 36px; border-radius: 50%; display: flex; }
```

---

*Skill version: 1.0.0 | Project: Tensaw Skills Studio UI | Stored in: `.agent/inline-style-to-css.md`*
