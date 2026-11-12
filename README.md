# Finance Tracker

[![CI](https://github.com/danchikSlaziet/Tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/danchikSlaziet/Tracker/actions/workflows/ci.yml)

Учёт личных доходов и расходов. Фронтенд, бэкенд и общие типы лежат в одном репозитории.

Рабочий стенд: [finance67.ru](https://finance67.ru)

## Что есть в приложении

Регистрация по почте с шестизначным кодом через Resend. На экране входа есть демо: каждый заход создаёт своего пользователя с примерными операциями. Ассистент и импорт PDF в демо отвечают 403.

Вход через Telegram на бэкенде есть, кнопка в интерфейсе убрана.

Сессия хранится в httpOnly-куке. Пароли хешируются bcrypt, на API стоят Helmet и лимиты запросов.

Операции можно добавить, изменить, удалить и отфильтровать. Удаление операции стирает строку. У категории мягкое удаление: строка остаётся с `isDeleted`. Список операций догружается при прокрутке. Поиск ждёт паузу во вводе. Расходы по категориям показаны диаграммой.

Ассистент ходит в Groq, модель `qwen/qwen3.8-27b`. Суммы считает PostgreSQL через четыре инструмента, в промпт вся таблица не кладётся. Ответ приходит частями по SSE, пока модель его пишет.

PDF-выписку разбирает Gemini, модель `gemini-2.5-flash`. Пока запрос импорта не закончился, прогресс приходит по Socket.io.

## Как устроен репозиторий

npm workspaces:

- `apps/frontend` — SPA
- `apps/backend` — API и Socket.io
- `packages/shared-types` — общие типы
- `packages/ui-kit` — кнопки и прочие базовые компоненты, Storybook

Фронтенд разложен по FSD: `shared`, `entities`, `features`, `widgets`, `pages`, `app`. Импорты между слоями проверяет Steiger.

Решения, которые уже не хочется восстанавливать по коду, лежат в [docs/adr](docs/adr):

- [1. Формат ADR](docs/adr/0001-record-architecture-decisions.md)
- [2. FSD](docs/adr/0002-feature-sliced-design.md)
- [3. JWT в httpOnly-куке](docs/adr/0003-jwt-in-httponly-cookies.md)
- [4. Монорепозиторий и shared-types](docs/adr/0004-monorepo-structure-npm-workspaces.md)
- [5. Импорт PDF](docs/adr/0005-ai-pdf-parsing-gemini-and-websockets.md)
- [6. Тесты](docs/adr/0006-testing-strategy-vitest-and-playwright.md)
- [7. Ассистент](docs/adr/0007-ai-assistant-agentic-loop-and-sse.md)
- [8. Демо-вход](docs/adr/0008-demo-login-without-ai.md)

## Стек

Фронтенд: React 19, TypeScript, Vite, TanStack Query, Zustand, React Hook Form, Zod, CSS Modules, Recharts.

Бэкенд: Node.js 22, Express, PostgreSQL, Prisma, Socket.io, Groq SDK, Gemini, Resend.

Тесты: Vitest, React Testing Library, Playwright. Линт: ESLint и Steiger.

## Локальный запуск

Нужны Node.js 22, npm и запущенный Docker.

```bash
npm install
```

Скопируй примеры и замени в них пустые значения.

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

В `apps/backend/.env` для локальной базы поставь:

```env
DATABASE_URL="postgresql://login:password@localhost:5432/finance_tracker?schema=public"
JWT_SECRET="local-dev-secret"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
GEMINI_MODEL="gemini-2.5-flash"
```

Пустой `JWT_SECRET` не даст серверу стартовать. На проде секрет должен быть не короче 32 символов, локально хватает любой непустой строки.

Без ключей ниже сервер всё равно стартует, и демо-вход открывается.

- `RESEND_API_KEY` отправляет письмо с кодом регистрации. Без него регистрация создаст пользователя, но письмо не уйдёт.
- `GEMINI_API_KEY` нужен для импорта PDF. Без ключа импорт вернёт ошибку.
- `GROQ_API_KEY` нужен для ассистента. Без ключа запрос к Groq не пройдёт.
- `TELEGRAM_BOT_TOKEN` нужен только для входа через Telegram. Кнопки в интерфейсе нет. Если токен пустой, этот вход отвечает 503.

`GEMINI_API_BASE_URL` и `GROQ_API_BASE_URL` — не ключи. Это адрес сервера, который принимает запрос вместо официального API. Оставь их пустыми: клиенты пойдут на адреса Gemini и Groq по умолчанию. Свой адрес пиши только если до этих API нет прямого доступа и запрос идёт через прокси.

В `apps/frontend/.env`:

```env
VITE_API_URL="http://localhost:3000/api"
```

`VITE_SENTRY_DSN` и `SENTRY_AUTH_TOKEN` для локального запуска не нужны.

Подними только Postgres. `docker compose up -d` без имени сервиса соберёт ещё и контейнеры приложения и займёт порт 3000.

```bash
docker compose up -d db
```

Пользователь, пароль и имя базы в этой команде берутся из значений по умолчанию в `docker-compose.yml`: `login`, `password`, `finance_tracker`. Они должны совпасть с `DATABASE_URL`.

Миграции из каталога бэкенда. `prisma migrate dev` заодно генерирует клиент.

```bash
cd apps/backend
npx prisma migrate dev
cd ../..
```

Если локальная база разошлась с историей миграций, из `apps/backend`: `npx prisma migrate reset`.

Два терминала:

```bash
npm run dev --workspace=@finance/backend
npm run dev --workspace=@finance/frontend
```

Приложение: [http://localhost:5173](http://localhost:5173).

Storybook ui-kit:

```bash
npm run storybook --workspace=@finance/ui-kit
```

Он откроется на [http://localhost:6006](http://localhost:6006).

## Проверки

Юнит-тесты, линт и typecheck базы не требуют. E2E ждёт уже запущенные фронтенд на порту 5173 и бэкенд на порту 3000. Своих серверов Playwright не поднимает.

```bash
npm run test --workspace=@finance/frontend
npm run test:e2e --workspace=@finance/frontend
npm run lint --workspace=@finance/frontend
npm run typecheck --workspace=@finance/backend
npm run test --workspace=@finance/ui-kit
```

Тесты фронтенда в режиме Vitest watch. Для одного прогона добавь `-- --run`. E2E гоняет Playwright в Chromium, Firefox, WebKit, Mobile Chrome и Mobile Safari.

Интерфейс Vitest и интерфейс Playwright:

```bash
npm run test:ui --workspace=@finance/frontend
npm run test:e2e:ui --workspace=@finance/frontend
```
