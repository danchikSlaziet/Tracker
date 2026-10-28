FROM node:20-alpine
WORKDIR /app

# Копируем файлы конфигурации монорепозитория
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/shared-types/package*.json ./packages/shared-types/

# Устанавливаем все зависимости (включая devDependencies, так как нам нужны tsx и prisma)
RUN npm ci

# Копируем исходный код бэкенда и общих типов
COPY apps/backend ./apps/backend
COPY packages/shared-types ./packages/shared-types

# Генерируем Prisma Client
RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma

EXPOSE 3000
ENV NODE_ENV=production

# При запуске контейнера заходим в директорию бэкенда (чтобы Prisma видела свой config), накатываем миграции БД и запускаем
CMD ["sh", "-c", "cd apps/backend && npx prisma migrate deploy && npx tsx src/index.ts"]
