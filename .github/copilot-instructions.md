# GitHub Copilot Instructions for Timbercuts

## Project Overview

Timber Cuts is a web-based timber cutting optimization tool built with Vite, React, TypeScript, and Tailwind CSS. The core purpose is to compute optimized timber and sheet cutting plans that balance cost and waste (including kerf/blade thickness), and support using "timber on hand".

## Tech Stack

- **Framework**: React 19.2 + TypeScript 5.9
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3 + shadcn/ui (Radix primitives)
- **Testing**: Vitest with React Testing Library
- **Package Manager**: pnpm 10

## Project Structure

```
timber/                         # Main application directory
├── src/
│   ├── components/            # React components
│   │   └── ui/               # shadcn/Radix UI primitives (DO NOT MODIFY)
│   ├── lib/                  # Core business logic
│   │   ├── timber-optimizer.ts    # Timber cutting algorithm
│   │   └── sheet-optimizer.ts     # Sheet cutting algorithm
│   ├── hooks/                # Custom React hooks
│   ├── reducers/             # State management reducers
│   ├── workers/              # Web Workers for optimization
│   └── pages/                # Route pages
├── docs/                     # Project documentation
├── TESTING.md               # Testing documentation
└── package.json             # Project dependencies
```

## Commands

```bash
# Development
cd timber && pnpm install
cd timber && pnpm dev          # Start dev server

# Building
cd timber && pnpm build        # Build for production

# Testing
cd timber && pnpm test:run     # Run tests once
cd timber && pnpm test         # Run tests in watch mode
cd timber && pnpm test:ui      # Run tests with UI

# Linting
cd timber && pnpm lint         # Run ESLint
```

## Code Style Guidelines

### TypeScript

- Use strict TypeScript with explicit types
- Prefer interfaces over type aliases for object shapes
- Use proper JSDoc comments for exported functions

### React

- Use functional components with hooks
- Follow the existing component structure and naming conventions
- Prefer composition over inheritance
- Use proper prop typing with TypeScript interfaces

### Testing

- Write unit tests for all logic changes in `src/lib/`
- Use React Testing Library for component tests
- Follow existing test patterns in `*.test.ts` and `*.test.tsx` files

## Boundaries - DO NOT MODIFY

**CRITICAL**: Never edit files in `timber/src/components/ui/` without explicit human permission. These are shadcn/Radix UI primitive components and should be treated as stable dependencies.

If a change requires modifying UI primitives:
1. Stop immediately
2. Request approval from a repo maintainer
3. Wait for explicit permission before proceeding

## Safe Operations

- Adding or modifying unit tests
- Fixing algorithms in `src/lib/timber-optimizer.ts` or `src/lib/sheet-optimizer.ts`
- Refactoring helpers and utilities
- Updating documentation
- Creating new components (outside of `src/components/ui/`)
- Modifying `App.tsx` or page components

## Pull Request Guidelines

- Keep changes small and focused
- Include tests for any logic changes
- Reference the issue or failing test if available
- Explain intent clearly in the PR description
