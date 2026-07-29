import { getCafeChatResponse } from './cafeChat';

export async function sendCafeChat({ message, history = [], compact = false }) {
  const trimmedMessage = typeof message === 'string' ? message.trim() : '';

  if (!trimmedMessage) {
    return getCafeChatResponse('', { compact });
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
    return getCafeChatResponse(trimmedMessage, { compact });
  }

  return getCafeChatResponse(trimmedMessage, { compact });
}
