/**
 * Enhanced Download Dialog
 * Advanced export options with customization
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResumeStore } from "@/store/resume";
import { Download, FileText, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

interface DownloadDialogProps {
  pdfUrl: string | null;
  disabled?: boolean;
}

export default function DownloadDialog({
  pdfUrl,
  disabled,
}: DownloadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { resume } = useResumeStore();
  const [filename, setFilename] = useState(
    resume.header.name
      ? `${resume.header.name.replace(/\s+/g, "_")}_Resume`
      : "Resume"
  );

  const handleDownloadPDF = () => {
    if (!pdfUrl) return;

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${filename}.pdf`;
    link.click();
    setIsOpen(false);
  };

  const handleDownloadImage = async () => {
    if (!pdfUrl) return;

    try {
      // Fetch the PDF blob
      const response = await fetch(pdfUrl);
      const pdfBlob = await response.blob();

      // Convert PDF to image using canvas
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Use pdf.js to render PDF to canvas
      const pdfjsLib = await import("pdfjs-dist");

      // Set worker path
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);

      // High quality settings
      const scale = 3; // 3x scale for high quality (300 DPI equivalent)
      const viewport = page.getViewport({ scale });

      // Create canvas
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      }).promise;

      // Convert canvas to high-quality PNG
      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${filename}.png`;
          link.click();
          URL.revokeObjectURL(url);
          setIsOpen(false);
        },
        "image/png",
        1.0 // Maximum quality
      );
    } catch (error) {
      console.error("Error converting PDF to image:", error);
      alert(
        "Failed to export as image. Please try downloading as PDF instead."
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" disabled={disabled}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download Resume</DialogTitle>
          <DialogDescription>
            Choose your download format and customize the filename
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Filename Customization */}
          <div className="space-y-2">
            <Label htmlFor="filename">Filename</Label>
            <div className="flex gap-2">
              <Input
                id="filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="Resume"
              />
              <span className="flex items-center text-sm text-muted-foreground">
                .pdf
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Customize the filename for your downloaded resume
            </p>
          </div>

          {/* Download Options */}
          <div className="space-y-2">
            <Label>Download As</Label>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleDownloadPDF}
              disabled={!pdfUrl}
            >
              <FileText className="h-4 w-4 mr-2" />
              PDF Document (.pdf)
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleDownloadImage}
              disabled={!pdfUrl}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              High Quality Image (.png)
            </Button>

            <p className="text-xs text-muted-foreground">
              PDF: ATS-compliant format (recommended) • PNG: High-quality image
              (300 DPI)
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="default"
              className="flex-1"
              onClick={handleDownloadPDF}
              disabled={!pdfUrl}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Now
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
