/**
 * Vercel Build Script
 * Uses the Vercel Build Output API (v3) to reliably deploy
 * from an npm-workspaces monorepo.
 *
 * 1. Runs `npm run build` (Vite outputs to apps/web/dist)
 * 2. Copies build artifacts into .vercel/output/static
 * 3. Writes .vercel/output/config.json with SPA routing
 */

import { execSync } from 'child_process';
import { cpSync, mkdirSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = process.cwd();

// ── 1. Build ────────────────────────────────────────────────
console.log('▸ Running build…');
execSync('npm run build', { stdio: 'inherit', cwd: ROOT });

// ── 2. Locate dist ─────────────────────────────────────────
const candidates = [
  join(ROOT, 'apps', 'web', 'dist'),
  join(ROOT, 'dist'),
];

let distDir;
for (const p of candidates) {
  if (existsSync(p) && existsSync(join(p, 'index.html'))) {
    distDir = p;
    break;
  }
}

if (!distDir) {
  console.error('✖ Could not find build output (index.html) in any of:');
  candidates.forEach((c) => console.error('  -', c));
  // Extra debug info
  console.error('\nDirectory listing (depth 2):');
  try {
    execSync('find . -maxdepth 3 -name index.html', { stdio: 'inherit', cwd: ROOT });
  } catch { /* ignore */ }
  process.exit(1);
}

console.log('▸ Found dist at:', distDir);

// ── 3. Create .vercel/output ────────────────────────────────
const outputDir = join(ROOT, '.vercel', 'output');
const staticDir = join(outputDir, 'static');

mkdirSync(staticDir, { recursive: true });
cpSync(distDir, staticDir, { recursive: true });

// Config: filesystem-first routing + SPA fallback
writeFileSync(
  join(outputDir, 'config.json'),
  JSON.stringify(
    {
      version: 3,
      routes: [
        { handle: 'filesystem' },
        { src: '/(.*)', dest: '/index.html' },
      ],
    },
    null,
    2,
  ),
);

console.log('✔ Vercel output written to', outputDir);
console.log(
  '  static files:',
  readdirSync(staticDir).length,
  'top-level entries',
);
