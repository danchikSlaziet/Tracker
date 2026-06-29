// гарантирует TypeScript, что переменные не пустые.

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Отсутствует обязательная переменная окружения: ${name}`)
  }
  return value
}

export const config = {
  jwtSecret: requireEnv('JWT_SECRET'),
  databaseUrl: requireEnv('DATABASE_URL'),
  port: process.env.PORT,
}