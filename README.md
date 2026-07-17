# KEE — Duplicate Key Shop Management Platform

KEE is a multi-tenant SaaS platform for duplicate-key/locksmith shops. It lets a **Super Admin** onboard and manage shops across a network, while each **Shop Admin** manages their own customers, master keys, products, promotions, and reports — all backed by a single shared database with strict tenant isolation.

## Tech Stack

**Backend** — NestJS (TypeScript), Prisma ORM, PostgreSQL, JWT auth, MinIO (S3-compatible object storage) for document uploads.

**Frontend** — React 18 + Vite, Tailwind CSS.

**Infrastructure** — Docker Compose (PostgreSQL + MinIO) for local development.

## Project Structure

```
kee/
├── backend/          NestJS API
│   ├── src/
│   │   ├── auth/         Login, OTP, password reset, self-registration
│   │   ├── shop/         Shop admin: customers, settings, dashboard, reports
│   │   ├── tenant/       Multi-tenant Prisma scoping
│   │   ├── customer/     Customer records & documents
│   │   ├── key/          Master key catalog
│   │   ├── product/      Product catalog
│   │   ├── promotion/    Cross-shop ads/offers marketplace
│   │   ├── notification/ In-app notifications
│   │   ├── report/       Shop reporting
│   │   ├── crypto/       Encryption helpers
│   │   ├── common/       Shared guards, decorators, filters
│   │   └── ad/           Advertisement management
│   └── prisma/       Schema & migrations
├── frontend/         React SPA
│   └── src/
│       ├── components/   UI components
│       ├── context/      Auth/global state (AuthContext)
│       └── styles/
└── docker-compose.yml  Postgres + MinIO for local dev
```

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose

### 1. Start infrastructure

```bash
docker-compose up -d
```

This starts PostgreSQL (port `5435`) and MinIO (ports `9000`/`9001`).

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env   # then fill in real secrets
npm run prisma:migrate
npm run start:dev
```

The API runs on `http://localhost:4000` by default (see `PORT` in `.env`).

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

See `backend/.env.example` for the full list, including `DATABASE_URL`, `JWT_SECRET`, `ENCRYPTION_KEY`, and MinIO credentials. **Never commit a real `.env` file** — it's already excluded via `.gitignore`.

## Roles

- **SUPER_ADMIN** — manages shops, subscriptions, global key catalog, revenue, and moderates the cross-shop promotions feed.
- **SHOP_ADMIN** — manages their own customers, shop-scoped keys, products, promotions, and documents.

## Testing

```bash
cd backend
npm test          # unit tests
npm run test:e2e  # end-to-end tests
```

## License

Private / unlicensed — internal project.
