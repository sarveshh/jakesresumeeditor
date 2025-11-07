# Jake's Resume Studio

> A LaTeX-powered ATS-compliant resume editor built with Next.js 15, Tailwind CSS, shadcn/ui, and Zustand.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 📝 **Visual Editor** - Edit resume with structured forms, no LaTeX knowledge required
- 💻 **LaTeX Editor** - Direct access to LaTeX source code for advanced users
- 🎯 **ATS-Compliant** - No tables, icons, or fancy formatting that breaks ATS systems
- 🔄 **Real-time Preview** - See PDF preview as you edit
- 🎨 **Drag & Drop** - Reorder sections with smooth animations
- 📥 **Import/Export** - Upload .tex or .pdf files, download in multiple formats
- ✅ **Validation** - Built-in validation for dates, emails, and phone numbers
- 💾 **Auto-Save** - All changes saved to localStorage automatically
- 🔒 **Privacy-First** - No account needed, all data stays in your browser
- 📱 **Responsive** - Works on desktop, tablet, and mobile

## 🚀 Quick Start

```bash
# Clone or download the project
cd JakesResumeEditor

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start editing your resume!

## 📖 Usage Guide

### Basic Editing

1. **Update Header**: Fill in your name, contact info, and links
2. **Add Experience**: Click sections to add work history, education, projects
3. **Reorder**: Drag sections by the grip icon to reorder
4. **Preview**: See real-time PDF preview on the right panel

### Import/Export

- **Import .tex**: Click "Import" → Upload LaTeX file
- **Import PDF**: Click "Import" → Upload PDF (text extraction)
- **Download PDF**: Click "Download" → Customize filename
- **Export LaTeX**: Settings → Export as .tex file
- **Backup Data**: Settings → Export as JSON

### Advanced Features

- **LaTeX Editing**: Switch to "LaTeX Editor" tab for direct code editing
- **Validation**: Dates use YYYY-MM format or "Present"
- **Reset**: Settings → Reset to Default Template
- **Customize**: All sections and entries are fully customizable

## 🛠️ Tech Stack

### Core

- **Framework**: Next.js 16.0 (App Router, Server Actions)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 3.4
- **UI Components**: shadcn/ui

### State & Forms

- **State Management**: Zustand (with localStorage persistence)
- **Form Handling**: React Hook Form
- **Validation**: Zod schemas

### Features

- **Drag & Drop**: @dnd-kit/core + sortable
- **PDF Generation**: pdf-lib (mock), Tectonic (production)
- **LaTeX**: Custom generator for ATS-compliant templates
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── compile/          # Production LaTeX compiler
│   │   ├── compile-mock/     # Development mock compiler
│   │   └── parse-pdf/        # PDF text extraction
│   ├── layout.tsx
│   └── page.tsx              # Main application
├── components/
│   ├── ResumeEditor/
│   │   ├── FormEditor.tsx        # Visual form editor
│   │   ├── LatexEditor.tsx       # Raw LaTeX editor
│   │   ├── Preview.tsx           # PDF preview
│   │   ├── ImportDialog.tsx      # File upload
│   │   ├── DownloadDialog.tsx    # Export options
│   │   ├── SettingsDialog.tsx    # App settings
│   │   └── DraggableSections.tsx # Drag & drop
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── latex/
│   │   ├── template-jake/generator.ts  # LaTeX generation
│   │   ├── compiler.ts                 # Compilation interface
│   │   └── parser.ts                   # Import parsing
│   ├── resume-model.ts                 # TypeScript models
│   └── validation.ts                   # Zod schemas
└── store/
    └── resume.ts                       # Zustand store
```

## 🎯 Implementation Status

| Feature      | Status | Description                           |
| ------------ | ------ | ------------------------------------- |
| Form Editor  | ✅     | Visual editing for all section types  |
| LaTeX Editor | ✅     | Direct LaTeX code editing             |
| PDF Preview  | ✅     | Real-time preview (mock compiler)     |
| Drag & Drop  | ✅     | Section reordering with @dnd-kit      |
| Import .tex  | ✅     | LaTeX file upload and parsing         |
| Import PDF   | 🟡     | Text extraction ready, mapping needed |
| Export PDF   | ✅     | Download with custom filename         |
| Export .tex  | ✅     | Download LaTeX source                 |
| Export JSON  | ✅     | Data backup                           |
| Validation   | ✅     | Zod schemas for all fields            |
| localStorage | ✅     | Auto-save on all changes              |
| Settings     | ✅     | Reset, export, data management        |

✅ Complete | 🟡 Partial | ❌ Not Started

## 🔧 Technical Details

### LaTeX Template

This project uses **Jake Gutierrez's original resume template** - a widely-used, ATS-compliant LaTeX template. The template is:

- ✅ **100% ATS Compatible** - No tables, icons, or complex formatting
- ✅ **Machine Readable** - Uses `\pdfgentounicode=1` for text extraction
- ✅ **Professional** - Clean typography and proper spacing
- ✅ **Flexible** - Supports all common resume sections
- ✅ **Open Source** - Based on the popular Jake's Resume template

Original template: [github.com/jakegut/resume](https://github.com/jakegut/resume)

### PDF Compilation

The app includes two compilation modes:

1. **Mock Compiler** (Default) - Fast, client-side PDF generation using pdf-lib

   - ✅ No server-side dependencies
   - ✅ Works offline
   - ✅ Instant preview (~50ms)
   - ⚠️ Approximates LaTeX output

2. **Tectonic** (Optional) - Real LaTeX compilation
   - ✅ Pixel-perfect typography
   - ✅ True LaTeX output
   - ⚠️ Requires server-side installation
   - ⚠️ Slower (~2-3s per compile)

**Recommendation:** Use mock compiler for editing, export .tex for final production PDF.

### Data Storage

All resume data is stored in your browser's localStorage:

- 🔒 **Privacy-first** - No server, no account, no tracking
- 💾 **Auto-save** - Every change saved automatically
- 🔄 **Versioned** - Old data automatically migrated
- 📦 **Exportable** - Export to JSON for backup

To clear data: Settings → Reset to Default Template

## 🎨 Customization

### Adding Custom Sections

You can add any type of section (Awards, Certifications, Publications, etc.):

1. Click "+ Add Section"
2. Name your section
3. Add entries with title, subtitle, location, date, and bullets
4. Drag to reorder

### Editing LaTeX Directly

For advanced users:

1. Switch to "LaTeX Editor" tab
2. Edit the source code directly
3. Changes sync back to visual editor
4. Preview updates in real-time

## 🚀 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or use Vercel GitHub integration
# Just push to GitHub and connect to Vercel
```

### Deploy to Netlify

```bash
# Build the app
npm run build

# Deploy to Netlify
# Drag and drop the .next folder to Netlify
```

### Environment Variables

No environment variables needed! The app runs entirely client-side.

If you want to add Tectonic compilation:

```env
ENABLE_TECTONIC=true  # Enable server-side compilation
```

## 📄 License

MIT License - feel free to use this for personal or commercial projects!

## 🙏 Credits

- **LaTeX Template**: [Jake Gutierrez](https://github.com/jakegut/resume)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Framework**: [Next.js](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

## 🐛 Troubleshooting

### PDF Preview Not Loading

1. Check browser console for errors
2. Try refreshing the page
3. Clear localStorage: Settings → Reset to Default
4. Make sure JavaScript is enabled

### Import Failed

- **.tex files**: Must be valid LaTeX syntax
- **PDF files**: Text extraction is experimental, .tex import is more reliable
- **JSON files**: Must be exported from this app

### Drag & Drop Not Working

1. Make sure you're clicking the grip icon (⋮⋮)
2. Try refreshing the page
3. Check if your browser supports drag and drop
4. Try on desktop (touch devices may have different behavior)

### Data Not Saving

1. Check if localStorage is enabled
2. Try incognito mode to rule out extensions
3. Check browser storage limits (usually 5-10MB)
4. Export to JSON as backup

## 💡 Tips & Best Practices

### Resume Writing Tips

1. **Use Action Verbs**: Start bullets with "Developed", "Led", "Implemented"
2. **Quantify Results**: Include numbers, percentages, and metrics
3. **Be Specific**: Mention specific technologies and tools
4. **Keep It Concise**: 1-2 pages maximum
5. **Tailor It**: Customize for each job application

### ATS Optimization

1. **Use Standard Section Names**: "Experience", "Education", "Skills"
2. **Include Keywords**: Match job description terms
3. **No Graphics**: Stick to text-only content
4. **Simple Formatting**: No tables or columns
5. **Standard Fonts**: The template uses Computer Modern (LaTeX default)

### Export Recommendations

- **For Viewing**: Export as PDF
- **For Editing**: Export as .tex or JSON
- **For Backup**: Export all formats regularly
- **For Sharing**: PDF is most compatible

## 🔮 Future Features (Coming Soon)

- [ ] Multiple resume templates
- [ ] AI-powered suggestions
- [ ] Resume critique tool
- [ ] Cover letter generator
- [ ] LinkedIn import
- [ ] Cloud sync (optional)
- [ ] Collaborative editing
- [ ] Version history

---

**Made with ❤️ for job seekers everywhere**

Star ⭐ this repo if it helped you land your dream job!

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Custom Commands (Windows)

```bash
run.bat dev              # Start dev server
run.bat build            # Build project
run.bat lint             # Run linter
run.bat clean            # Clean build artifacts
run.bat install-tectonic # Show Tectonic installation instructions
```

## 📦 Production Setup

### Enable Real PDF Compilation

1. **Install Tectonic**:

```bash
# Windows
choco install tectonic

# macOS
brew install tectonic

# Linux
cargo install tectonic
```

2. **Update Compiler**:

```typescript
// src/lib/latex/compiler.ts
const response = await fetch('/api/compile', { // Change from /api/compile-mock
```

3. **Uncomment Production Code**:

```typescript
// src/app/api/compile/route.ts
// Uncomment the Tectonic compilation code
```

## 🎨 Customization

### Add New Section Types

1. Define model in `src/lib/resume-model.ts`
2. Add validation in `src/lib/validation.ts`
3. Create entry component in `src/components/ResumeEditor/FormEditor.tsx`
4. Update LaTeX generator in `src/lib/latex/template-jake/generator.ts`

### Modify LaTeX Template

Edit `src/lib/latex/template-jake/generator.ts` to customize:

- Fonts and sizes
- Spacing and margins
- Section formatting
- Header layout

## 🐛 Known Issues & Limitations

- PDF compilation uses mock generator (install Tectonic for production PDFs)
- LaTeX editor changes don't sync back to form (one-way for now)
- PDF upload parsing needs smart field mapping
- Some TypeScript warnings (non-blocking)

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

The app is a standard Next.js application and can be deployed to:

- Netlify
- AWS Amplify
- Cloudflare Pages
- Docker containers

**Note**: For PDF compilation, ensure Tectonic is installed on the server.

## 📚 Documentation

- [QUICKSTART.md](./QUICKSTART.md) - User guide for getting started
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Detailed implementation status
- [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) - Full feature list

## 🤝 Contributing

This is a personal project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- LaTeX compilation by [Tectonic](https://tectonic-typesetting.github.io/)
- Icons by [Lucide](https://lucide.dev/)

## 📞 Support

For questions or issues:

- Check the documentation files
- Review the code comments
- Open an issue on GitHub

---

**Built with ❤️ for job seekers who want ATS-friendly resumes without sacrificing quality.**

Happy resume building! 🚀
