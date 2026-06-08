// ============================================================
//  AI EXPRESS — Route serveur de génération IA (Vercel Function)
//  Fichier : /api/generate.js
//  Appelle OpenAI avec VOTRE clé API (jamais exposée au navigateur).
//  Le front appelle  POST /api/generate  avec { messages, mode }.
// ============================================================

export default async function handler(req, res) {
  // CORS / méthode
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY manquante côté serveur' });
  }

  try {
    // Body : { messages: [{role, content}], mode: 'text'|'code'|'image' }
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const mode = body.mode || 'text';

    // -------- Mode IMAGE : génération d'image réelle (DALL·E) --------
    if (mode === 'image') {
      const prompt = (messages[messages.length - 1] || {}).content || '';
      const imgRes = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'dall-e-3', prompt, n: 1, size: '1024x1024' }),
      });
      const imgJson = await imgRes.json();
      if (!imgRes.ok) {
        return res.status(imgRes.status).json({ error: imgJson.error?.message || 'Erreur image' });
      }
      const url = imgJson.data?.[0]?.url || '';
      return res.status(200).json({ content: url, type: 'image' });
    }

    // -------- Mode TEXTE / CODE : chat completions --------
    const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',          // rapide & économique ; changez en 'gpt-4o' si voulu
        messages,
        temperature: 0.7,
      }),
    });
    const chatJson = await chatRes.json();
    if (!chatRes.ok) {
      return res.status(chatRes.status).json({ error: chatJson.error?.message || 'Erreur OpenAI' });
    }
    const content = chatJson.choices?.[0]?.message?.content || '…';
    return res.status(200).json({ content, type: 'text' });

  } catch (e) {
    return res.status(500).json({ error: String(e && e.message || e) });
  }
}
