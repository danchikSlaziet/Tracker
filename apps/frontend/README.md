# @finance/frontend

SPA Finance Tracker. Сборка на Vite, страницы на React Router, слои FSD: `app`, `pages`, `widgets`, `features`, `entities`, `shared`. Общие кнопки и поля берутся из `@finance/ui-kit`, типы запросов из `@finance/shared-types`.

Как поднять базу, бэкенд и `.env`, написано в корневом README. Фронтенд сам по себе слушает порт 5173 и ходит в API по `VITE_API_URL`.

Из корня репозитория:

```bash
npm run dev --workspace=@finance/frontend
npm run test --workspace=@finance/frontend -- --run
npm run test:e2e --workspace=@finance/frontend
npm run lint --workspace=@finance/frontend
npm run typecheck --workspace=@finance/frontend
```

`test` без `-- --run` остаётся в режиме наблюдения. E2E не поднимает серверы сам: нужны уже запущенные фронтенд на порту 5173 и бэкенд на порту 3000. `lint` включает Steiger.
