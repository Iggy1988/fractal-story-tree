export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  // ---- usage log (cheap, immediate) ----
  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    ip: req.headers['x-forwarded-for'] || 'unknown',
    ua: req.headers['user-agent'],
    promptLength: prompt.length,
    endpoint: 'expand'
  }));

  // ---- OpenAI call ----
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      input: prompt,
      max_output_tokens: 200,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const text = await response.text();
    return res.status(500).json({ error: text });
  }

  const data = await response.json();
  res.json(JSON.parse(data.output_text));
}
