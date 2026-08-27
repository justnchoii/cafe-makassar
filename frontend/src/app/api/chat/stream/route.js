// Always use localhost for server-side backend calls (works in Codespaces)
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// This route does NOT buffer the AI's answer. It opens a connection to the
// backend's SSE endpoint (/api/chat/stream) and pipes the response body
// straight through to the browser, so the client receives each token as
// soon as the backend produces it instead of waiting for the full reply.
export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    return new Response(
      `event: error\ndata: ${JSON.stringify({ message: 'Permintaan tidak valid.' })}\n\n`,
      { status: 400, headers: { 'Content-Type': 'text/event-stream; charset=utf-8' } },
    );
  }

  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  const history = Array.isArray(body?.history) ? body.history : [];
  const systemOverride = typeof body?.systemOverride === 'string' ? body.systemOverride : undefined;

  if (!message) {
    return new Response(
      `event: error\ndata: ${JSON.stringify({ message: 'Message is required.' })}\n\n`,
      { status: 400, headers: { 'Content-Type': 'text/event-stream; charset=utf-8' } },
    );
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, systemOverride }),
      cache: 'no-store',
    });

    if (!backendRes.ok || !backendRes.body) {
      throw new Error(`Backend HTTP ${backendRes.status}`);
    }

    return new Response(backendRes.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    console.error('[chat/stream] Error:', err.message);
    return new Response(
      `event: error\ndata: ${JSON.stringify({ message: 'AI sedang tidak tersedia. Pastikan backend berjalan.' })}\n\n`,
      { status: 200, headers: { 'Content-Type': 'text/event-stream; charset=utf-8' } },
    );
  }
}
