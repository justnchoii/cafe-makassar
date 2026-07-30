import { NextResponse } from 'next/server';
import { getCafeChatResponse, isCafeRelatedChatMessage } from '../../../lib/cafeChat';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function getBackendApiUrl() {
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
}

function getGeminiRequestConfig(rawKey) {
  return {
    url: GEMINI_URL,
    headers: { 'x-goog-api-key': rawKey.trim() },
  };
}

function buildCafeContextFromDb(cafes) {
  if (!Array.isArray(cafes) || cafes.length === 0) return '';
  return cafes.map(c => {
    const parts = [
      `- ${c.name}`,
      c.about || c.description,
      `Kategori: ${c.category || '-'}`,
      `Harga: ${c.priceRange || '-'} | Rating: ${c.rating || '-'}/5`,
      `Alamat: ${c.address || '-'}`,
      c.facilities?.length ? `Fasilitas: ${c.facilities.join(', ')}` : '',
      c.menu?.length ? `Menu: ${c.menu.join(', ')}` : '',
      c.priceInfo ? `Kisaran harga: ${c.priceInfo}` : '',
      c.suitableFor?.length ? `Cocok untuk: ${c.suitableFor.join(', ')}` : '',
      c.tips ? `Tips: ${c.tips}` : '',
      c.openHours ? `Jam buka: ${c.openHours}` : '',
      c.mapsLink ? `Maps: ${c.mapsLink}` : '',
    ].filter(Boolean);
    return parts.join(' | ');
  }).join('\n');
}

function createSystemPrompt(cafeContext) {
  return `Kamu adalah AI Assistant cerdas di website Cafe Makassar. Kamu bisa menjawab APA SAJA yang ditanyakan pengguna.

ATURAN UTAMA:
1. Jawab SEMUA pertanyaan dengan baik - tentang cafe, teknologi, sains, matematika, sejarah, bahasa, coding, kesehatan, atau topik apapun.
2. Gunakan Bahasa Indonesia yang natural, ramah, dan jelas.
3. Untuk pertanyaan tentang cafe di Makassar, gunakan DATA CAFE di bawah sebagai sumber utama.
4. Jangan mengarang informasi cafe yang tidak ada di data. Kalau tidak ada, bilang jujur.
5. Untuk pertanyaan NON-cafe, jawab seperti asisten AI umum yang pintar dan membantu.
6. Gunakan riwayat percakapan untuk memahami konteks follow-up.
7. Jawaban boleh panjang jika pertanyaan membutuhkan penjelasan detail.

${cafeContext ? `DATA CAFE MAKASSAR (gunakan ini untuk pertanyaan tentang cafe):\n${cafeContext}` : ''}`;
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter(item => item && typeof item.content === 'string' && item.content.trim())
    .slice(-10)
    .map(item => ({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: item.content.trim() }],
    }));
}

function extractGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts.map(p => p?.text || '').join('\n').trim();
}

async function fetchCafesFromBackend() {
  try {
    const res = await fetch(`${getBackendApiUrl()}/api/cafes`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.data || data?.cafes || []);
  } catch {
    return [];
  }
}

async function callGemini(apiKey, systemPrompt, history, message, compact) {
  const config = getGeminiRequestConfig(apiKey);
  const res = await fetch(config.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...config.headers },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [
        ...sanitizeHistory(history),
        { role: 'user', parts: [{ text: message }] },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: compact ? 512 : 1024,
      },
    }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
  const data = await res.json();
  const text = extractGeminiText(data);
  if (!text) throw new Error('Gemini empty response');
  return text;
}

export async function POST(request) {
  let message = '';
  let compact = false;
  let history = [];

  try {
    const body = await request.json();
    message = typeof body?.message === 'string' ? body.message.trim() : '';
    compact = Boolean(body?.compact);
    history = Array.isArray(body?.history) ? body.history : [];

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const cafes = await fetchCafesFromBackend();
    const cafeContext = buildCafeContextFromDb(cafes);
    const systemPrompt = createSystemPrompt(cafeContext);

    if (process.env.GEMINI_API_KEY) {
      try {
        const aiText = await callGemini(process.env.GEMINI_API_KEY, systemPrompt, history, message, compact);
        return NextResponse.json({ response: aiText, mode: 'gemini' });
      } catch (err) {
        console.warn('[chat] Gemini frontend error:', err.message);
      }
    }

    try {
      const res = await fetch(`${getBackendApiUrl()}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        const backendText = data?.data?.message?.trim() || data?.response?.trim() || '';
        if (backendText) return NextResponse.json({ response: backendText, mode: 'backend' });
      }
    } catch (err) {
      console.warn('[chat] Backend fallback error:', err.message);
    }

    const fallback = isCafeRelatedChatMessage(message, history)
      ? getCafeChatResponse(message, { compact, history })
      : 'AI sedang tidak tersedia. Pastikan GEMINI_API_KEY sudah diset di .env.local, lalu restart server.';

    return NextResponse.json({ response: fallback, mode: 'fallback' });
  } catch (error) {
    console.error('[chat] Error:', error.message);
    return NextResponse.json({
      response: 'Maaf, terjadi kesalahan. Silakan coba lagi!',
      mode: 'error',
    });
  }
}