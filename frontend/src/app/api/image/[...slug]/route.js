import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(request, { params }) {
  const slug = (await params).slug;
  const filename = Array.isArray(slug) ? slug.join('/') : slug;

  try {
    const res = await fetch(`${BACKEND_URL}/api/images/${filename}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return new NextResponse('Image unavailable', { status: 503 });
  }
}
