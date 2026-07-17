import { defineConfig } from "steiger";
import fsd from "@feature-sliced/steiger-plugin";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      // отключаем только предупреждение о малоиспользуемых слайсах (гемор выносить фичи в виджеты => потом обратно в фичу выносить скорее всего)
      "fsd/insignificant-slice": "off",
    },
  },
]);