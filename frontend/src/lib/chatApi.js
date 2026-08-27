// Streams the AI reply in real time via Server-Sent Events instead of waiting
// for the full answer. `onChunk(delta, fullTextSoFar)` fires for every token
// chunk as it arrives, so the caller can update the UI incrementally.
// Returns the final assembled text once the stream completes.
export async function streamCafeChat({ message, history = [], onChunk, onError } = {}) {
  const trimmedMessage = typeof message === 'string' ? message.trim() : '';

  if (!trimmedMessage) {
    onError?.('Silakan ketik pesan terlebih dahulu.');
    return '';
  }

  try {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: trimmedMessage, history }),
    });

    if (!response.ok || !response.body) {
      throw new Error('Stream request failed');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';

      for (const rawEvent of events) {
        let eventType = 'message';
        let dataLine = '';
        for (const line of rawEvent.split('\n')) {
          if (line.startsWith('event:')) eventType = line.slice(6).trim();
          if (line.startsWith('data:')) dataLine = line.slice(5).trim();
        }
        if (!dataLine) continue;

        let payload;
        try {
          payload = JSON.parse(dataLine);
        } catch {
          continue;
        }

        if (eventType === 'chunk' && payload.text) {
          fullText += payload.text;
          onChunk?.(payload.text, fullText);
        } else if (eventType === 'error') {
          onError?.(payload.message || 'Terjadi kesalahan.');
        }
        // 'done' event carries only metadata (mode/timestamp); nothing to append.
      }
    }

    return fullText.trim() || 'Maaf, tidak ada respons dari AI.';
  } catch (error) {
    console.error('[chatApi:stream]', error.message);
    onError?.('AI sedang tidak tersedia. Coba lagi sebentar lagi.');
    return 'AI sedang tidak tersedia. Coba lagi sebentar lagi.';
  }
}

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