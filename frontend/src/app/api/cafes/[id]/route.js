import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000';

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
