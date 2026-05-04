// Vercel Serverless Function: /api/generate
// Hält den Anthropic API Key server-side. Browser sieht ihn nie.

export const config = {
  maxDuration: 60, // bis zu 60s für KI-Antworten
};

export default async function handler(req, res) {
  // CORS für eigene Domain (passe an wenn du Custom Domain hast)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // API-Key aus Environment Variable (NICHT im Code!)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY environment variable not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const { model, messages, max_tokens } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Optional: Größenlimit für Bilder (verhindert Missbrauch)
    const bodyString = JSON.stringify(req.body);
    if (bodyString.length > 15 * 1024 * 1024) { // 15 MB
      return res.status(413).json({ error: 'Bild zu groß. Maximal 10 MB.' });
    }

    // Anthropic API Call
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-6',
        max_tokens: max_tokens || 1500,
        messages: messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      // Anthropic-Fehler durchreichen, aber Key-Details rausfiltern
      return res.status(response.status).json({
        error: data.error?.message || 'API request failed',
        type: data.error?.type,
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
}
