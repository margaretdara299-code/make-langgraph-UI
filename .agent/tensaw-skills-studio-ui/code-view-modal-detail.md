# Code View Modal Detail Document

> Purpose: define how the existing code/data viewing modal should look if redesigned with a VS Code-inspired visual language, while keeping the same functionality and interaction flow.

---

## 1. Main Related Files

Primary existing modal candidates:
- [src/components/CodeViewerModal/CodeViewerModal.tsx](file:///c:/Users/mohnish/Documents/Roshan/UI/tensaw-skills-studio-ui-v1/src/components/CodeViewerModal/CodeViewerModal.tsx)
- [src/components/CodeViewerModal/CodeViewerModal.css](file:///c:/Users/mohnish/Documents/Roshan/UI/tensaw-skills-studio-ui-v1/src/components/CodeViewerModal/CodeViewerModal.css)
- [src/components/TestApiModal/TestApiModal.tsx](file:///c:/Users/mohnish/Documents/Roshan/UI/tensaw-skills-studio-ui-v1/src/components/TestApiModal/TestApiModal.tsx)
- [src/components/TestApiModal/TestApiModal.css](file:///c:/Users/mohnish/Documents/Roshan/UI/tensaw-skills-studio-ui-v1/src/components/TestApiModal/TestApiModal.css)

Related code-style content reference:
- [src/components/CreateActionModal/CreateActionReviewStep.tsx](file:///c:/Users/mohnish/Documents/Roshan/UI/tensaw-skills-studio-ui-v1/src/components/CreateActionModal/CreateActionReviewStep.tsx)

Global tokens:
- [src/index.css](file:///c:/Users/mohnish/Documents/Roshan/UI/tensaw-skills-studio-ui-v1/src/index.css)
- [src/App.css](file:///c:/Users/mohnish/Documents/Roshan/UI/tensaw-skills-studio-ui-v1/src/App.css)

---

## 2. Main Rule

Keep the code-view modal behavior exactly the same.

Do not change:
- modal purpose
- open/close behavior
- tabs behavior
- displayed data
- request/response meaning
- JSON/content rendering logic
- status/time information meaning

Only change:
- visual design
- layout polish
- typography
- spacing
- tab styling
- panel styling
- scroll area styling
- code presentation styling
- VS Code-inspired visual treatment

---

## 3. What This Modal Should Feel Like

The modal should feel inspired by:
- VS Code editor panels
- developer tools
- professional code viewers

It should not feel like:
- a generic form modal
- a marketing popup
- a bright card with dark code pasted inside

The experience should feel:
- technical
- crisp
- editor-like
- structured
- developer-friendly

---

## 4. Overall Modal Structure

The modal should keep this structure:

1. Modal shell
2. Header
3. Metadata area
4. Tabs
5. Code/content viewport

For the current response-details style modal, this means:
- title at top
- status and time metadata near top
- tabs like `Body` and `Headers`
- large code viewing region below

This structure should stay the same.

---

## 5. Modal Shell UI

Current modal behavior comes from:
- Ant Design `Modal`
- optional shared modal patterns in [CodeViewerModal.css](file:///c:/Users/mohnish/Documents/Roshan/UI/tensaw-skills-studio-ui-v1/src/components/CodeViewerModal/CodeViewerModal.css)

### VS Code-inspired shell direction

The outer modal should feel like:
- a focused editor workspace
- dark primary surface
- strong internal section separation
- clean rectangular precision with softened corners

Recommended shell character:
- dark slate/navy editor surface
- subtle border
- moderate shadow
- less “glass” and more “editor panel”
- cleaner, tighter chrome

### Shape

The modal should:
- keep a strong clean rectangle
- use medium radius, not overly soft radius
- look more like an IDE panel than a consumer modal

---

## 6. Header Detail

### Header contents

The header should contain:
- modal title
- optional close action
- metadata support area if needed

### Visual feel

The header should feel like:
- an editor titlebar
- compact
- aligned
- quiet but clear

Title should be:
- slightly strong
- not oversized
- left aligned

The close button should:
- stay minimal
- feel tool-like
- match editor chrome better than rounded consumer-style buttons

### VS Code inspiration

Think:
- titlebar precision
- clean spacing
- no large hero typography
- subtle contrast between chrome and content region

---

## 7. Metadata Bar Detail

In the current modal, metadata includes:
- status
- latency/time

This should become a compact utility bar under or beside the header.

Visual style should feel like:
- editor metadata
- small chips or inline utility labels
- developer-console-like

Status should:
- remain semantic
- be visible at a glance
- not dominate the modal

Time should:
- look secondary
- align with the rest of the metadata row

---

## 8. Tabs Detail

Current tabs:
- `Body`
- `Headers`

### VS Code-inspired direction

Tabs should feel like editor tabs, not large app tabs.

That means:
- compact height
- strong top-level clarity
- dark tab strip
- active tab clearly separated
- inactive tabs quieter

### Tab behavior

Do not change behavior.

Only redesign:
- spacing
- active state
- inactive state
- divider/border treatment
- typography

### Desired feel

Tabs should feel:
- crisp
- technical
- pane-oriented
- integrated into the code viewer

---

## 9. Code Viewport Detail

This is the most important area.

The content panel should feel like a code editor window.

### Code area should include this visual feeling

- dark editor background
- monospace typography
- tighter line rhythm
- proper inner padding
- subtle border or inset framing
- comfortable scroll behavior

### Current content behavior

The current modal already renders JSON/text inside `pre` blocks.

That should remain.

The redesign should make it feel closer to:
- VS Code editor pane
- response inspector
- structured JSON viewer

### Recommended visual characteristics

- deep dark background
- cooler editor tones
- content contrast optimized for reading code
- inner top bar or file-tab feel optional
- long content area should feel stable and scrollable

### Important rule

Do not make the code area feel like a generic dark card.

It should feel like:
- an editor surface
- a proper code panel
- a developer inspection tool

---

## 10. Typography Detail

### Header typography

Use:
- clean product sans for chrome/title

### Code typography

Use:
- a proper monospace stack

Recommended feel:
- compact
- readable
- editor-like

Suggested mono direction:
- `JetBrains Mono`
- `Consolas`
- `SFMono-Regular`
- `Menlo`
- monospace fallback

### Text hierarchy

- modal title: small-strong
- metadata labels: small-medium
- tabs: compact-medium
- code content: small monospace

Avoid:
- large modal headings
- inconsistent font families
- loose line-height that wastes vertical space

---

## 11. Spacing Detail

The modal should use:
- compact titlebar spacing
- clear separation between header, metadata, tabs, and code region
- strong inner code padding
- consistent edge spacing

Spacing should feel:
- editor-tight
- intentional
- not cramped

The code viewport should dominate the modal height.

---

## 12. Color Detail

### VS Code-inspired palette direction

The modal should use:
- dark editor background
- slightly lighter panel/header strip
- muted inactive chrome
- subtle border lines
- semantic green/orange/red for status only
- readable code text color

Think in layers:
- outer modal shell
- title/tab chrome
- editor/content surface
- accent/status highlights

### Avoid

- bright white modal chrome with dark editor block dropped inside
- too many accent colors
- neon/glowy IDE imitation

The result should feel:
- restrained
- modern
- credible

---

## 13. Scrollbar Detail

The code area scrollbar should feel:
- thin
- subtle
- editor-like

It should not:
- distract
- look default-browser-heavy

The existing scrollbar styling in [TestApiModal.css](file:///c:/Users/mohnish/Documents/Roshan/UI/tensaw-skills-studio-ui-v1/src/components/TestApiModal/TestApiModal.css) can be refined toward a darker, editor-style treatment.

---

## 14. Optional VS Code-Inspired Elements

These can be used if kept subtle:
- tab strip look
- file/status chips
- top editor toolbar line
- line-number gutter feel
- small language chip like `JSON`

Use carefully.

Do not turn the modal into a fake code editor with unnecessary controls.

It should still be:
- a viewer
- not a full IDE

---

## 15. Motion Detail

The modal should animate like a professional tool panel:
- short
- crisp
- low-drama

Good motion:
- fade + very small scale/translate
- subtle tab transitions
- no long delays

Avoid:
- bouncy motion
- soft consumer-modal animation
- playful staging

The modal should feel sharp and immediate.

---

## 16. Exact “Same UI” Meaning

If you redesign this modal using this file, it should still clearly be:
- the same code/data viewing modal
- the same title and metadata concept
- the same `Body` / `Headers` tab concept
- the same code/text viewing purpose
- the same close and open behavior

You can improve:
- shell styling
- tab strip styling
- code viewport styling
- typography
- spacing
- metadata presentation

You should not change:
- what the modal does
- what content it shows
- how the tabs function

---

## 17. Prompt-Ready Summary

Use this instruction:

“Redesign the existing code/data view modal with a VS Code-inspired UI, using `docs/code-view-modal-detail.md` as the reference. Keep the exact same modal behavior, same tabs, same content, same JSON/text rendering purpose, and same open/close logic. Improve only the visual design quality, dark editor-style shell, tab strip styling, code viewport styling, spacing, typography, metadata presentation, and overall developer-tool feel.”

