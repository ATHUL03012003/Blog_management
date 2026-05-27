const CHUNK_SIZE = 450;

function splitIntoChunks(text) {
  if (!text || text.length <= CHUNK_SIZE) return [text || ''];
  const chunks = [];
  let remaining = text;
  while (remaining.length > CHUNK_SIZE) {
    let splitAt = remaining.lastIndexOf(' ', CHUNK_SIZE);
    if (splitAt < CHUNK_SIZE * 0.5) splitAt = CHUNK_SIZE;
    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt).trimStart();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

async function translateChunk(text, sourceLang, targetLang) {
  if (!text?.trim() || sourceLang === targetLang) return text;
  const params = new URLSearchParams({
    q: text,
    langpair: `${sourceLang}|${targetLang}`,
  });
  const res = await fetch(`/api/translate/?${params}`);
  if (!res.ok) throw new Error('Translation failed');
  const data = await res.json();
  const translated = data?.responseData?.translatedText;
  if (!translated) throw new Error('Empty translation');
  return translated;
}

export async function translateText(text, targetLang, sourceLang = 'en') {
  if (!text?.trim() || targetLang === sourceLang) return text;
  const chunks = splitIntoChunks(text);
  const results = [];
  for (const chunk of chunks) {
    const translated = await translateChunk(chunk, sourceLang, targetLang);
    results.push(translated);
    await new Promise((r) => setTimeout(r, 120));
  }
  return results.join(' ');
}
