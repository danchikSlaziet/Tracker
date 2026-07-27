# Finance Tracker

Full-stack монорепозиторий для учёта личных финансов. Проект разработан с использованием архитектурного подхода Feature-Sliced Design (FSD), типом-безопасными контрактами между клиентом и сервером и полным циклом автоматизированного тестирования.

## Основной функционал

### Аутентификация и безопасность
- **Аутентификация**: Вход по Email с обязательным подтверждением через 6-значный OTP-код (интеграция с Resend).
- **Авторизация через Telegram**: Вход в 1 клик с помощью Telegram Login Widget и серверной верификацией подписи HMAC-SHA256.
- **Безопасность токенов**: Хранение JWT исключительно в `httpOnly` и `sameSite` куках.
- **Защита бэкенда**: Хеширование паролей с помощью bcrypt (12 раундов), использование Helmet (Security Headers), строго настроенный CORS и Rate Limiting для чувствительных роутов.

### ИИ-анализ и WebSockets
- **Парсинг выписок**: Автоматический разбор банковских PDF-выписок (Т-Банк, Сбербанк, Альфа-Банк) с использованием Google Gemini Flash API и структурированного вывода в JSON.
- **Real-time уведомления**: Трансляция текущего статуса обработки PDF-выписки на клиент через WebSockets (Socket.io) без необходимости опрашивать сервер.

### Финансы и аналитика
- **Управление операциями**: Создание, редактирование, мягкое удаление (soft delete) и фильтрация доходов и расходов.
- **Управление категориями**: Настройка пользовательских категорий с выбором иконок, цвета и привязки к типам операций.
- **Интерактивный поиск**: Фильтрация списка транзакций с задержкой ввода (debounce 400ms).
- **Визуализация**: Аналитические диаграммы распределения расходов по категориям (Recharts).
- **Оптимистичный UI**: Мгновенный отклик интерфейса при операциях благодаря TanStack Query.

---

## Архитектура и структура монорепозитория

Проект организован с использованием **npm workspaces**:

- `apps/frontend` — Клиентское одностраничное приложение (SPA).
- `apps/backend` — REST API и WebSocket сервер.
- `packages/shared-types` — Единый источник правды для TypeScript-типов, DTO и интерфейсов.
- `packages/ui-kit` — Выделенная библиотека базовых UI-компонентов.

### Feature-Sliced Design (FSD)
Слои клиентского приложения строго изолированы со следующей иерархией (снизу вверх):
- `shared/` — Инфраструктурный код (httpClient, утилиты, общие конфиги).
- `entities/` — Бизнес-сущности приложения (пользователь, транзакция, категория).
- `features/` — Пользовательские действия (авторизация, добавление транзакций, импорт выписок).
- `widgets/` — Крупные независимые блоки интерфейса.
- `pages/` — Композиция страниц приложения.
- `app/` — Инициализация приложения, провайдеры контекста и роутинг.

Соблюдение архитектурных правил FSD и отсутствия циклических импортов проверяется автоматическим линтером **Steiger**.

### Архитектурные решения (ADR)
Ключевые технические решения задокументированы в формате [Architecture Decision Records](docs/adr/):
- [ADR 0001: Запись архитектурных решений](docs/adr/0001-record-architecture-decisions.md)
- [ADR 0002: Архитектурный подход FSD](docs/adr/0002-feature-sliced-design.md)
- [ADR 0003: Хранение JWT в httpOnly cookies](docs/adr/0003-jwt-in-httponly-cookies.md)
- [ADR 0004: Монорепозиторий и общие типы](docs/adr/0004-monorepo-structure-npm-workspaces.md)
- [ADR 0005: ИИ-парсинг PDF и WebSockets](docs/adr/0005-ai-pdf-parsing-gemini-and-websockets.md)
- [ADR 0006: Стратегия тестирования](docs/adr/0006-testing-strategy-vitest-and-playwright.md)

---

## Технологический стек

### Frontend
- **Core**: React 19, TypeScript, Vite
- **State Management**: TanStack Query v5 (серверный стейт и кэш), Zustand (клиентский UI-стейт)
- **Forms & Validation**: React Hook Form, Zod
- **Styling**: CSS Modules, Vanilla CSS (Design Tokens, Dark/Light theme)
- **Visualization**: Recharts

### Backend
- **Core**: Node.js, Express.js, TypeScript
- **Database & ORM**: PostgreSQL, Prisma ORM
- **Real-time & AI**: Socket.io, Google Gemini 1.5/2.5 Flash API
- **Email**: Resend API
- **Security**: bcrypt, Helmet.js, express-rate-limit, cors

### Testing & Tooling
- **Unit & Integration**: Vitest, React Testing Library
- **E2E Testing**: Playwright (Desktop & Mobile viewports)
- **Code Quality**: ESLint, Steiger (FSD Linter)

---

## Локальный запуск

### 1. Установка зависимостей
```bash
npm install
```

### 2. Переменные окружения
Создайте файлы `.env` в папках `apps/backend` и `apps/frontend` на основе примеров.

`apps/backend/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finance_tracker?schema=public"
JWT_SECRET="your_jwt_secret_key"
PORT=3000
RESEND_API_KEY="your_resend_api_key"
CORS_ORIGIN="http://localhost:5173"
GEMINI_API_KEY="your_gemini_api_key"
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
```

`apps/frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_TELEGRAM_BOT_USERNAME=your_bot_username
```

### 3. База данных
Для запуска PostgreSQL используется Docker:
```bash
docker compose up -d
```

Применение миграций и генерация Prisma Client:
```bash
cd apps/backend
npx prisma migrate dev
npx prisma generate
cd ../..
```

> **Примечание**: Если при выполнении `npx prisma migrate dev` возникает ошибка рассинхронизации локальной базы данных, сбросьте состояние БД командой `npx prisma migrate reset`.

### 4. Запуск приложений
Запуск бэкенда и фронтенда в режиме разработки:

Сервер:
```bash
npm run dev --workspace=apps/backend
```

Клиент:
```bash
npm run dev --workspace=apps/frontend
```

Приложение будет доступно по адресу: `http://localhost:5173`.

---

## Тестирование и линтинг

Запуск юнит и интеграционных тестов:
```bash
npm run test --workspace=apps/frontend
```

Запуск E2E тестов Playwright:
```bash
npm run test:e2e --workspace=apps/frontend
```

Запуск линтеров (ESLint + Steiger FSD Linter):
```bash
npm run lint --workspace=apps/frontend
```
