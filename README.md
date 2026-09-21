# CivicEye 👁️

> A community-driven civic engagement platform that empowers volunteers and staff to report issues, manage field tasks, earn rewards, and strengthen local communities — all in one app.

---

## 📋 Short Description

CivicEye is a mobile-first web application that bridges the gap between community volunteers and municipal/organizational staff. Volunteers can report civic issues, join field tasks, earn Civic Points, and redeem rewards. Operators accept reports, submit photo proof of the finished work, get paid automatically, and can volunteer in community projects — all through a clean, role-based interface.

---

## ✨ Main Features

### 👤 Volunteer Features
- **Report Issues** — Submit civic reports (e.g., trash piles, illegal dumping) with a photo and a free-text description in the citizen's own words
- **Community Forum** — Browse, post, and engage in community discussions with upvoting
- **Field Tasks** — Browse and claim volunteer tasks posted by staff; complete tasks to earn Civic Points
- **Civic Points & Rewards** — Earn points for completing tasks and redeeming them in the store for rewards
- **Home Dashboard** — View personal stats, active tasks, transaction history, and recent activity
- **Community Page** — Explore community projects, proposals, and updates

### 🛡️ Operator (Staff) Features
- **Home** — Summary of open reports and the operator's wallet balance
- **Report Inbox** — Accept a report, submit a completion report (photo + description), and get paid automatically; finished jobs show as a short history of the latest 5
- **Forum Aksi** — Volunteer to join citizens' community projects

### 🔐 Authentication
- Role-based access control (Volunteer vs. Staff)
- Secure sign-in with email and password via InsForge Auth

---

## 🛠️ Technologies Used

| Layer | Technology |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) with TypeScript |
| **Build Tool** | [Vite 6](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Backend / Database** | [InsForge](https://insforge.dev) (Postgres-based BaaS) |
| **Auth** | InsForge Auth (email/password, RLS policies) |
| **File Storage** | InsForge Storage (report photo uploads) |
| **SDK** | `@insforge/sdk` |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 🚀 How to Run the App

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher
- An [InsForge](https://insforge.dev) project (for the backend)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/CivicEye.git
cd CivicEye
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root of the project:

```env
VITE_SUPABASE_URL=https://your-project-id.ap-southeast.insforge.app
VITE_SUPABASE_ANON_KEY=your-insforge-anon-key
```

> ⚠️ **Never commit `.env.local` to version control.** It is already listed in `.gitignore`.

You can find your project URL and anon key in your InsForge project settings.

### 4. Run the Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 5. Build for Production
```bash
npm run build
```

The production-ready files will be output to the `dist/` folder.

### 6. Deploy to Vercel

When deploying to Vercel, add the environment variables in your **Vercel Project Settings → Environment Variables**:

| Variable Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your InsForge project URL |
| `VITE_SUPABASE_ANON_KEY` | Your InsForge anon key |

> ℹ️ Vite exposes env variables prefixed with `VITE_` to the client. Use the exact variable names as defined in your code (e.g., `VITE_SUPABASE_URL`, not `VITE_VITE_SUPABASE_URL`).

---

## 📁 Project Structure

```
CivicEye/
├── src/
│   ├── components/        # Reusable UI components (LoginScreen, BottomNav, etc.)
│   ├── context/           # React context for global app state (AppContext)
│   ├── pages/             # Page-level components
│   │   ├── HomePage.tsx
│   │   ├── ReportPage.tsx
│   │   ├── CommunityPage.tsx
│   │   ├── ForumPage.tsx
│   │   ├── StorePage.tsx
│   │   └── staff/         # Staff-only pages
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions & InsForge client setup
│   └── styles/            # Global and component styles
├── public/                # Static assets
├── .env.local             # Environment variables (not committed)
├── supabase_schema.sql    # Database schema reference
└── vite.config.ts         # Vite configuration
```

---

## 👥 Team

Developed as part of a **Software Engineering** course project — Semester 4.
