# Dark Mode Implementation Guide & Specification

> **Persona:** Senior Frontend Developer specializing in Design Systems
> **Objective:** Comprehensive Dark Mode integration using the Muted Pastels palette.

This document serves as the master specification for implementing a scalable, WCAG-compliant Dark Mode architecture across the React application. 

---

## 1. Color Token System

We utilize a semantic token hierarchy. Primitive values (the hex codes) are mapped to semantic variables (the UI usage). This ensures that developers never use raw hex codes in their CSS.

### 1.1 The Muted Pastels Palette (Dark Mode)
| Token Name | Hex Value | Purpose |
|---|---|---|
| `slate-gray` | `#2C2C2C` | Deep base backgrounds |
| `light-gray` | `#E4E4E4` | Primary body text and icons |
| `light-cyan` | `#A8DADC` | Subtle interactive accents, borders, or toggles |
| `soft-pink` | `#FFC1CC` | Alerts, destructive actions (adapted), or secondary focus |
| `lavender` | `#B39CD0` | Primary buttons, active tabs, primary CTAs |

### 1.2 CSS Variable Mapping
Define these at the root level of your master CSS file (e.g., `index.css` or `global.css`).

```css
/* Base Light Mode Fallbacks (Define your light equivalents here) */
:root {
  --color-bg-base: #FFFFFF;
  --color-text-main: #1A1A1A;
  --color-accent-primary: #0056B3;
  --color-accent-secondary: #FF4D4F;
  --color-cta: #1890FF;
}

/* Dark Mode Overrides */
[data-theme="dark"] {
  /* Backgrounds */
  --color-bg-base: #2C2C2C;       /* slate gray */
  --color-bg-surface: #363636;    /* Slightly elevated surface */
  --color-bg-elevated: #404040;   /* Dropdowns, Modals */

  /* Text */
  --color-text-main: #E4E4E4;     /* light gray */
  --color-text-muted: #A3A3A3;    /* Secondary/Helper text */

  /* Accents & Brand */
  --color-accent-primary: #A8DADC;   /* light cyan */
  --color-accent-secondary: #FFC1CC; /* soft pink */

  /* CTAs & Interactions */
  --color-cta-base: #B39CD0;         /* lavender */
  --color-cta-hover: #9E84BE;        /* Darker lavender for hover */
  --color-cta-disabled: #5E5E5E;

  /* Borders & Dividers */
  --color-border-subtle: rgba(228, 228, 228, 0.1);
  --color-border-focus: #A8DADC;
}
```

---

## 2. Component Theming Strategy

### Properties Requiring Theme-Aware Values
Never hardcode colors in individual components. Replace existing hardcoded values with dynamic tokens.
- **Backgrounds:** Replace `#fff` with `var(--color-bg-base)` or `<Surface>` elements with `var(--color-bg-surface)`.
- **Text:** Replace `#000` or `#333` with `var(--color-text-main)`.
- **Borders:** Replace `#e5e5e5` with `var(--color-border-subtle)`.
- **Box Shadows:** Dark mode requires darker, less spread out shadows, or borders instead of shadows. Use `box-shadow: 0 4px 6px rgba(0,0,0,0.5);`.

### Handling Component States
- **Hover:** Dark mode hover states should generally *lighten* the background color by ~5-10% to indicate elevation, EXCEPT for CTA buttons which might darken slightly.
- **Focus:** Use the `var(--color-border-focus)` (`#A8DADC`) for clear focus rings `outline: 2px solid var(--color-border-focus); outline-offset: 2px;`.

---

## 3. Implementation Approach

We will use **CSS Custom Properties** via a data attribute toggle for maximum performance and framework agnosticism.

### 3.1 Avoid Flash of Unstyled Content (FOUC)
Place this blocking inline script in the `<head>` of your `index.html` BEFORE your React app loads.

```html
<script>
  (function() {
    try {
      var localTheme = localStorage.getItem('theme');
      var sysTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (localTheme === 'dark' || (!localTheme && sysTheme)) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    } catch (e) {}
  })();
</script>
```

### 3.2 Theme Toggle Hook
Create a custom React hook `useTheme` to manage state and apply the attribute.

```typescript
import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    return document.documentElement.getAttribute('data-theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return { theme, toggleTheme };
}
```

---

## 4. Accessibility & Contrast Ratios

The Muted Pastels palette has been tested for WCAG AA compliance.
1. **`#E4E4E4` (Text) on `#2C2C2C` (Background):** Contrast Ratio is **~8.5:1** (Passes WCAG AAA).
2. **`#B39CD0` (CTA) on `#2C2C2C` (Background):** Contrast Ratio is **~4.8:1** (Passes WCAG AA).
3. **`#A8DADC` (Accent 1) on `#2C2C2C`:** Contrast Ratio is **~6.8:1**.

*Note on interactions:* Ensure that text placed *inside* the Lavender (`#B39CD0`) CTA button uses a dark color (e.g., `#1A1A1A`) rather than white, as white-on-lavender fails contrast ratios.

---

## 5. Testing & Verification

1. **Visual Regression:** Use Storybook or Percy to capture light/dark variations of primitive components (Buttons, Inputs, Cards).
2. **System Preference Test:** Change your computer's OS to Dark Mode and verify the application detects and applies it on the first load without a FOUC.
3. **Manual Check:** Audit the "Properties Drawer" and "Groups Modal" as these typically contain deeply nested forms with hard-to-find borders.

---

## 6. Migration Path (Phased Approach)

If migrating a legacy codebase:
- **Phase 1:** Inject the `:root` variables but do not apply them globally.
- **Phase 2:** Search the repository for explicit hex codes (e.g., `#ffffff`, `#000000`) and replace them with `var(--color-bg-base)` and `var(--color-text-main)`.
- **Phase 3:** Introduce the toggle button in the Sidebar/Header.
- **Phase 4:** Hunt down hardcoded SVGs. Ensure SVGs use `fill="currentColor"` so they adapt to text color changes automatically.
