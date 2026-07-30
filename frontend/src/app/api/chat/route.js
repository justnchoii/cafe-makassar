import { NextResponse } from 'next/server';
import { buildCafeKnowledgeBase, getCafeChatResponse, isCafeRelatedChatMessage } from '../../../lib/cafeChat';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function getBackendApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
}

function getGeminiRequestConfig(rawKey) {
  const key = rawKey.trim();

  return {
    url: GEMINI_URL,
    headers: {
      'x-goog-api-key': key,
    },
  };
}

function createSystemPrompt() {
 return `Kamu adalah AI Assistant pada website Cafe Makassar.

Aturan:
1. Kamu boleh menjawab pertanyaan umum seperti teknologi, pendidikan, sejarah, matematika, pemrograman, kesehatan umum, bahasa, dan pengetahuan umum.
2. Jika pertanyaan berkaitan dengan cafe di Makassar, gunakan data cafe yang diberikan di bawah sebagai sumber utama.
3. Jangan mengarang informasi tentang cafe. Jika data tidak tersedia, jawab persis: "Maaf, informasi tersebut belum tersedia pada database Cafe Makassar."
4. Gunakan riwayat percakapan untuk memahami follow-up.
5. Jawablah secara natural, ramah, jelas, dan terasa seperti AI chat modern.
6. Untuk pertanyaan non-cafe, jawab normal seperti asisten AI umum tanpa mengaitkan paksa ke cafe.

Data Cafe:
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

function getFallbackResponse(message, history, compact) {
  if (isCafeRelatedChatMessage(message, history)) {
    return getCafeChatResponse(message, { compact, history });
  }

  return 'AI sedang tidak tersedia untuk pertanyaan umum saat ini. Coba lagi sebentar lagi setelah koneksi Gemini aktif.';
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
    const fallback = getFallbackResponse(message, history, compact);

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    // 1. Coba Gemini langsung dulu kalau key ada di frontend
    if (process.env.GEMINI_API_KEY) {
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
              ...sanitizeHistory(history),
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
            return NextResponse.json({ response: aiText, mode: 'gemini' });
          }

          // Gemini connected but returned empty — log detail
          const errDetail = data?.error?.message || JSON.stringify(data).slice(0, 200);
          console.warn('[chat] Gemini returned empty. Detail:', errDetail);
        } else {
          const errText = await response.text().catch(() => '');
          console.warn(`[chat] Gemini HTTP ${response.status}:`, errText.slice(0, 200));
        }
      } catch (geminiErr) {
        console.warn('[chat] Gemini fetch error:', geminiErr.message);
      }
    } else {
      console.warn('[chat] GEMINI_API_KEY tidak ditemukan di frontend/.env.local');
    }

    // 2. Fallback ke backend kalau Gemini frontend gagal
    const backendResponse = await requestBackendChat(message, history);
    if (backendResponse) {
      return NextResponse.json({ response: backendResponse, mode: 'backend' });
    }

    console.warn('[chat] Backend juga tidak tersedia. Pakai local fallback.');
    return NextResponse.json({ response: fallback, mode: 'fallback' });
  } catch (error) {
    const fallbackMessage = getFallbackResponse(message || '', history, compact);
    return NextResponse.json({ response: fallbackMessage, mode: 'fallback' });
  }
}
