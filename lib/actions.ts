'use server';

import fs from 'fs/promises';
import path from 'path';

export async function getSampleHtml() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'sample.html');
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Failed to read sample.html:', error);
    return '';
  }
}
