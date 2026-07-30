import { getCafeChatResponse, isCafeRelatedChatMessage } from './cafeChat';

function getUnavailableGeneralAiResponse() {
  return 'AI sedang tidak tersedia untuk pertanyaan umum saat ini. Coba lagi sebentar lagi setelah koneksi Gemini aktif.';
}

export async function sendCafeChat({ message, history = [], compact = false }) {
  const trimmedMessage = typeof message === 'string' ? message.trim() : '';

  if (!trimmedMessage) {
    return getCafeChatResponse('', { compact, history });
  }

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: trimmedMessage,
        history,
        compact,
      }),
    });

    if (!response.ok) {
      throw new Error('Chat request failed');
    }

    const data = await response.json();
    if (typeof data?.response === 'string' && data.response.trim()) {
      return data.response.trim();
    }
  } catch (error) {
    return isCafeRelatedChatMessage(trimmedMessage, history)
      ? getCafeChatResponse(trimmedMessage, { compact, history })
      : getUnavailableGeneralAiResponse();
  }

  return isCafeRelatedChatMessage(trimmedMessage, history)
    ? getCafeChatResponse(trimmedMessage, { compact, history })
    : getUnavailableGeneralAiResponse();
}
