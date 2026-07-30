import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000';

function sanitizeImageUrl(image) {
  if (!image) return image;
  // Already a clean relative path → keep as-is
  if (image.startsWith('/')) return image;
  // Absolute http URL: extract filename and return as relative path
  if (/^https?:\/\//i.test(image)) {
    const filename = image.split('/').pop().split('?')[0];
    return `/${filename}`;
  }
  return `/${image}`;
}

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/api/cafes`, { cache: 'no-store' });
    const data = await res.json();
    // Sanitize image URLs so they always resolve to /public files
    if (data.success && Array.isArray(data.data)) {
      data.data = data.data.map(cafe => ({
        ...cafe,
        image: sanitizeImageUrl(cafe.image),
      }));
    }
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ success: false, message: 'Backend tidak tersedia.' }, { status: 503 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get('authorization') || '';
    const res = await fetch(`${BACKEND}/api/admin/cafes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ success: false, message: 'Backend tidak tersedia.' }, { status: 503 });
  }
}
