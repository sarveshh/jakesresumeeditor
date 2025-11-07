'use client';

import FormEditor from '@/components/ResumeEditor/FormEditor';
import LatexEditor from '@/components/ResumeEditor/LatexEditor';
import Preview from '@/components/ResumeEditor/Preview';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [editorMode, setEditorMode] = useState<'visual' | 'latex'>('visual');

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
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Editor */}
        <div className="w-1/2 border-r flex flex-col">
          <Tabs value={editorMode} onValueChange={(v) => setEditorMode(v as 'visual' | 'latex')} className="flex-1 flex flex-col">
            <div className="border-b px-4">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="visual">Visual Editor</TabsTrigger>
                <TabsTrigger value="latex">LaTeX Editor</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="visual" className="flex-1 m-0 overflow-hidden">
              <FormEditor />
            </TabsContent>
            <TabsContent value="latex" className="flex-1 m-0 overflow-hidden">
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
