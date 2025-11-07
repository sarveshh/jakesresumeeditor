/**
 * API Route: Compile LaTeX to PDF
 * Uses Tectonic for compilation (placeholder for now)
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { latex } = await request.json();

    if (!latex) {
      return NextResponse.json(
        { message: 'LaTeX source is required' },
        { status: 400 }
      );
    }

    // TODO: Implement actual Tectonic compilation
    // For now, return a mock error since Tectonic needs to be installed
    // In production, you would:
    // 1. Install Tectonic: https://tectonic-typesetting.github.io/
    // 2. Use child_process to run: tectonic --outfmt=pdf
    // 3. Return the generated PDF blob

    return NextResponse.json(
      {
        message: 'PDF compilation not yet implemented. Tectonic installation required.',
        logs: 'Install Tectonic: https://tectonic-typesetting.github.io/en-US/install.html',
      },
      { status: 501 }
    );

    /*
    // Example implementation with Tectonic:
    const { spawn } = require('child_process');
    const fs = require('fs').promises;
    const path = require('path');
    const os = require('os');

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'resume-'));
    const texFile = path.join(tmpDir, 'resume.tex');
    const pdfFile = path.join(tmpDir, 'resume.pdf');

    await fs.writeFile(texFile, latex);

    const tectonic = spawn('tectonic', ['--outfmt=pdf', texFile]);

    let stdout = '';
    let stderr = '';

    tectonic.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    tectonic.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    await new Promise((resolve, reject) => {
      tectonic.on('close', (code) => {
        if (code === 0) resolve(null);
        else reject(new Error(`Tectonic exited with code ${code}`));
      });
    });

    const pdfBuffer = await fs.readFile(pdfFile);
    await fs.rm(tmpDir, { recursive: true });

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="resume.pdf"',
      },
    });
    */
  } catch (error) {
    console.error('Compilation error:', error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Compilation failed',
        logs: error instanceof Error ? error.stack : '',
      },
      { status: 500 }
    );
  }
}
