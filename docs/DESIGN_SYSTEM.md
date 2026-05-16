# Rehearsal — Design System

**Mood:** "The dressing room before going on stage." Premium, serious, slightly cinematic.

**References (spirit only):** Linear, Arc Browser, Vercel, Things 3, editorial magazines.

**Avoid:** Purple-blue gradients, glowing buttons, robot/sparkle icons, blob backgrounds, Inter font, default shadcn blue accent.

---

## Theme

- **Primary:** Dark mode  
- **Secondary:** Light mode toggle available  

---

## Colors (Dark Mode)

| Token | Hex | Usage |
|-------|-----|--------|
| `--background` | `#0A0A0B` | Page bg |
| `--surface` | `#141416` | Cards |
| `--surface-elevated` | `#1C1C1F` | Modals |
| `--border-subtle` | `#26262A` | Dividers |
| `--border-default` | `#33333A` | Inputs |
| `--text-primary` | `#F5F4F1` | Headlines |
| `--text-secondary` | `#A8A6A0` | Body |
| `--text-tertiary` | `#6E6C66` | Meta |
| `--accent` | `#E8A33D` | Amber stage-light |
| `--success` | `#7B9B5E` | Sage |
| `--critical` | `#C84F3D` | Terracotta |
| `--highlight-glow` | `rgba(232,163,61,0.08)` | Session iframe glow |

---

## Typography

Load in `app/layout.tsx`:

- **Fraunces** (400, 600) — headlines, scores, executive summary  
- **Geist Sans** (400, 500, 600) — UI body  
- **Geist Mono** (400) — captions, timestamps  

| Scale | Size / Line / Tracking |
|-------|------------------------|
| Display 1 | 64px / 1.05 / -2% |
| Display 2 | 48px / 1.1 / -1.5% |
| H1 | 32px / 1.2 / -1% |
| H2 | 24px / 1.3 / -0.5% |
| H3 | 18px / 1.4 |
| Body Large | 17px / 1.6 |
| Body | 15px / 1.55 |
| Small | 13px / 1.5 |
| Caption | 11px / 1.4 / +5% uppercase mono |

---

## Layout

- Base unit: 8px (multiples of 4px)  
- Max content: 1280px (app)  
- Sidebar: 240px fixed  
- Card padding: 16px default, 24px elevated  
- Modal: 32px padding; max-width 560px (720px avatar brief)  

---

## Components

- **Icons:** Lucide only, stroke 1.5px, sizes 16/20/24  
- **Active nav:** 3px amber left border  
- **Score gauges:** animate 0 → value over 800ms  
- **Motion:** 180ms ease-out standard; 320ms slow reveal  

---

## Key Screens

### Feedback Report (highest polish)
- Amber-tinted hero band, Display 1 scores, circular gauges  
- Sections: Executive Summary, What Worked (sage border), What to Improve (terracotta), Missed Signals, Delivery 2×2 grid, Transcript (collapsed default)  

### Live Session
- 16:9 iframe, max-width 960px, amber edge glow  
- Timer pulses amber in last 60 seconds  

### Target Builder
- `PersonalityProfileCard` with communication chips, citations, confidence graphic  
