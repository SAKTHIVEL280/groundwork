# Groundwork

A free, open-source pre-code planning tool for developers. Built as a web app.

## Tech Stack
- **Frontend**: React 19, Vite, MUI v6 (Material You / M3 design)
- **Shared packages**: TypeScript types and business logic in `packages/`
- **State**: Zustand with localStorage persistence
- **Auth & Sync**: Supabase (GitHub/Google OAuth + cloud sync)
- **AI**: Optional Groq API integration (BYOK — bring your own key)
- **Canvas**: Excalidraw (white-labeled)
- **PWA**: Offline support via vite-plugin-pwa
- **Build**: Turborepo monorepo
- **Hosting**: Vercel at groundwork.daeq.in

## Code Style & Conventions
- Strict TypeScript everywhere — no `any`
- Functional components only (no class components)
- Zustand for state management — no Context API for global state
- MUI components — Material You (M3) design system — use theme tokens, not hardcoded colors
- Keep shared logic in `packages/logic/` — the web app imports from there
- Factory functions (e.g., `createProject()`) for creating data objects — never construct manually
- File naming: kebab-case for files, PascalCase for components
- Export naming: named exports only, no default exports (except page components)

## Project Structure
```
groundwork/
├── apps/
│   └── web/          # React 19 + Vite + MUI v6 (M3)
├── packages/
│   ├── types/        # Shared TypeScript interfaces
│   └── logic/        # Business logic, AI client, templates, export
├── samples/          # Sample .groundwork.json files for testing
└── .github/          # CI/CD workflows
```

## Key Decisions
- AI is OPTIONAL and OFF by default — the app works perfectly without it
- No backend for v1 — all data stored locally, Supabase added later for sync
- Canvas powered by Excalidraw (white-labeled, MIT licensed)
- Templates help first-time users understand the app
- All exports (Markdown, AI context, JSON) are generated client-side
