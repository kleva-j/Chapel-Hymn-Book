## Chapel Hymnbook — Product Requirements Document

### 1. Product Overview

**App:** `chapel-hymnbook` — offline-first React Native mobile app for accessing, searching, and engaging with a chapel/church hymn collection.

**Platform:** iOS + Android (Expo managed workflow). Web via Metro bundler (secondary).

**Current state:** Scaffolded shell only. Navigation skeleton (Drawer + Tabs), theme system, data models, DB schema, Effect.TS interfaces — all defined. Zero functional screens built. No data seeded. No repository implementations.

---

### 2. Tech Stack (locked)

| Layer       | Choice                                   |
| ----------- | ---------------------------------------- |
| Framework   | React Native 0.81 + Expo 54              |
| Navigation  | expo-router (Drawer → Tabs)              |
| UI          | HeroUI Native + Uniwind (TailwindCSS v4) |
| State/cache | TanStack Query v5                        |
| Effects/FP  | Effect.TS 3.x                            |
| Local DB    | expo-sqlite v16                          |
| Animations  | React Native Reanimated 4 + Worklets     |
| Haptics     | expo-haptics                             |
| Validation  | Zod                                      |
| Monorepo    | Turborepo + pnpm                         |

---

### 3. Core Data Model (already defined)

```ts
Hymn { id, title, number, content, verses[], chorus?, createdAt, updatedAt }
SearchCriteria { query, searchType: "title"|"number"|"content" }
```

SQLite table `hymns` exists in config with indexes on `title`, `number`, `content`.

---

### 4. Feature Requirements

#### 4.1 — Hymn Browsing (P0)

**Goal:** User opens app, sees all hymns, taps to read.

- Hymn list screen — flat list sorted by hymn number
- Each row shows: hymn number (bold), title
- Pull-to-refresh gesture
- Section headers grouped by number range (1–50, 51–100, etc.)
- Hymn detail screen — renders title, each verse numbered, chorus clearly delineated, scroll to end
- Smooth scroll-to-verse navigation anchors
- **Missing:** `HymnRepository` concrete implementation, data seeder, list + detail screens, route wiring

#### 4.2 — Search (P0)

**Goal:** Find hymns instantly by number, title, or lyric content.

- Persistent search bar in header or dedicated Search tab
- Live search with 300ms debounce (Effect.TS program already specced)
- Three modes: by number (exact), by title (prefix/fuzzy), by content (full-text via SQLite FTS5)
- Empty state with helpful prompt
- Highlight matching text in results
- Keyboard dismiss on scroll
- **Missing:** FTS5 virtual table in schema, search screen component, query hook

#### 4.3 — Favorites / Bookmarks (P1)

**Goal:** Mark hymns to access quickly without searching.

- Heart/bookmark icon on detail screen header
- Favorites tab or drawer section showing saved hymns
- Persisted in a `favorites` SQLite table (`hymn_id`, `created_at`)
- Badge count on Favorites nav item
- **Missing:** `favorites` table, FavoriteRepository, favorites screen

#### 4.4 — Recently Viewed History (P1)

**Goal:** Resume where you left off.

- Last 10 hymns auto-recorded on open
- History section in Drawer or a History tab
- "Continue reading" card on Home screen (last opened hymn)
- Persisted in `history` SQLite table with timestamp
- **Missing:** `history` table, write-on-view side effect, history screen

#### 4.5 — Font Size & Display Settings (P1)

**Goal:** Accessibility for all congregation members.

- Font size slider: Small / Medium / Large / XL
- Font family option: serif vs sans-serif (hymnal feel)
- Line spacing toggle: compact / comfortable
- Settings persisted via `expo-secure-store` (or AsyncStorage)
- Settings screen accessible from Drawer
- **Missing:** settings screen, text scale context, storage persistence

#### 4.6 — Offline-First (P0 — architectural)

**Goal:** App works with zero network on first open.

- Hymn data bundled as JSON asset (`assets/data/hymns.json`) seeded on first launch
- `initializeApp` Effect.TS program runs on boot, seeds DB if empty
- Network-independent — no remote fetch needed
- **Missing:** hymn dataset file, seed script, boot initialization hook

#### 4.7 — Share Hymn (P2)

**Goal:** Share hymn text with others.

- Share sheet via `expo-sharing` or React Native Share API
- Formats: plain text (title + verses) and deep link (`chapel-hymnbook://hymn/42`)
- Deep link scheme already configured in `app.json` (`scheme: "chapel-hymnbook"`)
- **Missing:** share action in detail screen, deep link handler route

#### 4.8 — Home Screen Dashboard (P1)

**Goal:** Meaningful landing page instead of current placeholder.

- "Hymn of the Day" — deterministic daily pick (seeded by date)
- Quick-access: last viewed hymn
- Quick-access: top 3 favorites
- Search entry point
- **Missing:** entire Home screen UI, hymn-of-day algorithm

#### 4.9 — Print / Export (P3)

- Export hymn as formatted PDF via `expo-print`
- Useful for printing service sheets

---

### 5. Navigation Redesign

Current structure is placeholder. Proposed structure:

```
(drawer)
├── Home          → dashboard: hymn of day, recents, favorites
├── (tabs)
│   ├── Hymns     → full browsable list (replaces "Tab One")
│   └── Search    → search screen (replaces "TabTwo")
├── Favorites     → saved hymns
├── History       → recently viewed
└── Settings      → font size, theme, about

(modal / stack)
└── hymn/[id]     → hymn detail viewer
```

---

### 6. Architecture Gaps to Fill

| Gap                   | File(s)                                       | Action                                 |
| --------------------- | --------------------------------------------- | -------------------------------------- |
| No QueryProvider      | `app/_layout.tsx`                             | Wrap with `QueryClientProvider`        |
| HymnRepository stub   | `src/data/repositories/hymn-repository.ts`    | Implement with `expo-sqlite`           |
| HymnPrograms stub     | `src/effects/hymn-programs.ts`                | Implement Effect.TS runtime            |
| No hymn data          | —                                             | Add `assets/data/hymns.json` seed file |
| FTS5 missing          | `src/data/database/config.ts`                 | Add `hymns_fts` virtual table          |
| Feature modules empty | `src/features/hymns/`, `src/features/search/` | Build components                       |
| No favorites table    | `src/data/database/config.ts`                 | Add schema                             |
| No history table      | `src/data/database/config.ts`                 | Add schema                             |

---

### 7. Roadmap

#### Phase 1 — Foundation (Week 1–2)

_Goal: data flows end-to-end, first real screen works_

1. **Hymn dataset** — source/create `assets/data/hymns.json` (standard hymnals are public domain)
2. **DB initialization** — implement `initializeApp` Effect program: create tables + seed hymns
3. **HymnRepository** — concrete SQLite impl: `getAllHymns`, `getHymnById`, `searchHymns`
4. **QueryClient wiring** — add `QueryClientProvider` to root `_layout.tsx`
5. **Hymn list screen** — replace Tab One placeholder with real list using TanStack Query
6. **Hymn detail screen** — route `hymn/[id]`, render verses + chorus

#### Phase 2 — Search & Discovery (Week 3)

_Goal: find any hymn in under 3 taps_

7. **FTS5 schema** — add virtual table, populate on seed
8. **Search screen** — replace Tab Two with live search, debounced via Effect.TS
9. **Deep links** — handle `chapel-hymnbook://hymn/:id`
10. **Home dashboard** — hymn of day, last viewed, quick-access favorites card

#### Phase 3 — Personalization (Week 4)

_Goal: users curate their experience_

11. **Favorites** — add `favorites` table, toggle UI, favorites drawer screen
12. **History** — add `history` table, auto-record on view, history screen
13. **Settings screen** — font size, font family, line spacing; persist with SecureStore

#### Phase 4 — Polish & Share (Week 5)

_Goal: production-ready_

14. **Share hymn** — Share sheet with text + deep link
15. **Accessibility** — VoiceOver/TalkBack labels, minimum touch targets
16. **Animations** — list item enter animations, detail screen transition
17. **Error boundaries** — graceful DB failure screens
18. **Tests** — property-based tests with `fast-check` for search + repository layer (jest-expo already configured)

#### Phase 5 — Extended (Backlog)

- Print/PDF export
- Sermon notes attached to hymns
- Playlist / service order builder
- Multiple hymnal collections
- Web companion app (README mentions `apps/web` — not yet created)

---

### 8. Success Metrics

| Metric                               | Target                     |
| ------------------------------------ | -------------------------- |
| Time to open specific hymn by number | < 3 seconds from app open  |
| Search result latency                | < 150ms after debounce     |
| Cold launch time                     | < 2s on mid-range Android  |
| Offline functionality                | 100% — no network required |
| Crash-free sessions                  | > 99.5%                    |

---

### 9. Open Questions

1. **Hymn dataset** — which hymnal(s)? (SDA, Baptist, Methodist hymnals all have public-domain editions). This blocks Phase 1.
2. **Web app** — README references `apps/web` but it doesn't exist. In scope?
3. **Multi-language** — hymns in multiple languages? Affects schema (language column, locale routing).
4. **Sync** — purely local forever, or eventual cloud sync for favorites/history across devices?
5. **Auth** — `bts.jsonc` shows `auth: none`. If sync added later, auth needed.
