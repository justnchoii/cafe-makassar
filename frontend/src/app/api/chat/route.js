import { NextResponse } from 'next/server';

function getBackendApiUrl() {
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
}

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ response: 'Permintaan tidak valid.' }, { status: 400 });
  }

  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  const history = Array.isArray(body?.history) ? body.history : [];

  if (!message) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(`${getBackendApiUrl()}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Backend HTTP ${res.status}`);
    }

    const data = await res.json();
    const aiText = data?.data?.message?.trim() || data?.response?.trim() || '';

    if (aiText) {
      return NextResponse.json({ response: aiText, mode: 'backend' });
    }

    throw new Error('Backend returned empty response');
  } catch (err) {
    console.error('[chat] Error:', err.message);
    return NextResponse.json({
      response: 'AI sedang tidak tersedia. Pastikan backend berjalan dan GEMINI_API_KEY sudah diset di backend/.env, lalu restart server.',
      mode: 'error',
    });
  }
}