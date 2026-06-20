import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null;
    const partnerCode = formData.get('partnerCode') as string | null;

    if (!file || !type || !partnerCode) {
      return NextResponse.json(
        { success: false, error: 'File, type, and partnerCode are required' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate filename
    const ext = path.extname(file.name) || '.png';
    const filename = `${partnerCode}-${type}-${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    // Save to disk
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process file upload' },
      { status: 500 }
    );
  }
}
