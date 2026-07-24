# Clinical Sutra — frontend

React + Vite + Tailwind v4 implementation of the *Clinical Trials* design: a
plain-language trial browser with a slide-over AI assistant.

```bash
npm install
cp .env.example .env   # point VITE_API_URL at the backend
npm run dev
```

## Structure

```
src/
  main.jsx            entry
  App.jsx             providers + route switch (thin)
  index.css           design tokens (@theme) — colors, fonts, radii
  pages/              Home, TrialDetail
  sections/           Hero / Search / Trials — the homepage, one file per band
  components/
    ui/               Button, StatusPill, SearchField, Select, Icon, Notice, Skeleton, SectionLabel
    layout/           Navbar, Page
    trials/           TrialRow, TrialList, TrialRowSkeleton, FactGrid, TrialAside
    assistant/        AssistantPanel, MessageBubble, ThinkingDots
    Pagination.jsx
  state/              contexts.js (context objects + hooks) and one provider per domain
  hooks/              useTrial, useDebouncedValue
  services/           apiClient, trialsService, assistantService
  lib/                trials.js (formatting + normalisation), pagination.js
```

## How it fits together

**The homepage is a list.** `pages/Home.jsx` mounts an ordered array of
sections; each section pulls what it needs from context, so adding or
reordering one is a single line.

**State lives in three providers.** `TrialsProvider` owns the browse
experience — query, filters, page, results — in a `useReducer` store, debounces
the query, and aborts in-flight requests when inputs change. `AssistantProvider`
owns the chat panel; a trial page registers itself as the assistant's context so
answers are scoped to that study. `RouterProvider` is a ~40-line hash router
(`#/trial/NCT05432817`) that keeps deep links and back/forward working.

**API shapes stay at the edge.** `lib/trials.js` turns API enums
(`RECRUITING`, `PHASE2`) into display values and normalises both endpoint
shapes, so components never reach through `?.` chains. Fields the database
doesn't hold yet (sponsor, enrollment, locations, eligibility) are rendered
only when present.

## Backend endpoints used

| Endpoint | Used by |
| --- | --- |
| `GET /search?q&page&limit&status&phase` | homepage list + pagination |
| `GET /trials/:nct_id` | trial detail |
| `POST /assistant { question }` | assistant panel |
