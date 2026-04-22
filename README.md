# Efren Billiards & Events — Doha, Qatar 🎱🎯♟️

A premium, state-of-the-art web application built for **Efren Billiards & Events**. This platform combines high-end aesthetics with powerful tournament management and content control systems.

## 🚀 Key Features

- 🏆 **Professional Bracket System** — Advanced tournament visualizer with **dynamic elimination logic**. Advance winners and manage match outcomes directly from the admin panel.
- 🛠️ **Custom Admin CMS** — A full-scale management suite. Control pricing, site text, tournament brackets, image galleries, and user membership levels without touching code.
- � **Dynamic Budget Estimator** — Real-time event cost calculator for the Premium Event Place, with base prices adjustable via the CMS.
- 📊 **Live Leaderboards** — Separate ranking systems for Billiards, Darts, and Chess synced with a Supabase PostgreSQL backend.
- 🛡️ **Role-Based Security** — Secure authentication system distinguishing between Guests, Players, and Administrators.
- � **Premium UI/UX** — Modern, glassmorphic design featuring smooth animations (Framer Motion) and responsive layouts for mobile/desktop.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide icons.
- **Backend**: Supabase (Postgres, Auth, Storage).
- **Animations**: Framer Motion for ultra-smooth transitions.
- **State Management**: Context API for global Authentication and UI state.

## 💻 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- Supabase Project (for live data features)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from `.env.example` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_NOQOODYPAY_USERNAME=your_noqoodypay_username
   VITE_NOQOODYPAY_PASSWORD=your_noqoodypay_password
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

- `/components`: Reusable UI elements and modular page sections.
- `/components/admin`: Specialized modules for the CMS.
- `/contexts`: Global state providers (Authentication).
- `/lib`: Helper utilities and Supabase client library.
- `/supabase`: SQL migrations and schema definitions for the database.
- `/types`: TypeScript interfaces for database consistency.
