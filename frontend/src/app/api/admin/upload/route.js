import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const config = { api: { bodyParser: false } };

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('image');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, message: 'Tidak ada file.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const ext = path.extname(file.name) || '.jpg';
    const base = path.basename(file.name, ext).replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
    const filename = `${base}-${Date.now()}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ success: true, data: { url: `/uploads/${filename}` } });
  } catch (err) {
    console.error('[upload]', err);
    return NextResponse.json({ success: false, message: 'Upload gagal.' }, { status: 500 });
  }
}
