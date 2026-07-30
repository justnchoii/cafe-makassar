export async function sendCafeChat({ message, history = [], compact = false }) {
  const trimmedMessage = typeof message === 'string' ? message.trim() : '';

  if (!trimmedMessage) {
    return 'Silakan ketik pesan terlebih dahulu.';
  }

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: trimmedMessage, history, compact }),
    });

    if (!response.ok) {
      throw new Error('Chat request failed');
    }

    const data = await response.json();
    const text = data?.response?.trim() || data?.data?.message?.trim() || '';

    if (text) return text;
    throw new Error('Empty response');
  } catch (error) {
    console.error('[chatApi]', error.message);
    return 'AI sedang tidak tersedia. Coba lagi sebentar lagi.';
  }
}