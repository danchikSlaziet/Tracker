import crypto from 'crypto'
import type { TelegramAuthData } from '@finance/shared-types'

const MAX_AUTH_AGE_SECONDS = 300 // 5 минут — защита от replay-атак (повторной отправки перехваченных данных)

export function verifyTelegramHash(data: TelegramAuthData, botToken: string): boolean {
  const { hash, ...rest } = data


  const dataCheckString = Object.keys(rest)
    .sort()
    .map(key => `${key}=${rest[key as keyof typeof rest]}`)
    .filter(pair => !pair.endsWith('=undefined')) // исключаем поля, которых нет (например, username или last_name)
    .join('\n')

  // генерим секретный ключ от нашего бота
  const secretKey = crypto
    .createHash('sha256')
    .update(botToken)
    .digest()

  // генерим ключ от data_check_string 
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')

  // timingSafeEqual вместо "===", чтобы защитить сервер от timing-атак (атак по времени)
  const isHashValid = crypto.timingSafeEqual(
    Buffer.from(computedHash, 'hex'),
    Buffer.from(hash, 'hex')
  )

  const currentTime = Math.floor(Date.now() / 1000)
  const isNotExpired = (currentTime - data.auth_date) < MAX_AUTH_AGE_SECONDS

  return isHashValid && isNotExpired
}