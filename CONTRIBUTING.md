# Contributing Guidelines

Проект использует строгую модель ветвления (Git Flow). Прямые коммиты (direct push) в ветки `main` и `dev` запрещены на уровне репозитория.

## Архитектура веток

- `main` — production-среда. Содержит исключительно стабильный релизный код. Обновляется только через Pull Request из `dev`.
- `dev` — интеграционная среда (development). Базовая ветка для разработки. Все новые рабочие ветки отводятся строго от неё.

## Именование веток

Формат: `<type>/<task-name>`

Разрешенные префиксы (`type`):
- `feature/` — разработка новой функциональности.
- `fix/` — исправление ошибок (багфиксы).
- `refactor/` — изменение структуры кода без изменения бизнес-логики.
- `chore/` — рутинные задачи (настройка CI/CD, обновление зависимостей, конфиги).

*Пример:* `feature/transactions-e2e-tests`

## Именование коммитов

Проект придерживается стандарта [Conventional Commits](https://www.conventionalcommits.org/). Сообщения коммитов пишутся на английском языке.

Формат: `<type>: <description>`

*Примеры:*
- `feat: add robust transaction filtering`
- `fix: resolve race condition in auth flow`
- `test: implement playwright e2e coverage`
- `chore: configure vitest ui`

## Процесс работы (Workflow)

1. Обновление локальной интеграционной ветки:
   ```bash
   git checkout dev
   git pull origin dev
   ```
2. Создание рабочей ветки:
   ```bash
   git checkout -b feature/task-name
   ```
3. Разработка и локальное тестирование (линтеры, юнит-тесты).
4. Пуш рабочей ветки в удаленный репозиторий:
   ```bash
   git push origin feature/task-name
   ```
5. Создание Pull Request (PR) из рабочей ветки в `dev` на GitHub.
6. Ожидание успешного прохождения пайплайнов CI (lint, test, build).
7. Слияние (Merge) PR в `dev`.
