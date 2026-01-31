import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'sample.html');
    
    if (!fs.existsSync(filePath)) {
      return new NextResponse('Sample file not found', { status: 404 });
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return new NextResponse(content, { headers: { 'Content-Type': 'text/html' } });
  } catch (error) {
    console.error('Error reading sample file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
