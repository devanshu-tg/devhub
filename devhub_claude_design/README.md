# Handoff: TigerGraph DevHub

## Overview

TigerGraph **DevHub** is a unified developer + learner portal for TigerGraph. It brings together everything a developer needs — learning resources, an AI chat tutor, personalized learning paths, a community forum, events/hackathons, and a project showcase — into one warm, editorial-feeling web app.

This handoff contains the HTML/JSX prototype of the **warm paper / editorial direction** (internally called *Variation B*) across 10 screens.

## About the Design Files

The files in this bundle are **design references created in HTML/JSX** — fast prototypes showing intended look, layout, copy, and interactions. They are not production code.

Your job is to **recreate these designs in the target codebase's environment** using its established patterns, component library, and conventions. If no environment is established yet, use **Next.js (App Router) + Tailwind CSS + shadcn/ui** as the recommended stack — the design tokens below map cleanly to a Tailwind theme.

Do not copy the inline-style approach used in the prototypes. Lift the *visual* decisions (tokens, layout, type treatment) and re-express them as idiomatic components in the target stack.

## Fidelity

**High-fidelity.** Colors, typography, spacing, layout proportions, and copy are all final. Recreate pixel-for-pixel where reasonable. The prototype is the source of truth for visual decisions; this README is the source of truth for why.

## Design Language — the visual system

The design is **editorial, warm, and literary** — not your typical dev-tool chrome. It should feel like a thoughtful publication that happens to be about graphs.

Four consistent ingredients across every page:

1. **Mono kickers.** Every section starts with a `/ SECTION NAME` in Geist Mono, uppercase, 2px letter-spacing, TG-orange color. These are the navigational anchors of the page.
2. **Serif italic accents.** Big sans-serif headlines have one phrase swapped to *Instrument Serif italic* — "Master TigerGraph *faster* than ever", "in one *wall*", "48 hours in *photos*". One italic per headline, never two.
3. **Graph motif.** A subtle, very low-contrast node-and-edge SVG pattern sits behind hero sections. Tweakable density. Never decorative — always behind real content.
4. **Cream card + orange accent.** Active/selected states use the cream background (`--cream`) with an orange border or left-indicator. Default cards use paper-white on bg.

Pages breathe. Generous padding (40–56px horizontal on hero rows, 28px card padding). Type scale is aggressive — 48–54px display, 30–32px section titles, 17px body.

## Screens / Views

### 1. Homepage (`VarB_Homepage`)

Marketing-ish landing for logged-out / new users. Hero with a forum-thread preview card layered inside it, stats strip, 3-feature grid, continue-learning rail.

- **Hero** — 54–60px display headline "Master TigerGraph *faster* than ever", italic on "faster". Left column has CTAs; right column shows a live-looking forum thread preview card. Subtle graph motif behind.
- **Stats strip** — 4 big serif-italic numbers (users, resources, hackathon projects, countries) across the page. Border top + bottom, cream fill.
- **Feature grid** — 3 large cards: Resource Wall, AI Chat, Pathfinder. Each: mono kicker, big title, 2-line description, small preview artwork.
- **New to TG banner** — inverted dark card with the graph motif, single CTA.

### 2. Resources (`VarB_Page_Resources`)

Unified wall of all learning materials. One grid, 6 filter pills by type + level filter.

- **Header** — `/ RESOURCES` kicker, big headline "Everything you need, *in one wall.*" Search input (pill with ⌘K) at right.
- **Filters** — Pill row: Everything (428), Videos (84), Courses (32), Tutorials (146), Docs (112), Blog posts (54). Active pill is black pill with white text. Each pill has an inline count in mono. Level filter at right: All / Beginner / Intermediate / Advanced.
- **Grid** — 3-column resource cards. Each card: 160px image placeholder with a mono type badge (VIDEO/COURSE/TUTORIAL/DOCS/BLOG) top-left and bookmark button top-right; below the image: 17px title, 13px 2-line description, bottom meta row (mono) with duration, accent-colored level, and author.
- **Load more** — Pill button centered at bottom.

### 3. AI Chat (`VarB_Page_AIChat`)

Two-mode AI assistant. Mode pill toggles the entire conversation.

- **Header** — Kicker + big headline "Your AI guide to *mastering* graphs." Subtitle explains both modes. User avatar + handle at top-right.
- **Mode pill** — Cream pill with two black-pill options: **Learning** (Compass icon) and **Q&A** (Sparkle icon). Right of the pill: inline description of the active mode in mono.
- **Conversation card** — Rounded card with status bar (dot + "LESSON · traversals · session 3 of 8" or "Q&A · new thread · no history saved"; model name right-aligned).
  - AI messages: 36px black bubble with orange Sparkle icon + freeform content (can include code blocks, quiz options, inline resource cards).
  - User messages: cream bubble right-aligned with user avatar.
  - **Code blocks** are black panels with GSQL keywords highlighted in TG orange.
  - **Quiz UI** (Learning mode): mono "QUICK CHECK · 1 of 3" label, question, 4 answer rows each with a circled letter (A/B/C/D).
  - **Resource recommendation card** (Q&A mode): cream inline card with book icon, mono "RECOMMENDED READING" kicker, title, arrow.
- **Composer** — Suggestion chips (dashed border), then rounded input with chat icon + send button (orange circle with arrow).
- **Mode comparison strip** — Two cards below explaining Learning vs Q&A. Active mode card has orange border + cream fill.

### 4. Pathfinder (`VarB_Page_Pathfinder`)

Short quiz (5 questions) that generates a personalized learning path.

- **Two-column layout** — Left: intro (kicker, big headline "Tell us what you're up to. We'll *build you a path.*", 3 feature bullets with circled icons). Right: quiz card.
- **Quiz card** — Floating card with soft shadow. Progress row: "QUESTION 2 OF 5" mono label, thin progress bar, "~2 min left". Big question with one italic phrase. 5 answer rows, each with circled mono letter (A–E), title, and one-line description. Selected row: cream fill + orange border + orange circled letter + check icon at right. Back / Next buttons at bottom.
- **Preview strip** — Cream section below showing "What you'll get" — 5 example path steps in a horizontal grid. Each step: huge serif-italic number (01–05), mono type label (VIDEO/TUTORIAL/COURSE/HANDS-ON), title, duration.

### 5. My Learning (`VarB_Page_MyLearning`)

User's saved content + active path.

- **Banner** — Graph-motif hero. Left: kicker + "Welcome back, *Priya.*" Right: 4 stats (completed / in progress / saved / time invested) as big serif-italic numbers.
- **Active path card** — `YOUR ACTIVE PATH` kicker, "Fraud detection *pathway.*" title. Inside card: progress bar + "2.6 of 5 steps · 52% · ~7h left". 5-column grid of step cards. Each step shows state: **done** (grey number + green check badge), **active** (orange number + orange play badge + cream fill + orange border + in-progress sub-bar), **todo** (faded).
- **Saved courses** — Section title "Saved *for later.*" Status tabs (All / In progress / Completed / Not started). 3-column card grid with image, type badge, title, author, and a progress bar — completed cards show green `✓ COMPLETED`, new cards show `NOT STARTED · START →`.

### 6. Events (`VarB_Page_Events`)

Tabs for Upcoming / Past / Hackathon projects / Blog. Upcoming list + past archive + hackathon winners grid.

### 7. Event Detail (`VarB_Page_EventDetail`)

Deep dive on one past event (KG Weekend '26 hackathon).

- **Cover** — Breadcrumb crumbs, status pill ("PAST · MAR 22–24, 2026 · HACKATHON"), 54px headline "Build-a-knowledge-graph *weekend.*", descriptive paragraph, 4 mono stat inlines, cover image on right.
- **Quick links strip** — 5-column bordered strip. Each cell: cream-circle icon + 2-line label (title + subtitle in mono). Covers livestream, projects, rubric, recap post, participants.
- **Winners grid** — Kicker + "The projects that *made us cheer.*" 2-column card grid. Each card: 180px image on left with a place badge (1ST/2ND/3RD/PEOPLE — 1st place is orange, rest are black); right side has mono project name, italic prize amount, mono team, description, tag chips, View link.
- **Gallery** — Cream section "48 hours in *photos.*" Masonry-ish grid — one 2×2 hero, one 2-wide, rest 1×1. Each has a mono caption overlay.
- **Sponsors + next hack** — Left: 6 sponsor chips (italic serif name in bordered pill). Right: inverted dark card teasing the next hackathon.

### 8. Forum (`VarB_Page_Forum`), 9. Tutorial (`VarB_Page_Tutorial`), 10. Showcase (`VarB_Page_Showcase`), 11. Profile (`VarB_Page_Profile`)

Existing prototypes — see files; follow the same editorial system.

## Shell / Navigation

All pages share a **top-bar shell** (`VarB_Shell`):

- **Left** — DevHub wordmark: "Dev**Hub**" where "Hub" is TG orange. Before it, a small orange rounded-tile mark containing white chevron strokes + connected node dots.
- **Center** — Nav items (order): Resources, AI Chat, Pathfinder, My Learning, Events, Forum. Active item has a 2px orange underline 1px below; inactive items are muted.
- **Right** — Search input (pill), theme toggle, bell icon, user avatar.

The page root uses `.tg-root.theme-b` (add `.dark` for dark mode).

## Interactions & Behavior

- **Mode toggle (AI Chat)** — Switching Learning ↔ Q&A replaces the entire conversation, the status bar, the composer placeholder, the suggestion chips, and highlights a different card in the comparison strip. Treat as full state swap.
- **Filter pills (Resources)** — Controlled state. Active pill = black. Grid filters by `type` field.
- **Quiz flow (Pathfinder)** — 5 steps. Progress bar fills `(step / 5) * 100%`. Next button advances; Back decrements. After step 5, show the generated path (preview section is the model for it).
- **Path step states (My Learning)** — `done` | `active` | `todo`. Active step shows an inline progress sub-bar inside the card.
- **Bookmarks** — Bookmark button on resource cards toggles saved state (persists to My Learning).
- **Theme toggle** — Flips `dark` class on root; tokens handle the rest.
- **No page transitions/animations needed for v1** beyond standard 150ms hover state changes.

## State Management

Minimum viable state:

- `user` — auth, progress, saved items, active path id.
- `resources[]` — fetched from API, filterable by type/level/level/search.
- `learningPath` — active path (id, steps with `status: 'done'|'active'|'todo'` and per-step `progress: 0..1`).
- `savedResources[]` — bookmarked resource ids + per-resource progress.
- `aiChat` — mode (`'learning' | 'qa'`), current thread, Learning-mode session state.
- `events[]` — upcoming, past, hackathons.
- `pathfinderDraft` — current quiz step + answers.

Server-driven where possible. Only `pathfinderDraft` and `aiChat.mode` need to be local/client.

## Design Tokens

Canonical definitions are in `lib/tokens.css`. The essentials:

### Brand
- `--tg-orange` `#F58220` — primary accent
- `--tg-orange-600` `#E26F0D` — hover
- `--tg-orange-100` `#FFE8D4`
- `--tg-orange-50` `#FFF4E8`

### Variation B (editorial) — light
- `--bg` `#FBF7F1` (paper)
- `--bg-elev` `#FFFFFF` (card)
- `--bg-hover` `#F3EDE2`
- `--border` `#E7DFD1`
- `--border-strong` `#D4C9B4`
- `--fg` / `--ink` `#1C1815`
- `--fg-muted` `#6B6254`
- `--fg-subtle` `#978B79`
- `--cream` `#F5EEDF` (active / selected bg)
- `--success` `#2F9F5E`

### Variation B — dark
- `--bg` / `--paper` `#1A1714`
- `--bg-elev` `#23201B`
- `--border` `#3A352C`, `--border-strong` `#4A4438`
- `--fg` / `--ink` `#F5EEDF`, `--fg-muted` `#B8AE99`
- `--cream` `#2A261F`

### Typography
- Sans — **Geist**, weights 300–800. Use 400 body, 500/600 headlines, 600–700 for strong labels.
- Mono — **Geist Mono**, 400/500/600. Used for kickers, metadata, code, labels.
- Serif — **Instrument Serif**, italic. Used *only* as accent — one italic per headline, never for body. Load both roman and italic.

Google Fonts import (already in `tokens.css`):
```
Geist:wght@300..800
Geist+Mono:wght@400..600
Instrument+Serif:ital@0;1
```

### Type scale (in use)
- Display — 48–60px, weight 500, letter-spacing -1.6 to -2px
- Section title — 26–32px, weight 500, letter-spacing -0.6 to -1px
- Card title — 15–17px, weight 600, letter-spacing -0.2px
- Body — 13–14.5px, line-height 1.55–1.65
- Meta/mono — 10–12px, letter-spacing 1.2–2px, uppercased

### Radii
- `--r-sm` 6 · `--r-md` 10 · `--r-lg` 14 · `--r-xl` 20
- Pill buttons & chips use `border-radius: 999px`

### Shadows
- Soft card: `0 12px 40px rgba(28,24,21,.05)` (only on special floating cards like Pathfinder quiz)

### Spacing rhythm
- Page horizontal padding: 40px
- Section vertical padding: 48–64px
- Card padding: 20–28px
- Grid gap: 12–20px

## Iconography

All icons are stroke-style, 24×24 viewBox, 1.5px stroke, `currentColor`. See `lib/primitives.jsx` for the full set (Icons.Home, Search, Compass, Sparkle, Book, Play, Bookmark, Calendar, Users, Code, Github, Arrow, Play, Moon, Sun, Heart, Star, Check, Filter, Zap, Menu, Bell, Share, Globe, Terminal, Database, Branch, etc.). Swap for lucide-react or similar in implementation — the names line up.

## Placeholders (to replace with real assets)

- **Image placeholders** — `ImagePlaceholder` renders warm or orange abstract SVG compositions. Replace with real photos (events, people, projects). Keep aspect ratios the same.
- **Avatars** — `Avatar` renders initials on a warm square. Replace with real user avatars; keep radius.
- **Logo** — DevHub wordmark is built in JSX. Once a real logomark exists, swap the orange tile + chevron SVG.
- **Graph motif** — `GraphMotif` is a seeded SVG. Keep; it's procedural and design-system-owned.

## Files in this Bundle

- `TigerGraph DevHub.html` — top-level shell: imports scripts, holds the `DesignCanvas` with all artboards, and the Tweaks panel. Open this in a browser to see every screen at once.
- `lib/tokens.css` — **all design tokens**. Your primary reference.
- `lib/primitives.jsx` — shared atoms: `Icons`, `Avatar`, `GraphMotif`, `ImagePlaceholder`, `SectionHeader`.
- `lib/variation-b.jsx` — `VarB_Homepage`, `VarB_TopNav` (early nav).
- `lib/variation-b-pages.jsx` — `VarB_Shell` (navigation chrome), `VarB_Page_Forum`, `VarB_Page_Tutorial`, `VarB_Page_Showcase`, `VarB_Page_Events`, `VarB_Page_Profile`.
- `lib/variation-b-new-pages.jsx` — `VarB_Page_Resources`, `VarB_Page_AIChat`, `VarB_Page_Pathfinder`, `VarB_Page_MyLearning`, `VarB_Page_EventDetail`.
- `lib/design-canvas.jsx` — the viewer harness (not needed in production; used only to display all artboards side-by-side in the prototype).

## Recommended Implementation Plan

1. **Spin up** Next.js 14 + Tailwind + shadcn/ui (or your equivalent).
2. **Port tokens** — translate `tokens.css` into `tailwind.config.ts` (extend `colors`, `fontFamily`, `borderRadius`). Include both `theme-b` light and dark; wire up `dark:` variants.
3. **Load fonts** — Geist, Geist Mono, Instrument Serif via `next/font`.
4. **Build shell** — `Shell` component (top nav), `PageHeader` (kicker + headline w/ italic span), `SectionHeader`, `Kicker`, `DisplayTitle` — these recur everywhere.
5. **Build atoms** — `ResourceCard`, `PathStepCard`, `QuizOption`, `StatsStrip`, `GraphMotif`, `IconBadge`, `Chip`, `PillFilter`.
6. **Page-by-page** in this order: Resources → Pathfinder → My Learning → AI Chat → Event Detail → Events → Forum → Tutorial → Showcase → Profile → Homepage.
7. **Wire data** — stub everything with the mock data inlined in the JSX files for v1; replace with API calls once endpoints exist.
