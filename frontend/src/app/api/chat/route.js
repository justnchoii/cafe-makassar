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
  return `Kamu adalah AI Assistant untuk website Cafe Makassar.

Tugasmu:
- Jawab dengan bahasa Indonesia yang natural, hangat, dan nyambung seperti AI chat modern.
- Prioritaskan pertanyaan seputar cafe di Makassar yang ada di data berikut.
- Gunakan data cafe sebagai sumber utama. Jangan mengarang rating, alamat, fasilitas, atau suasana yang tidak didukung data.
- Kalau user salah ketik nama cafe tapi masih jelas maksudnya, pahami dan tetap jawab.
- Kalau user minta rekomendasi, pilih yang paling relevan dengan kebutuhan mereka lalu jelaskan alasannya.
- Kalau user menyebut beberapa cafe, jangan otomatis membandingkan kecuali user memang minta perbandingan.
- Kalau user bertanya satu aspek seperti suasana, lokasi, rating, fasilitas, atau cocok buat apa, jawab tepat pada aspek itu.
- Pahami pertanyaan umum seperti: cafe apa saja, rekomen cafe, cafe buat kerja tugas, cafe murah, cafe makan, cafe malam, cafe indoor, cafe outdoor, cafe buat sunset, cafe aesthetic, dan follow-up seperti "selain itu?" atau "apalagi?".
- Kalau user bertanya hal yang lebih umum atau di luar data cafe, tetap jawab dengan natural seperti AI assistant biasa. Kalau relevan, baru kaitkan ke cafe Makassar.
- Jika data tidak cukup untuk menjawab detail tertentu, bilang dengan jujur dan arahkan ke info yang memang tersedia.
- Jangan menolak pertanyaan umum secara kaku. Tetap bantu jawab semampunya dengan gaya ngobrol yang enak.
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

async function requestBackendChat(message) {
  try {
    const response = await fetch(`${getBackendApiUrl()}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
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

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      const backendResponse = await requestBackendChat(message);
      return NextResponse.json({
        response: backendResponse || fallback,
        mode: backendResponse ? 'backend' : 'fallback',
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
            temperature: compact ? 0.55 : 0.7,
            topP: 0.9,
            maxOutputTokens: compact ? 220 : 520,
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
            mode: 'gemini',
          });
        }
      }
    } catch (error) {
      // Fall through to backend/local fallback.
    }

    const backendResponse = await requestBackendChat(message);
    return NextResponse.json({
      response: backendResponse || fallback,
      mode: backendResponse ? 'backend' : 'fallback',
    });
  } catch (error) {
    const fallbackMessage = getCafeChatResponse(message || 'rekomendasi cafe makassar', { compact, history });
    return NextResponse.json({ response: fallbackMessage, mode: 'fallback' });
  }
}
