# Jake's Resume Studio - Architecture

## 🎯 Core Principle: JSON as Single Source of Truth

This application follows a **data-centric architecture** where all components work with a unified JSON data model.

```
┌─────────────────────────────────────────────────────────────┐
│                   SINGLE SOURCE OF TRUTH                    │
│                                                             │
│              Resume JSON Model (Zustand Store)              │
│         { header, sections: [experience, education...] }    │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
┌────────────────┐   ┌────────────────┐   ┌────────────────┐
│ Visual Editor  │   │  LaTeX Editor  │   │ PDF Preview    │
│                │   │                │   │                │
│ Edits JSON     │   │ Generates      │   │ Compiles       │
│ directly       │   │ LaTeX from     │   │ LaTeX to       │
│                │   │ JSON           │   │ show PDF       │
└────────────────┘   └────────────────┘   └────────────────┘
```

## 📊 Data Flow

### 1. **Creating/Editing Resume**

```
User edits in Visual Editor
       ↓
Updates Zustand Store (JSON)
       ↓
localStorage persists JSON
       ↓
LaTeX Editor regenerates LaTeX from JSON
       ↓
PDF Preview auto-compiles LaTeX
```

### 2. **Importing PDF**

```
User uploads PDF
       ↓
/api/parse-pdf extracts text (pdf2json)
       ↓
parsePdfTextToResume() converts text → JSON
       ↓
Updates Zustand Store
       ↓
All editors sync automatically
```

### 3. **Importing LaTeX**

```
User uploads .tex file
       ↓
parseLatexToResume() extracts data → JSON
       ↓
Updates Zustand Store
       ↓
All editors sync automatically
```

### 4. **Exporting**

```
Export PDF:
  JSON → generateLatex() → compile → PDF download

Export LaTeX:
  JSON → generateLatex() → .tex download

Export Image:
  JSON → generateLatex() → compile → PDF → canvas → PNG download

Export JSON:
  JSON → direct download (backup/restore)
```

## 🏗️ Component Architecture

### Core Data Model (`src/lib/resume-model.ts`)

```typescript
interface Resume {
  header: {
    name: string;
    phone: string;
    email: string;
    links: Array<{ label: string; url: string }>;
  };
  sections: Array<{
    id: string;
    title: string;
    type: 'experience' | 'education' | 'projects' | 'skills' | 'custom';
    entries: ExperienceEntry[] | EducationEntry[] | ...;
  }>;
}
```

### State Management (`src/store/resume.ts`)

- **Zustand** for state management
- **localStorage** persistence
- **Versioning** for cache invalidation
- **Migration** support for schema changes

### LaTeX Generation (`src/lib/latex/template-jake/generator.ts`)

- Pure function: `Resume → LaTeX string`
- Uses Jake Gutierrez's template format
- ATS-compliant output
- Tabular alignment for clean PDFs

### PDF Parsing (`src/lib/latex/parser.ts`)

Three parser functions:

1. **`parseLatexToResume()`** - LaTeX → JSON

   - Extracts `\name{}`, `\email{}`, `\href{}` commands
   - Basic section parsing

2. **`parsePdfTextToResume()`** - PDF Text → JSON ✨ **IMPROVED**

   - Intelligent section detection
   - Date pattern recognition
   - Contact info extraction
   - Heuristic-based entry parsing

3. **`parsePdfToText()`** - PDF → Text
   - Uses `/api/parse-pdf` endpoint
   - pdf2json library

## 🔄 Why This Architecture Works

### ✅ Benefits

1. **Single Source of Truth**

   - No sync issues between editors
   - Data consistency guaranteed

2. **Unidirectional Data Flow**

   - Easy to debug
   - Predictable state changes

3. **Separation of Concerns**

   - Visual editing ≠ LaTeX editing
   - Each component does one thing well

4. **Format Agnostic**

   - Can add more templates easily
   - Can export to other formats (Word, HTML, etc.)

5. **Version Control Friendly**
   - JSON diffs are readable
   - Easy to track changes

### 🎯 Key Design Decisions

#### **Why Not LaTeX as Source of Truth?**

❌ LaTeX is a typesetting language, not a data format
❌ Hard to parse reliably
❌ Difficult to edit programmatically
✅ JSON is structured, validated, and universal

#### **Why Not PDF as Source of Truth?**

❌ PDFs are presentation format, not data
❌ Text extraction is lossy
❌ No structure/semantics
✅ JSON preserves all semantic information

#### **Why pdf2json?**

✅ Pure Node.js (no browser workers needed)
✅ Works in Next.js API routes
✅ Provides both text and structure
✅ No external dependencies

## 📁 File Organization

```
src/
├── lib/
│   ├── resume-model.ts              # Core data types
│   ├── latex/
│   │   ├── compiler.ts              # Compilation interface
│   │   ├── parser.ts                # PDF/LaTeX → JSON parsers
│   │   └── template-jake/
│   │       └── generator.ts         # JSON → LaTeX generator
│   └── validation.ts                # Zod schemas
├── store/
│   └── resume.ts                    # Zustand store (JSON state)
├── components/ResumeEditor/
│   ├── FormEditor.tsx               # Visual editor (edits JSON)
│   ├── LatexEditor.tsx              # LaTeX viewer (generates from JSON)
│   ├── Preview.tsx                  # PDF preview (compiles LaTeX)
│   ├── ImportDialog.tsx             # Upload & parse to JSON
│   └── DownloadDialog.tsx           # Export from JSON
└── app/api/
    ├── compile/route.ts             # LaTeX → PDF (production)
    ├── compile-mock/route.ts        # LaTeX → PDF (development)
    └── parse-pdf/route.ts           # PDF → Text extraction
```

## 🔍 Debugging Tips

### Issue: "PDF import doesn't work correctly"

1. Check extracted text: `console.log(parsedText)` in ImportDialog
2. Test parser: `parsePdfTextToResume(sampleText)`
3. Verify section headers match regex in parser

### Issue: "LaTeX preview doesn't match visual editor"

1. Check JSON state: `useResumeStore.getState().resume`
2. Verify LaTeX generation: `generateLatex(resume)`
3. Test compiler: upload .tex to compile-mock

### Issue: "Changes not persisting"

1. Check localStorage: `localStorage.getItem('jake-resume-storage')`
2. Verify storage version matches
3. Clear and reset if schema changed

## 🚀 Future Enhancements

### Potential Improvements

- [ ] AI-powered PDF parsing (GPT-4 Vision)
- [ ] Multiple LaTeX templates
- [ ] Export to Word/HTML
- [ ] Real-time collaboration
- [ ] Resume scoring/feedback
- [ ] Cover letter support

### Template System

```typescript
interface TemplateEngine {
  name: string;
  generateLatex: (resume: Resume) => string;
  preview?: string;
}

const templates = [jakeTemplate, modernTemplate, academicTemplate];
```

## 📚 References

- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [pdf2json](https://www.npmjs.com/package/pdf2json)
- [Jake's Resume Template](https://github.com/jakegut/resume)
- [ATS Resume Best Practices](https://resumegenius.com/blog/resume-help/ats-resume)
