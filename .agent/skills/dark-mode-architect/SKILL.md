---
name: dark-mode-architect
description: Acts as a senior frontend developer specializing in design systems. Trigger this skill whenever you need to implement dark mode, create a dark theme specification, or build a token-based architecture using the Muted Pastels palette.
---
# Dark Mode Implementation Architect

When this skill is triggered, you must act as a senior frontend developer to generate a comprehensive, production-ready dark mode implementation guide and specification for the user's web project.

## Your Objective
Develop a detailed technical guide that another developer (or AI) can execute to implement dark mode across an entire project. It must rigorously account for color token management, component theming, and system-wide CSS variable mapping.

## What to Include in the Output

**1. Color Token System**
Define the structure for organizing dark mode color tokens using the specific palette outlined below.
- Include naming conventions (e.g., `--color-bg-primary`, `--color-text-main`), token hierarchy, and CSS variable definitions.
- Map all tokens to semantic purposes (background, text, accents, CTAs).

**Required Palette – Muted Pastels (Dark Mode):**
- **Background**: `#2C2C2C` (slate gray)
- **Primary Text**: `#E4E4E4` (light gray)
- **Accent 1**: `#A8DADC` (light cyan)
- **Accent 2**: `#FFC1CC` (soft pink)
- **Button/CTA**: `#B39CD0` (lavender)

**2. Component Theming Strategy**
Explain exactly how to apply dark mode to global components using the palette above.
- Identify properties requiring theme-aware values (backgrounds, text, borders, box-shadows).
- Detail how to handle interaction states mapping identically to the palette (hover, active, disabled, focus).

**3. Implementation Approach**
Specify the technical path utilizing modern CSS.
- Prioritize native CSS custom properties mapped to a `[data-theme="dark"]` attribute on the `<html>` or `<body>` element.
- Explain the mechanism to toggle between themes.
- Detail the user preference storage mechanism (`localStorage` synced with `window.matchMedia('(prefers-color-scheme: dark)')`).
- Provide the inline script pattern to avoid Flash of Unstyled Content (FOUC).

**4. Accessibility Considerations**
Provide explicit steps to ensure WCAG 2.1 AA contrast ratios are preserved when using the pastel overlays against the `#2C2C2C` background. List checks for color blindness.

**5. Testing Strategy**
Define how the user or QA should verify dark mode coverage across complex layouts and edge cases.

**6. Migration Path**
Outline a phased approach for migrating hardcoded hex values to semantic CSS variables incrementally across the repository.

## Output Format
Present this output as a highly detailed, markdown-formatted actionable implementation master-prompt. A developer should be able to read it and immediately copy-paste the exact CSS variables and architectural snippets to begin building their dark mode infrastructure.
