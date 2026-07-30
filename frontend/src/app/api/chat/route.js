import { NextResponse } from 'next/server';
import { buildCafeKnowledgeBase, getCafeChatResponse } from '../../../lib/cafeChat';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function getBackendApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
}

function getGeminiRequestConfig(rawKey) {
  const key = rawKey.trim();

  if (key.startsWith('AQ')) {
    return {
      url: GEMINI_URL,
      headers: {
        Authorization: `Bearer ${key}`,
      },
    };
  }

  return {
    url: GEMINI_URL,
    headers: {
      'x-goog-api-key': key,
    },
  };
}

function createSystemPrompt() {
 return `Kamu adalah AI resmi Website Cafe Makassar.

ATURAN WAJIB:
1. Jawab HANYA berdasarkan data cafe yang diberikan dan riwayat percakapan.
2. Jangan mengarang nama cafe.
3. Jangan mengarang alamat.
4. Jangan mengarang rating.
5. Jangan mengarang harga.
6. Jangan mengarang fasilitas atau suasana yang tidak tertulis.
7. Jika informasi tidak ada pada data, jawab persis: "Maaf, informasi tersebut belum tersedia pada database Cafe Makassar."
8. Jika user bertanya follow-up seperti "alamatnya dimana?" atau "jam bukanya?", gunakan konteks dari riwayat chat.
9. Jika user bertanya selain cafe Makassar, jawab singkat lalu arahkan kembali ke topik cafe.
10. Selalu prioritaskan rekomendasi cafe dari data yang tersedia.

Gaya jawaban:
- Gunakan Bahasa Indonesia yang natural, ringkas, dan membantu.
- Kalau ada beberapa cafe relevan, pilih 3 sampai 5 yang paling cocok lalu jelaskan singkat alasannya.
- Kalau data tidak menyebut hal spesifik seperti slowbar atau manual brew, katakan jujur dan sebut cafe yang paling mendekati dari data.

Data cafe Makassar:
${buildCafeKnowledgeBase()}`;
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter(item => item && typeof item.content === 'string' && item.content.trim())
    .slice(-8)
    .map(item => ({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: item.content.trim() }],
    }));
}

function extractGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return '';
  }

  return parts
    .map(part => part?.text || '')
    .join('\n')
    .trim();
}

async function requestBackendChat(message, history = []) {
  try {
    const response = await fetch(`${getBackendApiUrl()}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, history }),
      cache: 'no-store',
    });

    if (!response.ok) {
      return '';
    }

    const data = await response.json();
    return data?.data?.message?.trim() || '';
  } catch (error) {
    return '';
  }
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
    const fallback = getCafeChatResponse(message, { compact, history });

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const backendResponse = await requestBackendChat(message, history);
    if (backendResponse) {
      return NextResponse.json({
        response: backendResponse,
        mode: 'backend',
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        response: fallback,
        mode: 'fallback',
      });
    }

    const geminiConfig = getGeminiRequestConfig(process.env.GEMINI_API_KEY);

    try {
      const response = await fetch(geminiConfig.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...geminiConfig.headers,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: createSystemPrompt() }],
          },
          contents: [
            ...sanitizeHistory(body?.history),
            {
              role: 'user',
              parts: [{ text: message }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topP: 0.8,
            maxOutputTokens: compact ? 220 : 420,
          },
        }),
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        const aiText = extractGeminiText(data);

        if (aiText) {
          return NextResponse.json({
            response: aiText,
            mode: 'gemini-direct',
          });
        }
      }
    } catch (error) {
      // Fall through to backend/local fallback.
    }

    return NextResponse.json({
      response: fallback,
      mode: 'fallback',
    });
  } catch (error) {
    const fallbackMessage = getCafeChatResponse(message || 'rekomendasi cafe makassar', { compact, history });
    return NextResponse.json({ response: fallbackMessage, mode: 'fallback' });
  }
}
