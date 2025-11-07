'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { compileLatex } from '@/lib/latex/compiler';
import { generateLatex } from '@/lib/latex/template-jake/generator';
import { useResumeStore } from '@/store/resume';
import { AlertCircle, Download, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Preview() {
  const { resume } = useResumeStore();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCompileTime, setLastCompileTime] = useState<number>(0);

  useEffect(() => {
    // Auto-compile on resume changes (debounced)
    const timer = setTimeout(() => {
      void handleCompile();
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume]);

  const handleCompile = async () => {
    const startTime = Date.now();
    setIsCompiling(true);
    setError(null);

    try {
      const latexSource = generateLatex(resume);
      const result = await compileLatex(latexSource);

      if (result.success && result.pdf) {
        // Revoke old URL to prevent memory leaks
        if (pdfUrl) {
          URL.revokeObjectURL(pdfUrl);
        }
        const url = URL.createObjectURL(result.pdf);
        setPdfUrl(url);
        setLastCompileTime(Date.now() - startTime);
      } else {
        setError(result.error || 'Compilation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsCompiling(false);
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${resume.header.name.replace(/\s+/g, '_')}_Resume.pdf`;
      link.click();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-muted/40 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">PDF Preview</h2>
          {lastCompileTime > 0 && (
            <p className="text-xs text-muted-foreground">
              Last compiled in {lastCompileTime}ms
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCompile}
            disabled={isCompiling}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isCompiling ? 'animate-spin' : ''}`} />
            {isCompiling ? 'Compiling...' : 'Refresh'}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleDownload}
            disabled={!pdfUrl}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        {error && (
          <Card className="p-4 border-destructive bg-destructive/10">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h3 className="font-semibold text-destructive">Compilation Error</h3>
                <pre className="text-sm mt-2 whitespace-pre-wrap">{error}</pre>
              </div>
            </div>
          </Card>
        )}

        {isCompiling && !pdfUrl && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Compiling your resume...</p>
            </div>
          </div>
        )}

        {pdfUrl && !error && (
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0 bg-white shadow-lg rounded-lg"
            title="Resume Preview"
          />
        )}

        {!pdfUrl && !isCompiling && !error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No preview available</p>
              <Button onClick={handleCompile}>Generate Preview</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
