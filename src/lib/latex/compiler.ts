/**
 * LaTeX Compiler Interface
 * Handles compilation of LaTeX to PDF using Tectonic
 */

export interface CompileResult {
  success: boolean;
  pdf?: Blob;
  error?: string;
  logs?: string;
}

export async function compileLatex(latexSource: string): Promise<CompileResult> {
  try {
    // Use mock compiler for development (switch to /api/compile when Tectonic is installed)
    const response = await fetch('/api/compile-mock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ latex: latexSource }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Compilation failed',
        logs: error.logs,
      };
    }

    const blob = await response.blob();
    return {
      success: true,
      pdf: blob,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
