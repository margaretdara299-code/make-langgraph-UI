# Header Detail Document

> Purpose: explain exactly how the main app header should look, how it is structured, and which files control it, so design changes can preserve the same UI behavior and only refine styling.

---

## 1. Main Header Files

Core component:
- [src/components/Header.tsx](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/components/Header.tsx)

Main CSS:
- [src/components/Header.css](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/components/Header.css)

Related shell CSS:
- [src/App.css](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/App.css)

Global tokens:
- [src/index.css](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/index.css)

Related layout files:
- [src/components/DashboardLayout.tsx](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/components/DashboardLayout.tsx)
- [src/App.tsx](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/App.tsx)

---

## 2. Header Structure

From [src/components/Header.tsx](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/components/Header.tsx), the header is intentionally simple.

It contains:
- a single horizontal bar
- breadcrumb navigation inside the left section

This is not a large toolbar header.

It is a:
- context header
- navigation support element
- lightweight top chrome

The structure should remain the same.

---

## 3. Overall Header Look

The header should feel:
- light
- clean
- subtle
- premium
- secondary to page content

The current visual language is:
- translucent white background
- blur effect
- thin bottom border
- compact breadcrumb styling

Relevant CSS selectors in [src/components/Header.css](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/components/Header.css):
- `.dashboard-header`
- `.header-meta`
- `.dashboard-header .ant-breadcrumb`
- `.dashboard-header .ant-breadcrumb .anticon`

---

## 4. Header Surface UI

### Surface feel

The header surface is not fully flat and not fully solid.

It uses:
- semi-transparent white
- light backdrop blur
- thin divider line at the bottom

This makes it feel:
- modern
- airy
- integrated into the dashboard shell

### Visual role

The header should help orientation without pulling too much attention away from the page itself.

That means:
- no oversized shadows
- no loud gradients
- no heavy control groups unless intentionally added later

---

## 5. Header Height and Spacing

Relevant CSS in [src/components/Header.css](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/components/Header.css):
- `.dashboard-header`

Current layout cues:
- `64px` height
- horizontal padding around `32px`
- vertical centering

Design meaning:
- slim but comfortable
- aligns well with the sidebar shell
- leaves strong focus for content below

The header should not become:
- too tall
- too dense
- too decorative

---

## 6. Breadcrumb UI

From [src/components/Header.tsx](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/components/Header.tsx), the breadcrumb is the main content of the header.

It currently shows:
- home icon + Home
- current page title

### Breadcrumb look

The breadcrumb should feel:
- compact
- readable
- medium weight
- subtle but clear

### Home icon

The home icon should:
- stay small
- align with text cleanly
- not dominate the breadcrumb

### Current page

The current page label should:
- feel slightly stronger than the parent crumb
- remain simple and not oversized

This keeps the breadcrumb useful without turning it into a page hero.

---

## 7. Alignment Rules

The header content should align cleanly with the page content below.

This means:
- same horizontal rhythm as the content viewport
- breadcrumb should not feel detached from the page body
- left alignment should be visually stable across pages

The header should visually “belong” to the shell, not float independently.

---

## 8. Typography for Header

Relevant tokens:
- [src/index.css](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/index.css)

Use:
- `Inter`

Header typography should be:
- compact
- clean
- medium-weight
- easy to scan quickly

Recommended feel:
- breadcrumb text: medium
- current page text: slightly stronger
- icon size kept small and neat

Avoid:
- oversized headings in the header bar
- display typography styles
- multiple font treatments

---

## 9. Color Rules

Relevant tokens from [src/index.css](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/index.css):
- `--bg-card`
- `--glass-bg`
- `--glass-blur`
- `--text-main`
- `--text-muted`
- `--border-light`

The header should use:
- soft bright surface
- subtle border
- darker current page text
- muted parent breadcrumb text

The color contrast should be:
- gentle
- readable
- not overly dramatic

---

## 10. Motion and Interaction

The main app header is not highly interactive.

Motion should stay minimal:
- no dramatic entrance animation
- no heavy hover systems
- soft shell consistency only

If breadcrumb items are hoverable, the hover should remain:
- subtle
- color-based
- clean

---

## 11. Exact “Same UI” Meaning

If you redesign the header using this file, it should still clearly be:
- the same top shell header
- the same slim bar
- the same breadcrumb-first structure
- the same light translucent treatment

You can improve:
- spacing
- typography precision
- alignment
- border and blur polish
- token consistency

You should not change:
- the basic header position
- the breadcrumb role
- the lightweight nature of the header

---

## 12. Header vs Builder Header

Important:
- this file is for the standard app header only
- the workflow builder uses a different dedicated header

Do not apply this document to the builder header.

For builder-specific header design, use:
- [workflow-builder-detail.md](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/docs/workflow-builder-detail.md)

---

## 13. Quick Prompt

Use this prompt:

“Redesign only the standard app header UI using `docs/header-detail.md` as the reference. Keep the exact same slim breadcrumb-based header structure, same placement, same role in the layout, and same lightweight shell behavior. Improve only the visual design quality, spacing, typography consistency, blur/surface polish, and alignment.”

