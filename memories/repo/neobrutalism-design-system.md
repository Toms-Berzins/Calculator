# QuoteCalc — Soft Industrial Neobrutalism Design System

Authoritative reference for all UI/CSS decisions. Load this file before any architectural or review work that touches components, pages, or CSS.

---

## Design Dialect

**"Soft Industrial Neobrutalism"** — hard geometric edges, flat offset shadows, monospace type, and a muted industrial palette. No organic shapes, no blurred shadows, no rounded corners beyond 2px.

---

## Hard Rules (Never Violate)

| Rule | Value |
|---|---|
| Max `border-radius` | `2px` — applies everywhere. Never use `rounded-*` Tailwind on any UI element. |
| Shadows | Always `Npx Npx 0 <color>` — hard flat offset. No `blur`, no `glow`, no `filter: drop-shadow`. |
| Typography | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` everywhere for UI text. Body copy uses system-sans. |
| Shadow/border color | `--nb-ink` only — never `--text-strong` for structural shadows. |
| Button internals | Never override `.btn-primary` / `.btn-secondary` `font-size`, `font-weight`, `display`, or `align-items` with Tailwind — Tailwind `@layer utilities` wins silently. |
| Styling approach | CSS Modules own all visual styles for components and pages. Tailwind only for structural layout containers (`flex`, `grid`, `gap`, `overflow-*`, `max-w-*`). Never mix Tailwind into elements that already carry a module class. |

---

## CSS Custom Properties

### Light Mode (`:root`)

```css
/* Backgrounds */
--bg-base:    #f5f5f5;   /* Subfloor matte white */
--bg-surface: #ffffff;
--bg-muted:   #e0e0e0;

/* Borders */
--border:       #bdbdbd;
--border-muted: #e0e0e0;

/* Text */
--text-strong:  #1b1b1b;
--text-default: #353636;
--text-muted:   #5e5e5e;
--text-faint:   #6b6b6b;   /* min 4.5:1 on white */

/* Accent */
--accent:       #3255e3;
--accent-hover: #1e3bb3;
--accent-muted: rgba(50, 85, 227, 0.1);
--accent-text:  #3255e3;
--warning:      #feba50;

/* Price accent */
--price-accent:    #e85500;
--price-accent-bg: rgba(232, 85, 0, 0.08);
--price-accent-bd: rgba(232, 85, 0, 0.2);

/* Neobrutalism ink */
--nb-ink:       #1b1b1b;   /* Near-black — use for borders & offset shadows */
--nb-ink-hover: #000000;

/* Shadows */
--shadow-card:  3px 3px 0 #bdbdbd;
--shadow-hover: 5px 5px 0 #a3a3a3;
--shadow-glass: 4px 4px 0 #d4d4d4;

/* Status */
--status-draft-bg:      #e0e0e0;    --status-draft-text:    #353636;
--status-sent-bg:       #eaeefc;    --status-sent-text:     #3255e3;
--status-accepted-bg:   #deeede;    --status-accepted-text: #1b5e20;
--status-rejected-bg:   #fbeaec;    --status-rejected-text: #b02a37;

/* Sidebar */
--sidebar-bg:     #f0f0f0;
--sidebar-border: #bdbdbd;
```

### Dark Mode (`@media (prefers-color-scheme: dark)`)

```css
--bg-base:    #161616;
--bg-surface: #1e1e1e;
--bg-muted:   #2a2a2a;
--border:       rgba(255,255,255,0.12);
--border-muted: rgba(255,255,255,0.06);
--text-strong:  #ffffff;
--text-default: rgba(255,255,255,0.65);
--text-muted:   rgba(255,255,255,0.4);
--text-faint:   rgba(255,255,255,0.18);
--accent:       #4a6cf0;
--accent-hover: #5d7df2;
--accent-muted: rgba(74, 108, 240, 0.15);
--accent-text:  #7591f4;
--warning:      #fccb6c;
/* Shadows go near-black offset — no white shadows */
--shadow-card:  3px 3px 0 rgba(0,0,0,0.8);
--shadow-hover: 5px 5px 0 rgba(0,0,0,0.9);
--shadow-glass: 4px 4px 0 rgba(0,0,0,0.7);
/* nb-ink becomes ghost ring in dark mode */
--nb-ink:       rgba(255,255,255,0.18);
--nb-ink-hover: rgba(255,255,255,0.28);
```

**Dark mode stat cards** use accent-coloured shadows (not white), e.g. `3px 3px 0 var(--stat-accent)`. This is the canonical dark neobrutalism technique.

---

## Global Classes (defined in `globals.css`)

| Class | Purpose |
|---|---|
| `.btn-primary` | Near-black stamped button. Dark mode: inverted to light. |
| `.btn-secondary` | Surface-bg button with border shadow. |
| `.btn-ghost` | Ghost variant — `--nb-ink` border + 2px offset shadow. |
| `.card-interactive` | Clickable card — lifts on hover. |
| `.status-badge` | Inline status chip — `border-radius: 2px`, uppercase, monospace. |
| `.input-field` | Monospace input — inset shadow, hard focus offset `3px 3px 0 var(--border)`. |
| `.link-muted` | Muted text → accent on hover. |
| `.nav-item` | Legacy global nav item (sidebar now uses CSS module). |
| `.glass` | Header blur — backdrop-filter only on nav/header. Never decorative. |
| `.grid-bg` | 24px grid background for auth + app layouts. |

---

## Interaction Affordance Rules

### Interactive elements (buttons, links, clickable cards)
```
hover:  transform: translate(-1px, -1px)  +  shadow deepens
active: transform: translate(3px, 3px)   +  shadow → 0
```

### Display-only stat cards (not clickable)
```
hover:  opacity: 0.85 only — NO translate (translate implies clickability)
```

### Collapsible "add new" forms
Use native `<details>/<summary>` — never a modal, drawer, or JS toggle.

---

## Page Layout Invariant

All pages in `src/app/(app)/` must follow this structure:

```
shell
└── pageHeader        (title + optional CTA only — no stats nested here)
└── feedbackBanner    (success/error — conditional)
└── statsStrip        (sibling to header, not nested inside it)
└── createDetails     (collapsible <details> form)
└── list / tableWrap  (main content)
```

**Stats are siblings of the header, never nested inside it.**

---

## Typography Scale

| Use | Size | Weight | Family | Transform |
|---|---|---|---|---|
| Page title | `1.375rem` | 900 | monospace | uppercase |
| Page subtitle | `0.6875rem` | 600 | monospace | uppercase, `letter-spacing: 0.12em` |
| Stat value | `1.375rem` | 900 | monospace | — |
| Stat label | `0.6875rem` | 700 | monospace | uppercase, `letter-spacing: 0.1em` |
| Button / badge | `0.8125rem` | 700 | monospace | uppercase, `letter-spacing: 0.06em` |
| Row title | `0.9375rem` | 600 | — | — |
| Small label / fieldLabel | `0.6875rem` | 700 | monospace | uppercase |
| Action link / sort btn | `0.6875rem`–`0.8125rem` | 700 | monospace | uppercase |

---

## Component Patterns

### Stat cards (page strip)
```css
border: 2px solid var(--nb-ink);
border-radius: 0;
box-shadow: 3px 3px 0 var(--nb-ink);
/* dark mode: box-shadow: 3px 3px 0 var(--stat-accent) */
```
Hover lifts `translate(-1px,-1px)` + shadow grows. Active stamps `translate(2px,2px)`.

### Status badge
```css
border-radius: 2px;
font-weight: 700; font-size: 0.625rem;
text-transform: uppercase; letter-spacing: 0.06em;
padding: 0.2rem 0.5rem;
```
Use `--status-*-bg` / `--status-*-text` pairs. Never hardcode colors.

### Table rows
Left-border stripe indicates status: `border-left: 4px solid <status-color>`. Hover background `var(--bg-muted)`.

### Delete button
`border: 1.5px solid var(--status-rejected-text)` + `background: var(--status-rejected-bg)` + `2px 2px 0 var(--status-rejected-text)` shadow.

### Modal / dialog
`border-radius: 2px`, `border: 1.5px solid var(--border)`, `box-shadow: var(--shadow-hover)`. Backdrop: `color-mix(in srgb, var(--text-strong) 28%, transparent)`.

---

## Accessibility Conventions

- Stat strips: `role="group" aria-label={sectionTitle}`
- SVG icons: `aria-hidden="true"`
- Focus ring: `outline: 2px solid var(--accent); outline-offset: 2px` — never removed, only restyled
- `:focus-visible` is globally defined in `globals.css`

---

## Transition Timing

All interactive elements use:
```css
transition-duration: 120ms;
transition-timing-function: cubic-bezier(0.25, 0, 0.6, 1); /* Aggressive deceleration — snaps into place */
```
No `ease-in-out`. No `300ms`. The snap is intentional — mechanical, not organic.
