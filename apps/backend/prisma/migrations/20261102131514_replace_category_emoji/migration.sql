UPDATE "categories"
SET "icon" = CASE "icon"
  WHEN '🛒' THEN 'groceries'
  WHEN '🚌' THEN 'transport'
  WHEN '💰' THEN 'salary'
  WHEN '🍿' THEN 'entertainment'
  WHEN '💸' THEN 'transfers'
  WHEN '📁' THEN 'uncategorized'
  WHEN '📦' THEN 'other'
  WHEN '🔄' THEN 'other'
  ELSE 'other'
END
WHERE "icon" NOT IN (
  'groceries', 'transport', 'salary', 'entertainment', 'transfers',
  'uncategorized', 'other', 'food', 'coffee', 'car', 'fuel', 'home',
  'rent', 'utilities', 'health', 'pharmacy', 'gifts', 'travel',
  'clothes', 'tech', 'education', 'sport', 'pets', 'kids',
  'subscriptions', 'taxes', 'savings', 'freelance', 'beauty', 'music'
);