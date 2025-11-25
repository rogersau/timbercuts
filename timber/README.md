# Timber Cuts - Cut Optimiser

A powerful web-based tool to optimize timber cutting, minimizing waste and cost for woodworking projects.

## Project Overview

Timber Cuts is a React application designed to help woodworkers, carpenters, and DIY enthusiasts plan their cuts efficiently. By inputting available stock lengths and required cut lists, the application calculates the optimal cutting pattern to reduce material waste and overall cost.

## Features

- **Optimization Modes:**
  - **Cost Mode:** Prioritizes using the cheapest combination of timber lengths.
  - **Waste Mode:** Prioritizes using the least amount of material (tightest fit).
- **Owned Timber:** Input timber you already have on hand to use it before purchasing new stock.
- **Project Management:** Create, save, and load multiple projects.
- **Unit Support:** Switch seamlessly between Millimeters (mm) and Inches (in).
- **Kerf Adjustment:** Account for the blade width (kerf) in calculations.
- **Visual Results:** Clear visual representation of how to cut each board.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/) (recommended package manager)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd timbercuts/timber
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

### Running the Application

Start the development server:

```bash
pnpm dev
```

Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

### Running Tests

This project uses Vitest for unit testing the optimization logic.

```bash
pnpm test:run
```

## Tech Stack

- **Frontend Framework:** [React](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **UI Framework:** [Shadcn/UI](https://ui.shadcn.com/)
- **Testing:** [Vitest](https://vitest.dev/)

## License

[MIT](LICENSE)
