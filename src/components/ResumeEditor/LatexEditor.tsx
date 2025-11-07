"use client";

import { generateLatex } from "@/lib/latex/template-jake/generator";
import { useResumeStore } from "@/store/resume";
import { useMemo, useState } from "react";

export default function LatexEditor() {
  const { resume } = useResumeStore();
  const latexSource = useMemo(() => generateLatex(resume), [resume]);
  const [editedSource, setEditedSource] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const displaySource = isEditing ? editedSource : latexSource;

  const handleChange = (value: string) => {
    setEditedSource(value);
    setIsEditing(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-muted/40">
        <h2 className="font-semibold">LaTeX Source</h2>
        {isEditing && (
          <p className="text-sm text-muted-foreground mt-1">
            Changes made here won&apos;t sync back to the form editor yet
          </p>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <textarea
          value={displaySource}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none bg-background"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
