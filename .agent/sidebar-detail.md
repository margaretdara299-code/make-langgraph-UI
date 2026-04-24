# Sidebar Detail Document

> Purpose: explain exactly how the sidebar UI should look and which files control it, so design changes can keep the same behavior and only refine the presentation.

---

## 1. Main Sidebar Files

Core component:
- [src/components/Sidebar.tsx](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/components/Sidebar.tsx)

Main CSS:
- [src/App.css](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/App.css)

Global tokens:
- [src/index.css](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/index.css)

Related shell layout:
- [src/components/DashboardLayout.tsx](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/components/DashboardLayout.tsx)
- [src/App.tsx](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/App.tsx)

---

## 2. Sidebar Structure

The sidebar has 3 visual sections:

1. Brand section
2. Navigation links
3. User section

From [src/components/Sidebar.tsx](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/components/Sidebar.tsx), the structure is:
- top logo + brand name + collapse toggle
- middle nav items
- bottom user info and logout

This structure should stay the same.

---

## 3. Overall Sidebar Look

The sidebar should feel:
- clean
- light
- compact
- professional
- utility-first

The current visual language is:
- white background
- thin right border
- rounded interactive elements inside
- soft hover fills
- indigo active state

Main CSS area in [src/App.css](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/App.css):
- `.main-sidebar`
- `.main-sidebar.collapsed`

What it does:
- fixed left column feel
- full-height layout
- vertical flex container
- smooth width transition when collapsed

---

## 4. Sidebar Width and Spacing

Relevant CSS in [src/index.css](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/index.css):
- `--sidebar-w: 220px;`

Relevant CSS in [src/App.css](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/App.css):
- `.main-sidebar`
- `.main-sidebar.collapsed`

Current behavior:
- expanded width uses the sidebar token
- collapsed width becomes `72px`
- padding becomes tighter in collapsed mode

Design meaning:
- expanded mode should feel comfortable, not oversized
- collapsed mode should still feel neat and centered

---

## 5. Brand Section UI

Relevant CSS selectors in [src/App.css](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/App.css):
- `.brand-section`
- `.brand-logo-container`
- `.brand-logo-img`
- `.brand-name`

### Brand layout

The brand area includes:
- logo tile
- product name
- floating collapse toggle

### Logo tile look

The logo sits inside a small rounded square.

It should feel:
- crisp
- compact
- slightly elevated
- branded but not oversized

Visual cues:
- white tile
- rounded corners
- subtle border
- subtle shadow

### Brand name look

The brand text should be:
- bold
- compact
- horizontally aligned with the logo
- visible only in expanded mode

It should not:
- use oversized display typography
- push the layout too wide

---

## 6. Collapse Toggle UI

Relevant CSS in [src/App.css](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/App.css):
- `.sidebar-toggle`
- `.sidebar-toggle:hover`
- `.main-sidebar.collapsed .sidebar-toggle`

Current behavior:
- small circular button
- positioned partly outside the sidebar edge
- rotates when sidebar collapses

Design feel:
- precise
- tool-like
- subtle but visible

This button should:
- remain easy to discover
- not become too large
- not dominate the brand area

---

## 7. Navigation Links UI

Relevant CSS in [src/App.css](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/App.css):
- `.nav-links`
- `.nav-link`
- `.nav-link:hover`
- `.nav-link.active`
- `.nav-link svg`
- `.main-sidebar.collapsed .nav-link`

### Link structure

Each nav item contains:
- icon
- label text

### Visual style

Nav links should be:
- horizontal rows in expanded mode
- icon-centered in collapsed mode
- moderately rounded
- medium weight
- easy to scan

### Hover state

Hover should:
- add a soft background
- slightly emphasize the text/icon
- use very small motion only

### Active state

Active link should:
- use the accent color
- have a soft tinted background
- feel clearly selected
- remain consistent with the rest of the design system

### Collapsed state

Collapsed nav should:
- center icons
- remove labels cleanly
- preserve vertical rhythm
- still feel balanced, not cramped

---

## 8. User Section UI

Relevant CSS in [src/App.css](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/App.css):
- `.sidebar-user-section`
- `.user-info-row`
- `.user-avatar-small`
- `.user-details`
- `.user-name`
- `.user-badge`
- `.minimal-logout-btn`

### User block structure

The bottom section contains:
- avatar
- user name
- PRO badge
- logout action

### Visual style

This area should feel:
- secondary
- tidy
- lightly interactive

The avatar:
- small square tile
- dark background
- strong initials

The name block:
- compact
- stacked
- clean

The logout:
- subtle by default
- stronger on hover

### Collapsed mode

Collapsed mode should:
- center the avatar
- hide extra text
- keep the bottom section clean and uncluttered

---

## 9. Typography for Sidebar

Relevant token file:
- [src/index.css](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/index.css)

Use:
- `Inter`

Hierarchy:
- brand name: strong bold
- nav links: medium weight
- active nav: slightly stronger
- user name: semi-bold
- badge/meta: very small uppercase accent style

Sidebar typography should feel:
- compact
- readable
- crisp
- enterprise-friendly

---

## 10. Color and Surface Rules

Relevant global tokens in [src/index.css](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/index.css):
- `--bg-sidebar`
- `--bg-card`
- `--text-main`
- `--text-muted`
- `--accent`
- `--accent-soft`
- `--border-light`
- `--border-medium`

Sidebar should use:
- white main surface
- dark primary text
- muted inactive link color
- accent tint for active state
- light border separation

Avoid:
- multiple accent colors in nav
- dark heavy backgrounds unless doing a full system redesign
- strong shadows on every item

---

## 11. Motion and Interaction

Relevant CSS in [src/App.css](c:/Users/mohnish/Documents/Roshan/Enhace-UI/enhance%20ui/src/App.css):
- sidebar width transition
- nav hover transition
- brand reveal animation
- toggle rotation

Sidebar motion should be:
- short
- smooth
- controlled

Good motion to keep:
- collapse width animation
- slight nav hover shift
- small label fade/slide

Avoid:
- long delays
- strong bounce
- dramatic nav motion

---

## 12. Exact “Same UI” Meaning

If you redesign the sidebar using this file, it should still clearly be:
- the same left navigation rail
- the same brand area at top
- the same collapse control
- the same nav item structure
- the same user area at bottom

You can improve:
- spacing
- polish
- alignment
- token consistency
- hover quality

You should not change:
- where things are placed
- what each element means
- how collapse works

---

## 13. Quick Prompt

Use this prompt:

“Redesign only the sidebar UI using `docs/sidebar-detail.md` as the reference. Keep the exact same sidebar structure, same brand block, same collapse button, same nav flow, same user section, and same collapse behavior. Improve only the visual design quality, spacing, typography consistency, hover states, and motion polish. Use the existing CSS/token files as the source of truth.”

