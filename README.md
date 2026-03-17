# Xcel Locksmith

Full-stack locksmith business web app for Cleveland, OH.

## Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend/CMS:** Payload CMS (Next.js) + PostgreSQL

## Structure

```
├── src/                  # React frontend (Vite)
├── apps/cms/             # Payload CMS backend
└── packages/shared/      # Shared types
```

## Getting Started

### Frontend
```bash
npm install
npm run dev
```

### CMS
```bash
cd apps/cms
npm install
npm run dev
```

## Environment Variables

Copy `apps/cms/.env.example` to `apps/cms/.env` and fill in your values.

## Deployment

See `DEPLOYMENT.md` for full deployment instructions.
