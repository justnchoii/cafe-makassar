import { NextResponse } from 'next/server';
import { buildCafeKnowledgeBase, getCafeChatResponse } from '../../../lib/cafeChat';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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
  return `Kamu adalah AI Assistant untuk website Cafe Makassar.

Tugasmu:
- Jawab dengan bahasa Indonesia yang natural, hangat, dan nyambung seperti AI chat modern.
- Fokus utama hanya pada cafe di Makassar yang ada di data berikut.
- Gunakan data cafe sebagai sumber utama. Jangan mengarang rating, alamat, fasilitas, atau suasana yang tidak didukung data.
- Kalau user salah ketik nama cafe tapi masih jelas maksudnya, pahami dan tetap jawab.
- Kalau user minta rekomendasi, pilih yang paling relevan dengan kebutuhan mereka lalu jelaskan alasannya.
- Kalau user menyebut beberapa cafe, jangan otomatis membandingkan kecuali user memang minta perbandingan.
- Kalau user bertanya satu aspek seperti suasana, lokasi, rating, fasilitas, atau cocok buat apa, jawab tepat pada aspek itu.
- Jika data tidak cukup untuk menjawab detail tertentu, bilang dengan jujur dan arahkan ke info yang memang tersedia.
- Jangan keluar topik terlalu jauh. Kalau pertanyaan sangat umum, tetap arahkan ke rekomendasi cafe Makassar.
- Hindari jawaban template kaku. Tulis seolah sedang ngobrol, tetap ringkas dan informatif.

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

export async function POST(request) {
  try {
    const body = await request.json();
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    const compact = Boolean(body?.compact);
    const fallback = getCafeChatResponse(message, { compact });

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ response: fallback, mode: 'fallback' });
    }

    const geminiConfig = getGeminiRequestConfig(process.env.GEMINI_API_KEY);

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
          temperature: compact ? 0.55 : 0.7,
          topP: 0.9,
          maxOutputTokens: compact ? 220 : 520,
        },
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ response: fallback, mode: 'fallback' });
    }

    const data = await response.json();
    const aiText = extractGeminiText(data);

    return NextResponse.json({
      response: aiText || fallback,
      mode: aiText ? 'gemini' : 'fallback',
    });
  } catch (error) {
    const fallbackMessage = getCafeChatResponse('rekomendasi cafe makassar');
    return NextResponse.json({ response: fallbackMessage, mode: 'fallback' });
  }
}
