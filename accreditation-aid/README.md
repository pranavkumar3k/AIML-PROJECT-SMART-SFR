# Accreditation Aid – SmartSFR Frontend

Modern, high-performance React application for **SmartSFR (Student–Faculty Ratio Analysis & NBA Accreditation Support System)**.

---

## Overview

`accreditation-aid` is built with **React 19**, **TypeScript**, and **TanStack Start** with **TanStack Router**. It provides an integrated interface for academic administrators to upload institutional CSV records, analyze SFR according to **NBA Section 4.1**, review student distributions, audit faculty rosters, examine step-by-step mathematical calculations, and generate accreditation reports.

---

## Key Features

- **Integrated Application Shell**: Persistent dark navy navigation sidebar with active link detection and responsive mobile drawer.
- **Shared State Management**: Global `SfrContext` with session storage caching ensures uploaded data and analysis persist across page navigation and browser reloads.
- **Six Completed Sections**:
  1. **Dashboard (`/`)**: File uploads, status overview, KPI cards, year-wise SFR table, and trend chart.
  2. **Student Data (`/student-data`)**: Searchable, filterable student records table with cohort metrics.
  3. **Faculty Data (`/faculty-data`)**: Audit faculty roster by ID, designation, and eligibility badges with NBA compliance guidance.
  4. **SFR Calculation (`/sfr-calculation`)**: Mathematical breakdown for CAY, CAYm1, CAYm2, student sums, eligible faculty, and 3-year average.
  5. **Reports (`/reports`)**: Official Self Assessment Report (SAR) Section 4.1 document preview with PDF print layout and Excel/CSV download.
  6. **About (`/about`)**: Complete NBA accreditation guide, user personas, formulas, and criteria rubric.

---

## Technology Stack

- **Framework**: React 19, Vite 8, Nitro
- **Language**: TypeScript 5.8
- **Routing**: `@tanstack/react-router` (File-based routing)
- **State Management**: React Context (`SfrContext`) with session persistence
- **Styling**: Tailwind CSS v4 with OKLCH design system
- **Icons**: Lucide React
- **UI Components**: Radix UI primitives & custom components

---

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   * Open `http://localhost:5173` in your browser.
   * Ensure the backend service is running on `http://127.0.0.1:8000`.

3. Type-check:
   ```bash
   npx tsc --noEmit
   ```

4. Production build:
   ```bash
   npm run build
   ```
