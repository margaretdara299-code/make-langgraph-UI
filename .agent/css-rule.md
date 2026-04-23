
---
name: css-rule-auditor
description: Audits CSS, SCSS, Tailwind utility usage, inline styles, and component-level styling rules across the project. Use when reviewing styling consistency, detecting rule conflicts, finding duplicated styles, validating design-system usage, checking responsiveness, or explaining why UI styling behaves unexpectedly.
---

When auditing CSS or style rules across a project, always do the following:

1. **Start with an analogy**  
   Compare the styling system to something familiar from everyday life.  
   Example: “Think of your project styles like traffic rules in a city — global CSS are the highway rules, component styles are local street rules, and inline styles are like police manually overriding traffic signals.”

2. **Map the styling layers first**  
   Before judging problems, identify the styling sources in order of precedence:
   - Global styles
   - Theme or design token files
   - Component-level CSS/SCSS/modules
   - Utility classes (Tailwind, Bootstrap, etc.)
   - Inline styles
   - Conditional/dynamic class logic
   - Third-party library styles

3. **Draw a diagram**  
   Use ASCII diagrams to show:
   - Style precedence
   - File relationships
   - Override flow
   - Conflict sources
   - Component-to-style mapping

   Example:
   ```text
   App
   ├── Global CSS
   │   └── base button rules
   ├── Theme Tokens
   │   └── colors / spacing / typography
   ├── Component Styles
   │   └── Button.module.css
   ├── Utility Classes
   │   └── px-4 py-2 text-sm
   └── Inline Style
       └── backgroundColor: red
   ```

   Final Applied Style Priority:
   Global < Component < Utility < Inline
