# Cabinet Medical Frontend

React frontend foundation for the PT28 medical cabinet application.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- React Router
- TanStack Query + Axios
- React Hook Form + Zod
- Lucide icons + Sonner toasts
- Vitest + Testing Library
- OpenAPI TypeScript generation

## Start locally

The Spring Boot backend must run on `http://localhost:8080`.

```bash
npm install
npm run api:types
npm run dev
```

Open `http://localhost:5173`. During development, Vite proxies `/api` to the
backend, so local frontend requests do not require backend CORS changes.

Copy `.env.example` to `.env` only when you need to override the defaults.

## Commands

```bash
npm run dev          # development server
npm run api:types    # regenerate types from ../backend/openapi.json
npm run test         # unit/component tests
npm run lint         # ESLint
npm run format       # Prettier + Tailwind class sorting
npm run build        # production build
npm run check        # full local quality gate
```

## Source structure

```text
src/
├── app/             # global providers
├── lib/api/         # Axios client and API errors
├── lib/auth/        # JWT session storage
├── lib/query/       # TanStack Query configuration
├── lib/utils/       # shared utilities
├── pages/           # route-level screens
├── test/            # test setup
└── types/           # app and generated OpenAPI types
```

`src/types/api.d.ts` is generated from the backend OpenAPI contract. Regenerate
it whenever backend endpoints or DTOs change.
