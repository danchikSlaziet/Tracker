# @finance/ui-kit

Общие компоненты фронтенда: `Button`, `Input`, `Avatar`, `ThemeToggle`, `PageLoader`, `OtpInput`. Фронтенд импортирует их из `@finance/ui-kit`.

Из корня репозитория:

```bash
npm run storybook --workspace=@finance/ui-kit
npm run test --workspace=@finance/ui-kit
npm run test:ui --workspace=@finance/ui-kit
```

Storybook открывается на порту 6006. В историях есть `play`. `test` гоняет Vitest один раз. Снапшоты сравнивают HTML компонента, не скриншот экрана.
