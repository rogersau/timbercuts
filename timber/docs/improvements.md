# Codebase Improvements & Actionable Items

This document outlines recommended improvements for the Timber Cuts project to enhance manageability, usability, and code quality.

## 1. Documentation

### Update README.md
**Current Status:** Uses default Vite template.
**Action:** Replace with project-specific documentation.
- **Project Overview:** Explain what the tool does (optimizes timber cuts).
- **Features:** List key features (Cost/Waste modes, Owned timber, Project management).
- **Getting Started:** Instructions for installation (`pnpm install`) and running (`pnpm dev`).
- **Tech Stack:** React, TypeScript, Vite, Tailwind, Vitest.

### Code Documentation
**Current Status:** Some JSDoc exists, but inconsistent.
**Action:**
- Add JSDoc to all exported functions in `src/lib`.
- Add comments to complex logic in `reducer` within `useTimberState.ts`.

## 2. Architecture & Performance

### Web Worker for Optimization
**Current Status:** Done. `optimizeTimberCutting` runs in a Web Worker.
**Action:**
- [x] Move `optimizeTimberCutting` to a Web Worker.
- [x] Use `comlink` or native `Worker` API to communicate with the main thread.
- [x] Add a loading state to the UI while calculating.

### State Management Refactoring
**Current Status:** Reducer split, Context API implemented.
**Action:**
- [x] **Split Reducer:** Break down the reducer into smaller slice reducers (e.g., `timberReducer`, `projectReducer`).
- [x] **Context API:** Wrap the application in a `TimberProvider` to avoid prop drilling if the app grows.
- [ ] **Consider Libraries:** If state complexity increases, evaluate Zustand or Redux Toolkit.

### Component Decomposition
**Current Status:** Done. `App.tsx` is refactored.
**Action:**
- [x] Create a `Layout` component for the page structure (header, container, footer).
- [x] Move the "Calculate" button and "Settings" dialog into a `ControlPanel` component.
- [x] Extract the "Results" section into a dedicated container component.

## 3. Testing

### Component Testing
**Current Status:** Only logic in `src/lib` is tested.
**Action:**
- Install `@testing-library/react`.
- Write tests for key components:
  - `TimberStockList`: Ensure inputs update state.
  - `SolutionCard`: Verify results are displayed correctly.
  - `ProjectDialogs`: Test save/load flows.

### E2E Testing
**Current Status:** None.
**Action:**
- Set up Playwright or Cypress.
- Create a critical path test:
  1. Add stock timber.
  2. Add required cuts.
  3. Click Calculate.
  4. Verify solution appears.

## 4. Code Quality & Tooling

### Formatting & Linting
**Current Status:** ESLint is present.
**Action:**
- **Prettier:** Install and configure Prettier for consistent formatting.
- **Husky & Lint-staged:** Set up pre-commit hooks to run linting and formatting automatically.
- **Strict TypeScript:** Enable `strict` mode in `tsconfig.json` if not already fully compliant.

### Path Aliases
**Current Status:** Used (`@/components`), which is good.
**Action:** Ensure all imports use aliases consistently.

### Cleanup
**Current Status:** `App.css` is imported but appears empty.
**Action:** Remove unused files and imports to keep the project clean.

## 5. User Experience (UX) Features

### Data Persistence
**Current Status:** `localStorage` is used for projects.
**Action:**
- **Auto-save:** Automatically save the current "draft" state so users don't lose work on refresh (outside of named projects).
- **Export/Import:** Allow exporting projects to JSON and importing them (backup/restore).

### Reporting
**Current Status:** Screen-only view.
**Action:**
- **Print View:** Add a print stylesheet or a "Print PDF" button for the cut list/solution.
- **CSV Export:** Allow exporting the shopping list and cut plan to CSV.

### Undo/Redo
**Current Status:** None.
**Action:** Implement undo/redo history for state changes (accidental deletions).

## 6. CI/CD

### GitHub Actions
**Current Status:** None visible.
**Action:**
- Create `.github/workflows/ci.yml`.
- Run `pnpm install`, `pnpm lint`, `pnpm test:run`, and `pnpm build` on every push and PR.

---

## Prioritized Roadmap

1. **Immediate (High Impact/Low Effort):**
   - Update `README.md`.
   - Setup Prettier & Husky.
   - Add Auto-save for current draft.

2. **Short Term (Stability):**
   - Component Tests.
   - Refactor `App.tsx` layout.

3. **Medium Term (Performance/Features):**
   - Web Worker for optimizer.
   - Print/Export features.
   - CI/CD Pipeline.
