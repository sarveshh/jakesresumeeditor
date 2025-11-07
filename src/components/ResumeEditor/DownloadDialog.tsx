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
    if (!pdfUrl) {
      console.error("No PDF URL available for image export");
      return;
    }

    try {
      console.log("Starting PNG export...");

      // Fetch the PDF blob
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }
      const pdfBlob = await response.blob();
      console.log("PDF blob fetched:", pdfBlob.size, "bytes");

      // Convert PDF to image using canvas
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      console.log("PDF data loaded:", uint8Array.length, "bytes");

      // Use pdf.js to render PDF to canvas
      const pdfjsLib = await import("pdfjs-dist");

      // Set worker path - use local worker instead of CDN
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

      console.log("Loading PDF document...");
      const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
      const pdf = await loadingTask.promise;
      console.log("PDF loaded, pages:", pdf.numPages);

      // High quality settings
      const scale = 3; // 3x scale for high quality (300 DPI equivalent)

      // Get dimensions of all pages
      const pagePromises = [];
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        pagePromises.push(pdf.getPage(pageNum));
      }
      const pages = await Promise.all(pagePromises);

      // Calculate total height and max width
      let totalHeight = 0;
      let maxWidth = 0;
      const viewports = pages.map((page) => {
        const viewport = page.getViewport({ scale });
        totalHeight += viewport.height;
        maxWidth = Math.max(maxWidth, viewport.width);
        return viewport;
      });

      console.log(
        `Combining ${pdf.numPages} pages into single image: ${maxWidth}x${totalHeight}`
      );

      // Create canvas large enough for all pages
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Failed to get canvas 2D context");
      }

      canvas.height = totalHeight;
      canvas.width = maxWidth;
      console.log("Canvas created:", canvas.width, "x", canvas.height);

      // Render all pages to canvas
      let currentY = 0;
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const viewport = viewports[i];

        console.log(
          `Rendering page ${i + 1}/${pages.length} at Y=${currentY}...`
        );

        // Create temporary canvas for this page
        const tempCanvas = document.createElement("canvas");
        const tempContext = tempCanvas.getContext("2d");
        if (!tempContext) continue;

        tempCanvas.height = viewport.height;
        tempCanvas.width = viewport.width;

        // Render page to temp canvas
        await page.render({
          canvasContext: tempContext,
          viewport: viewport,
        }).promise;

        // Draw temp canvas onto main canvas at correct position
        context.drawImage(tempCanvas, 0, currentY);
        currentY += viewport.height;
      }

      console.log("All pages rendered to canvas successfully");

      // Convert canvas to high-quality PNG
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error("Failed to create PNG blob");
            return;
          }
          console.log("PNG blob created:", blob.size, "bytes");
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${filename}.png`;
          link.click();
          URL.revokeObjectURL(url);
          console.log("PNG download initiated");
          setIsOpen(false);
        },
        "image/png",
        1.0 // Maximum quality
      );
    } catch (error) {
      console.error("Error converting PDF to image:", error);
      console.error(
        "Error details:",
        error instanceof Error ? error.message : String(error)
      );
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
