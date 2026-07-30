import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000';

function sanitizeImageUrl(image) {
  if (!image) return image;
  if (image.startsWith('/')) return image;
  if (/^https?:\/\//i.test(image)) {
    const filename = image.split('/').pop().split('?')[0];
    return `/${filename}`;
  }
  return `/${image}`;
}

export async function GET(req, { params }) {
  try {
    const res = await fetch(`${BACKEND}/api/cafes/${params.id}`, { cache: 'no-store' });
    const data = await res.json();
    if (data.success && data.data) {
      data.data.image = sanitizeImageUrl(data.data.image);
    }
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ success: false, message: 'Backend tidak tersedia.' }, { status: 503 });
  }
}

export async function PUT(req, { params }) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get('authorization') || '';
    const res = await fetch(`${BACKEND}/api/admin/cafes/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ success: false, message: 'Backend tidak tersedia.' }, { status: 503 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const res = await fetch(`${BACKEND}/api/admin/cafes/${params.id}`, {
      method: 'DELETE',
      headers: { Authorization: authHeader },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ success: false, message: 'Backend tidak tersedia.' }, { status: 503 });
  }
}
