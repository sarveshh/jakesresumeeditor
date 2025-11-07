/**
 * File Upload Dialog Component
 * Handles importing .tex and .pdf files
 */

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  parseLatexToResume,
  parsePdfTextToResume,
  parsePdfToText,
} from "@/lib/latex/parser";
import { useResumeStore } from "@/store/resume";
import { FileText, FileUp, Upload } from "lucide-react";
import { useRef, useState } from "react";

export default function ImportDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const texInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const { setResume, resume } = useResumeStore();

  const handleTexUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const text = await file.text();
      const parsedResume = parseLatexToResume(text);

      // Merge with existing resume, prioritizing imported data
      setResume({
        header: { ...resume.header, ...parsedResume.header },
        sections: parsedResume.sections || resume.sections,
      });

      setIsOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to parse .tex file"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const text = await parsePdfToText(file);

      console.log("=== PDF TEXT EXTRACTED ===");
      console.log(text);
      console.log("=========================");

      // Parse PDF text to resume structure
      const parsedResume = parsePdfTextToResume(text);

      console.log("=== PARSED RESUME ===");
      console.log(JSON.stringify(parsedResume, null, 2));
      console.log("=====================");

      setResume({
        header: { ...resume.header, ...parsedResume.header },
        sections: parsedResume.sections || resume.sections,
      });

      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse PDF file");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Resume</DialogTitle>
          <DialogDescription>
            Upload a .tex file or PDF to import your resume. LaTeX files work
            best for accurate parsing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* LaTeX Upload */}
          <div className="space-y-2">
            <input
              ref={texInputRef}
              type="file"
              accept=".tex"
              onChange={handleTexUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => texInputRef.current?.click()}
              disabled={isProcessing}
            >
              <FileText className="h-4 w-4 mr-2" />
              {isProcessing ? "Processing..." : "Upload .tex file"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Import from a LaTeX resume file
            </p>
          </div>

          {/* PDF Upload */}
          <div className="space-y-2">
            <input
              ref={pdfInputRef}
              type="file"
              accept=".pdf"
              onChange={handlePdfUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => pdfInputRef.current?.click()}
              disabled={isProcessing}
            >
              <FileUp className="h-4 w-4 mr-2" />
              {isProcessing ? "Processing..." : "Upload PDF file"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Extract and convert PDF resume to editable format (attempts
              LaTeX-style parsing)
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
