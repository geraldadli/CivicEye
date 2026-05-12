# CivicEye Frontend

CivicEye is a React + TypeScript + Vite frontend project using Tailwind CSS for styling.

---

# Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React Icons

---

# Project Structure

src/
├── App.tsx
├── main.tsx
│
├── styles/
│   └── global.css
│
├── components/
│   ├── BottomNav.tsx
│   └── common/
│       ├── AppButton.tsx
│       ├── ProgressBar.tsx
│       ├── SectionCard.tsx
│       └── StatusPill.tsx
│
├── pages/
│   ├── HomePage.tsx
│   ├── ReportPage.tsx
│   ├── ForumPage.tsx
│   ├── CommunityPage.tsx
│   └── StorePage.tsx
│
├── types/
│   └── civiceye.ts
│
└── utils/
    ├── format.ts
    └── ranks.ts

---

# Folder Explanation

## pages/
Contains full screens/pages.

- HomePage → Dashboard
- ReportPage → Reporting system
- ForumPage → Community forum
- CommunityPage → Operator/Gig dashboard
- StorePage → Rewards marketplace

Modify here when changing page layout or page-specific logic.

---

## components/
Reusable UI components.

### common/
Shared reusable components:
- AppButton
- ProgressBar
- SectionCard
- StatusPill

Modify here for reusable UI changes.

---

## types/
Contains shared TypeScript interfaces and types.

Example:
- BottomTab
- Task
- Voucher
- ReportStatus

---

## utils/
Helper functions.

- ranks.ts → gamification logic
- format.ts → formatting helpers

---

## styles/global.css
Global styling and Tailwind imports.

Do not place page-specific styles here.

---

# Navigation

Navigation is controlled inside:

App.tsx

Only one page renders at a time using:

```tsx
const [tab, setTab] = useState<BottomTab>("home");