# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `npm run dev` (port 3000)
- **Build:** `npm run build`
- **Lint:** `npm run lint` (ESLint flat config, no extra args needed)
- **No test runner configured**

## Architecture

Next.js 16 App Router project with React 19 and TypeScript. All pages use `"use client"` — there are no server components or API routes in practice.

### Routes

- `/` — Hero landing page with ASCII art display
- `/apply` — Spanish-language investor application form
- `/ascii` — Interactive ASCII art generator lab
- `/ascii/render` — Read-only ASCII export renderer (receives data via URL params)

### Key Patterns

- **Styling:** Tailwind CSS v4 via PostCSS. Uses `cn()` helper from `@/lib/utils` (clsx + tailwind-merge). Dark theme by default with monospace typography.
- **UI components:** shadcn/ui (new-york style) with Radix primitives. Components live in `src/components/ui/`.
- **State:** React hooks only (useState, useMemo, useCallback). No external state library.
- **Forms:** Custom form handling with debounced validation (no form library). The apply page has a 1s debounce on field validation.
- **Canvas rendering:** ASCII art uses HTML5 Canvas 2D with `requestAnimationFrame`, `ResizeObserver`, and device pixel ratio scaling.
- **Path alias:** `@/*` maps to `./src/*`

### Language & Locale

The `/apply` form is in Spanish. Country names use `Intl.DisplayNames` with `es-ES` locale. Currency is EUR.

### Testing Shortcut

Press **F10** (fn+F10 on Mac) on the `/apply` page to prefill the form with dummy data.
