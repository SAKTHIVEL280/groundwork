# Groundwork

> **Plan before you build.** A free, open-source pre-code planning tool for developers.

Groundwork helps you think through your project **before** writing a single line of code. Define your problem, map personas, scope features, design data models, pick your stack, sketch architecture, plan milestones, and make decisions — all in one beautiful workspace. Then export everything as a Markdown brief, AI context file, or JSON.

**Live at [groundwork.daeq.in](https://groundwork.daeq.in)**

---

## Features

- **10 Planning Sections** — Problem, Personas, Competitors, Features, Data Model, Tech Stack, Screens, Architecture, Milestones, Decisions
- **Visual Canvas** — Freeform Excalidraw canvas for sketching ideas alongside structured planning
- **Templates** — Start from SaaS, Mobile App, CLI Tool, API, Portfolio, or Library templates
- **AI Assistant** — Optional Groq AI integration (BYOK) for smart suggestions across all sections
- **Cloud Sync** — Sign in with GitHub/Google to sync projects across devices via Supabase
- **Export** — Markdown project brief, AI context file (for Copilot/Claude/Cursor), or full JSON
- **Import** — Load `.groundwork.json` files to continue planning
- **PWA** — Install as a desktop app, works offline
- **6 Color Themes** — Purple, Blue, Green, Orange, Pink, Teal × Light/Dark mode
- **Material You Design** — Clean M3 interface with Inter font
- **100% Free & Open Source** — MIT licensed, no paywalls

## Quick Start

```bash
# Clone
git clone https://github.com/SAKTHIVEL280/groundwork.git
cd groundwork

# Install dependencies
npm install

# Start dev server
npm run dev
```

Opens at [http://localhost:5173](http://localhost:5173).

## Build for Production

```bash
npm run build
```

Output in `apps/web/dist/`.

## Project Structure

```
groundwork/
├── apps/
│   └── web/                        # React 19 + Vite + MUI v6
│       ├── src/
│       │   ├── components/         # UI components & sections
│       │   ├── pages/              # Route pages
│       │   ├── hooks/              # Custom hooks (useAI)
│       │   ├── stores/             # Auth store (Supabase)
│       │   ├── lib/                # Supabase client, sync engine
│       │   ├── store.ts            # Zustand app state
│       │   └── theme.ts            # 6 color schemes × light/dark
│       └── index.html
├── packages/
│   ├── types/                      # Shared TypeScript interfaces
│   └── logic/                      # Business logic
│       ├── project-factory.ts      # Factory functions
│       ├── progress.ts             # Completion calculation
│       ├── export.ts               # Markdown/AI/JSON export
│       ├── ai.ts                   # Groq API client
│       └── templates.ts            # 7 project templates
├── samples/                        # Sample .groundwork.json files
├── .github/workflows/ci.yml        # GitHub Actions CI
├── turbo.json                      # Turborepo config
└── package.json                    # Workspace root
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite 6 |
| UI | MUI v6 (Material You / M3) |
| Canvas | Excalidraw |
| State | Zustand 5 + localStorage persistence |
| Auth | Supabase (GitHub & Google OAuth) |
| Cloud Sync | Supabase (PostgreSQL + RLS) |
| AI | Groq API (llama-3.3-70b-versatile) |
| PWA | vite-plugin-pwa + Workbox |
| Build | Turborepo monorepo |
| CI/CD | GitHub Actions |
| Hosting | Vercel |

## Deployment (Vercel)

1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. **Framework Preset**: Vite
3. **Root Directory**: `apps/web`
4. **Build Command**: `cd ../.. && npm run build:web`
5. **Output Directory**: `dist`
6. Add your custom domain (e.g., `groundwork.daeq.in`)

## Environment

No environment variables required for basic usage. The app works fully offline with local storage.

For cloud sync, the Supabase project is pre-configured in the source.

For AI features, users enter their own Groq API key in Settings (stored locally, never sent to any server).

## Contributing

Contributions welcome!

1. Fork the repo
2. Create a branch (`git checkout -b feature/my-feature`)
3. Commit changes (conventional commits)
4. Push and open a PR

## License

[MIT](LICENSE)
