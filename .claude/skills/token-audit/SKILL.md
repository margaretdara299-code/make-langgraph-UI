---
name: token-audit
description: >
  Audits CSS and TSX files to verify that font-family and font-size values use
  the correct Tensaw design tokens (CSS variables) instead of hardcoded values.
  Use this skill when the user says "check tokens", "audit font sizes", "are the
  tokens correct", "check font-family", or "run token audit". Always run on any
  CSS or TSX file that touches typography. Reports violations with line numbers
  and auto-fixes upon approval.
---

# Typography Token Auditor

This skill enforces the Tensaw design token contract for typography.
Every `font-family` and `font-size` in the codebase must use a CSS variable from `src/index.css`.
Hardcoded pixel values or font stack strings are violations.

## Token Reference (from `src/index.css`)

### Font Family Tokens
| Token            | Value                                              |
|------------------|----------------------------------------------------|
| `--font-sans`    | `'Inter', -apple-system, BlinkMacSystemFont, ...`  |
| `--font-mono`    | `'JetBrains Mono', 'SFMono-Regular', Consolas, ...`|
| `--font-display` | alias of `--font-sans`                             |

### Font Size Tokens
| Token          | px value |
|----------------|----------|
| `--text-xs`    | 11px     |
| `--text-sm`    | 14px     |
| `--text-base`  | 14px     |
| `--text-lg`    | 16px     |
| `--text-xl`    | 18px     |
| `--text-2xl`   | 24px     |
| `--text-3xl`   | 32px     |

## Triggers
* "check tokens"
* "audit font sizes"
* "are the tokens correct"
* "check font-family"
* "run token audit"
* `/token-audit`

## Execution Workflow

### 1. Identify Scope
If the user provides a file path, scan only that file.
If no file is specified, scan all `.css` and `.tsx` files under `src/` recursively.
Always read `resources/typography-tokens.json` first to load the forbidden patterns list.

### 2. Scan for Violations
Search for these violation categories:

**Category A — Hardcoded font-size in CSS files:**
- Any `font-size: <px>` where the value matches a token's px equivalent (e.g. `font-size: 14px` → should be `var(--text-sm)`)
- Any `font-size: <rem>` equivalent (e.g. `font-size: 0.875rem`)

**Category B — Hardcoded font-family in CSS files:**
- Any `font-family:` that does not start with `var(--font-`
- e.g. `font-family: Inter`, `font-family: 'JetBrains Mono'`, `font-family: monospace`

**Category C — Inline style violations in TSX/TSX files:**
- Any `style={{ ... }}` containing `fontSize` or `fontFamily` with a raw value
- e.g. `style={{ fontSize: 14 }}`, `style={{ fontFamily: 'Inter' }}`

**Category D — Font sizes with NO token:**
- Sizes like 10px, 12px, 13px, 15px have no corresponding token. Flag these as warnings (not errors) — they may be intentional but should be noted.

### 3. Report
Output a structured audit report in this format:

```
## Token Audit Report — [filename]

### ❌ Violations (must fix)
| # | File | Line | Found | Should Be |
|---|------|------|-------|-----------|
| 1 | PropertiesDrawer.css | 42 | font-size: 14px | var(--text-sm) |
| 2 | ActionCard.tsx | 88 | style={{ fontSize: 11 }} | var(--text-xs) via CSS class |

### ⚠️ Warnings (no token exists — review manually)
| # | File | Line | Found | Note |
|---|------|------|-------|------|
| 1 | StepCard.css | 12 | font-size: 12px | No token for 12px — confirm intentional |

### ✅ Clean files
- src/components/NodePalette/NodePalette.css — all typography uses tokens
```

Then say: *"Found N violations across X files. Want me to fix them?"*

### 4. Fix (upon approval)
- In CSS files: replace hardcoded values with the correct `var(--token)` 
- In TSX files: remove the inline `style` attribute and move the property to a CSS class, then apply `var(--token)` there
- Do NOT fix Category D warnings without explicit user instruction — sizes without tokens may be intentional

### 5. Verify
After fixing, grep for the replaced values to confirm no instances remain.
Report: *"All N violations resolved. Token compliance: 100%."*

## Critical Rules
- NEVER replace `!important` Ant Design overrides in `index.css` — those are intentional resets
- NEVER touch font-size values inside `@keyframes` blocks
- If a file is a third-party style override (e.g. `.ant-*` selector scope), flag but do not auto-fix
- When fixing TSX inline styles: always prefer adding a CSS class over keeping an inline variable
