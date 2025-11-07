"use client";

import FormEditor from "@/components/ResumeEditor/FormEditor";
import ImportDialog from "@/components/ResumeEditor/ImportDialog";
import LatexEditor from "@/components/ResumeEditor/LatexEditor";
import Preview from "@/components/ResumeEditor/Preview";
import SettingsDialog from "@/components/ResumeEditor/SettingsDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [editorMode, setEditorMode] = useState<"visual" | "latex">("visual");

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <h1 className="text-xl font-bold">Jake&apos;s Resume Studio</h1>
          </div>
          <div className="flex items-center gap-2">
            <ImportDialog />
            <SettingsDialog />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Editor */}
        <div className="w-1/2 border-r flex flex-col overflow-hidden">
          <Tabs
            value={editorMode}
            onValueChange={(v) => setEditorMode(v as "visual" | "latex")}
            className="flex-1 flex flex-col h-full"
          >
            <div className="border-b px-4">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="visual">Visual Editor</TabsTrigger>
                <TabsTrigger value="latex">LaTeX Editor</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="visual" className="flex-1 m-0 h-0">
              <FormEditor />
            </TabsContent>
            <TabsContent value="latex" className="flex-1 m-0 h-0">
              <LatexEditor />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2">
          <Preview />
        </div>
      </div>
    </div>
  );
}
