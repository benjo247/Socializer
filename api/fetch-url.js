// Vercel Serverless Function: /api/fetch-url
// Fetcht eine Webseite server-side (kein CORS-Problem) und gibt sauberen Text zurück.

export const config = {
  maxDuration: 20,
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL fehlt' });
    }

    // Validate URL
    let parsed;
    try {
      parsed = new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'Ungültige URL' });
    }

    // Only allow http/https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ error: 'Nur HTTP/HTTPS URLs erlaubt' });
    }

    // Block private/local IPs (basic SSRF protection)
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('172.17.') ||
      hostname.startsWith('172.18.') ||
      hostname.startsWith('172.19.') ||
      hostname.startsWith('172.2') ||
      hostname.startsWith('172.30.') ||
      hostname.startsWith('172.31.') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    ) {
      return res.status(400).json({ error: 'Lokale/private URLs nicht erlaubt' });
    }

    // Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let response;
    try {
      response = await fetch(parsed.href, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SocialaizaBot/1.0; +https://socialaiza.app)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'de-DE,de;q=0.9,en;q=0.5',
        },
        redirect: 'follow',
      });
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        return res.status(408).json({ error: 'Timeout — Webseite reagiert zu langsam' });
      }
      return res.status(502).json({ error: 'Webseite konnte nicht geladen werden: ' + err.message });
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Webseite antwortete mit Status ${response.status}`
      });
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain') && !contentType.includes('application/xhtml')) {
      return res.status(415).json({ error: 'URL liefert kein HTML/Text (Content-Type: ' + contentType + ')' });
    }

    // Read with size limit (2 MB)
    const MAX_SIZE = 2 * 1024 * 1024;
    const reader = response.body.getReader();
    const chunks = [];
    let receivedLength = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      receivedLength += value.length;
      if (receivedLength > MAX_SIZE) {
        reader.cancel();
        return res.status(413).json({ error: 'Webseite zu groß (max. 2 MB)' });
      }
      chunks.push(value);
    }

    const buffer = new Uint8Array(receivedLength);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }

    const html = new TextDecoder('utf-8', { fatal: false }).decode(buffer);

    // Extract title and description
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? decodeEntities(titleMatch[1].trim()) : '';

    const descMatch = html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)
      || html.match(/<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
    const description = descMatch ? decodeEntities(descMatch[1].trim()) : '';

    // Extract og:* meta
    const ogTitle = html.match(/<meta\s+[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
    const ogDesc = html.match(/<meta\s+[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);

    // Strip scripts, styles, comments
    let text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<head[\s\S]*?<\/head>/gi, ' ')
      .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
      .replace(/<footer[\s\S]*?<\/footer>/gi, ' ');

    // Replace block elements with newlines for structure
    text = text
      .replace(/<\/(p|div|h[1-6]|li|tr|br|article|section)>/gi, '$&\n')
      .replace(/<br\s*\/?>/gi, '\n');

    // Strip remaining tags
    text = text.replace(/<[^>]+>/g, ' ');

    // Decode entities
    text = decodeEntities(text);

    // Collapse whitespace
    text = text.replace(/[ \t]+/g, ' ').replace(/\n[ \t]+/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

    // Cap to 50000 chars (Claude has plenty of capacity but we want to be sensible)
    const MAX_TEXT = 50000;
    if (text.length > MAX_TEXT) {
      text = text.slice(0, MAX_TEXT) + '\n\n[... Text gekürzt ...]';
    }

    return res.status(200).json({
      url: parsed.href,
      title: title || (ogTitle ? decodeEntities(ogTitle[1]) : ''),
      description: description || (ogDesc ? decodeEntities(ogDesc[1]) : ''),
      text: text,
      length: text.length,
    });
  } catch (err) {
    console.error('fetch-url error:', err);
    return res.status(500).json({ error: 'Server-Fehler: ' + err.message });
  }
}

function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&auml;/g, 'ä')
    .replace(/&ouml;/g, 'ö')
    .replace(/&uuml;/g, 'ü')
    .replace(/&Auml;/g, 'Ä')
    .replace(/&Ouml;/g, 'Ö')
    .replace(/&Uuml;/g, 'Ü')
    .replace(/&szlig;/g, 'ß')
    .replace(/&euro;/g, '€')
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
}
