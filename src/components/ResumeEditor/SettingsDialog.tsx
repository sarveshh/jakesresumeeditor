/**
 * Settings Dialog
 * Manage app settings, reset data, export/import
 */

"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { generateLatex } from "@/lib/latex/template-jake/generator";
import { useResumeStore } from "@/store/resume";
import { Download, Settings, Trash2 } from "lucide-react";
import { useState } from "react";

export default function SettingsDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [showResetAlert, setShowResetAlert] = useState(false);
  const { resume, reset } = useResumeStore();

  const handleReset = () => {
    reset();
    setShowResetAlert(false);
    setIsOpen(false);
  };

  const handleExportLatex = () => {
    const latex = generateLatex(resume);
    const blob = new Blob([latex], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${resume.header.name.replace(/\s+/g, "_")}_Resume.tex`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(resume, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${resume.header.name.replace(/\s+/g, "_")}_Resume.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Manage your resume data and preferences
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Export Options */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Export</h3>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleExportLatex}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as .tex file
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleExportJSON}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as JSON (backup)
                </Button>
              </div>
            </div>

            {/* Data Management */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Data Management</h3>
              <div className="p-3 bg-muted rounded-md text-sm">
                <p className="text-muted-foreground">
                  Your resume is automatically saved in browser localStorage.
                  Data persists between sessions.
                </p>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-destructive">
                Danger Zone
              </h3>
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={() => setShowResetAlert(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Reset to Default Template
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetAlert} onOpenChange={setShowResetAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              current resume data and reset to the default template.
              <br />
              <br />
              <strong>Tip:</strong> Export your resume first if you want to keep
              a backup.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-destructive">
              Reset Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
