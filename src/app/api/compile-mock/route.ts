/**
 * Development Mock PDF Compiler
 * Returns a simple placeholder PDF for development without Tectonic
 */

import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function POST(request: NextRequest) {
  try {
    const { latex } = await request.json();

    if (!latex) {
      return NextResponse.json(
        { message: 'LaTeX source is required' },
        { status: 400 }
      );
    }

    // Create a simple PDF using pdf-lib for development
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Letter size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { height } = page.getSize();
    const margin = 50;
    let y = height - margin;

    // Simple text rendering from LaTeX
    const lines = latex.split('\n');

    page.drawText('DEVELOPMENT PREVIEW', {
      x: margin,
      y: y,
      size: 10,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });

    y -= 20;

    page.drawText('Install Tectonic for real PDF compilation', {
      x: margin,
      y: y,
      size: 8,
      font: font,
      color: rgb(0.7, 0.7, 0.7),
    });

    y -= 40;

    // Extract and render basic content
    for (const line of lines) {
      if (y < margin) break;

      if (line.includes('\\LARGE') || line.includes('\\textbf')) {
        const text = line.replace(/\\LARGE|\\textbf|[{}\\]/g, '').trim();
        if (text) {
          page.drawText(text, {
            x: margin,
            y: y,
            size: 14,
            font: boldFont,
            color: rgb(0, 0, 0),
          });
          y -= 20;
        }
      } else if (line.includes('\\section')) {
        const text = line.replace(/\\section\*?|[{}]/g, '').trim();
        if (text) {
          y -= 10;
          page.drawText(text, {
            x: margin,
            y: y,
            size: 12,
            font: boldFont,
            color: rgb(0, 0, 0),
          });
          y -= 18;
        }
      } else if (line.includes('\\item')) {
        const text = line.replace(/\\item|\\noindent/g, '').trim();
        if (text && text.length > 0 && !text.startsWith('\\')) {
          page.drawText('• ' + text.substring(0, 80), {
            x: margin + 10,
            y: y,
            size: 10,
            font: font,
            color: rgb(0, 0, 0),
          });
          y -= 14;
        }
      } else if (line.trim() && !line.startsWith('%') && !line.startsWith('\\')) {
        const text = line.trim().substring(0, 80);
        if (text) {
          page.drawText(text, {
            x: margin,
            y: y,
            size: 10,
            font: font,
            color: rgb(0, 0, 0),
          });
          y -= 14;
        }
      }
    }

    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="resume-preview.pdf"',
      },
    });
  } catch (error) {
    console.error('Mock compilation error:', error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Compilation failed',
      },
      { status: 500 }
    );
  }
}
