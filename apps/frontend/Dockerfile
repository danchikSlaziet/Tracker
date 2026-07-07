# Этап сборки React-приложения
FROM node:20-alpine AS builder
WORKDIR /app

# Передаем API URL бэкенда на этапе сборки (он запишется в бандл)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Передаем юзернейм Telegram бота
ARG VITE_TELEGRAM_BOT_USERNAME
ENV VITE_TELEGRAM_BOT_USERNAME=$VITE_TELEGRAM_BOT_USERNAME

# Копируем конфигурацию монорепозитория
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY packages/shared-types/package*.json ./packages/shared-types/

# Устанавливаем зависимости
RUN npm ci

# Копируем исходники фронтенда и общих типов
COPY apps/frontend ./apps/frontend
COPY packages/shared-types ./packages/shared-types

# Собираем статический продакшен-бандл
RUN npm run build --workspace=@finance/frontend

# Этап раздачи статики через Nginx
FROM nginx:stable-alpine

# Копируем скомпилированную статику из билдера во внутренний каталог Nginx
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# Копируем кастомный конфиг Nginx для правильной работы SPA-роутинга (React Router)
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
