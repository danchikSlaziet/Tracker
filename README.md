# Finance Tracker

Full-stack приложение для учёта личных финансов. Разработано в формате монорепозитория. 

## Возможности

- **Аутентификация**: Регистрация и вход с использованием JWT (хранится в httpOnly cookies). Хеширование паролей (bcrypt).
- **Транзакции**: Добавление, редактирование и удаление доходов и расходов.
- **Управление категориями**: Создание пользовательских категорий с кастомным цветом и иконкой.
- **Аналитика**: Отрисовка графиков расходов по категориям с помощью Recharts.
- **Фильтрация и поиск**: Поиск по описанию транзакции (debounce), фильтрация по дате, типу и категории.
- **Интерфейс**: Поддержка светлой и тёмной темы. Оптимистичные UI-обновления.

## Технологический стек

Проект организован с использованием npm workspaces.

### Frontend
- React 19, Vite
- TypeScript
- Архитектура FSD
- TanStack Query v5
- Zustand
- React Hook Form + Zod
- Recharts
- CSS Modules

### Backend
- Node.js, Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod
- express-rate-limit, cors, helmet

## Архитектура проекта

Фронтенд структурирован по методологии **Feature-Sliced Design (FSD)**:
- `app/` — Инициализация приложения, роутинг, глобальные провайдеры.
- `pages/` — Страницы приложения (композиция из виджетов и фичей).
- `widgets/` — Самостоятельные ui-блоки (например, Layout).
- `features/` — Пользовательские сценарии (авторизация, управление транзакциями).
- `entities/` — Бизнес-сущности (Транзакция, Категория).
- `shared/` — Переиспользуемый код (UI-кит, API-клиент, хелперы).

Типы, общие для фронтенда и бэкенда, вынесены в `packages/shared-types`.

## Локальный запуск

### 1. Установка зависимостей
```bash
npm install
```

### 2. Переменные окружения
Создайте файлы `.env` на основе предоставленных примеров.

Бэкенд (`apps/backend/.env`):
```env
DATABASE_URL="postgresql://login:password@localhost:5432/finance_tracker?schema=public"
JWT_SECRET="secret"
PORT=3000
```

Фронтенд (`apps/frontend/.env`):
```env
VITE_API_URL=http://localhost:3000
```

### 3. База данных
Для быстрого запуска PostgreSQL вы можете использовать Docker (в корне проекта уже есть файл `docker-compose.yml`):
```bash
docker compose up -d
```

После того как контейнер запустится, примените миграции. Если базы данных с именем `finance_tracker` ещё нет, Prisma спросит разрешения создать её (нужно ответить `Y` в терминале):
```bash
cd apps/backend
npx prisma migrate dev
```

Обязательно сгенерируйте Prisma Client (TypeScript-типы базы данных):
```bash
npx prisma generate
```

### 4. Запуск
Запустите оба приложения:

Терминал 1:
```bash
npm run dev --workspace=apps/backend
```

Терминал 2:
```bash
npm run dev --workspace=apps/frontend
```
