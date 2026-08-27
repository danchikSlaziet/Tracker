export default async function handler(req, res) {
  // Настройка заголовков CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Authorization, Content-Type, Accept, X-Requested-With'
  );

  // Возвращаем 200 на preflight OPTIONS-запросы
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // URL на Groq API
  const targetUrl = new URL(req.url, 'https://api.groq.com');

  // Копируем нужные заголовки для Groq API
  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    const lKey = key.toLowerCase();
    if (
      lKey === 'content-type' ||
      lKey === 'authorization' ||
      lKey === 'user-agent' ||
      lKey === 'accept'
    ) {
      headers[lKey] = value;
    }
  }

  // Получаем тело запроса
  let body = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
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

    // Пробрасываем заголовки ответа (включая text/event-stream при стриминге)
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    // Если это стриминг SSE — перенаправляем поток напрямую
    if (response.body) {
      const reader = response.body.getReader();
      res.status(response.status);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } else {
      const responseData = await response.text();
      res.status(response.status).send(responseData);
    }
  } catch (error) {
    console.error('Groq Vercel Proxy Error:', error);
    res.status(500).json({ error: 'Proxy failed', message: error.message });
  }
}