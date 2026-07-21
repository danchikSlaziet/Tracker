export default async function handler(req, res) {
  // Настройка заголовков CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-goog-api-client, x-goog-api-key'
  );

  // Возвращаем 200 на preflight OPTIONS-запросы
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Строим целевой URL на Google API
  // В Vercel оригинальный путь и query-параметры лежат в req.url (например: /v1beta/models/...)
  const targetUrl = new URL(req.url, 'https://generativelanguage.googleapis.com');

  // Копируем только те заголовки, которые нужны Google API
  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    const lKey = key.toLowerCase();
    if (
      lKey === 'content-type' ||
      lKey === 'user-agent' ||
      lKey.startsWith('x-goog-')
    ) {
      headers[lKey] = value;
    }
  }

  // Получаем тело запроса
  let body = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    // В Vercel Node.js рантайме тело req.body может быть объектом (распарсенным JSON),
    // либо буфером, либо строкой. Превращаем обратно в строку, если это объект.
    if (req.body) {
      if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
        body = JSON.stringify(req.body);
      } else {
        body = req.body;
      }
    }
  }

  try {
    const response = await fetch(targetUrl.toString(), {
      method: req.method,
      headers: headers,
      body: body,
    });

    const responseData = await response.text();

    // Пробрасываем обратно тип контента (например, application/json)
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    res.status(response.status).send(responseData);
  } catch (error) {
    console.error('Gemini Vercel Proxy Error:', error);
    res.status(500).json({ error: 'Proxy failed', message: error.message });
  }
}
