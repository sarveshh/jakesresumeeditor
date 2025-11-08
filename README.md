# Jake's Resume Studio

A modern, web-based resume builder that allows you to create, edit, and export professional ATS-friendly resumes with real-time preview. Built with Next.js and featuring both visual and LaTeX editing modes.

## ✨ Features

### 🎨 Dual Editing Modes
- **Visual Editor** - User-friendly form-based interface for easy resume editing
- **LaTeX Editor** - Direct LaTeX code editing for advanced users with syntax highlighting

### 📝 Resume Sections
- Header with contact information (name, email, phone, links)
- Work Experience with company, position, dates, and bullet points
- Education history
- Projects showcase
- Skills listing
- Custom sections for additional information

### 🔄 Import & Export
- **Import from:**
  - PDF files (automatic text extraction and parsing)
  - LaTeX (.tex) files
  - JSON backup files
- **Export to:**
  - PDF (production-ready resume)
  - LaTeX source code
  - PNG image
  - JSON (for backup/restore)

### 🎯 Key Features
- **Real-time PDF Preview** - See your changes instantly
- **Auto-save** - Changes are automatically saved to local storage
- **Drag & Drop Sections** - Reorder resume sections with ease
- **ATS-Friendly** - Uses Jake Gutierrez's proven resume template
- **Responsive Design** - Works on desktop and tablet devices
- **No Server Required** - All processing happens in your browser

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sarveshh/jakesresumeeditor.git
cd jakesresumeeditor
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## 🛠️ Technology Stack

- **Framework:** Next.js 16.0.1 (React 19.2.0)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4.0
- **State Management:** Zustand
- **UI Components:** Radix UI
- **PDF Generation:** @react-pdf/renderer, pdf-lib
- **PDF Parsing:** pdfjs-dist, pdf-parse-fork
- **Form Handling:** React Hook Form with Zod validation
- **Drag & Drop:** @dnd-kit
- **Icons:** Lucide React

## 📖 Usage Guide

### Creating Your First Resume

1. **Start Editing**
   - Open the app and you'll see the Visual Editor by default
   - Fill in your header information (name, email, phone)
   - Add links to your LinkedIn, GitHub, or portfolio

2. **Add Sections**
   - Click "Add Section" to create experience, education, or custom sections
   - Use the drag handle to reorder sections
   - Fill in details for each entry

3. **Preview in Real-time**
   - The right panel shows a live PDF preview
   - Changes appear instantly as you type

4. **Export Your Resume**
   - Click the Settings icon (gear) in the top right
   - Choose your export format (PDF, LaTeX, PNG, or JSON)
   - Download your professional resume

### Importing Existing Resumes

1. Click the "Import" button in the top right
2. Choose your file type (PDF, LaTeX, or JSON)
3. Upload your file
4. The app will automatically parse and populate your resume data

### Using LaTeX Editor

1. Switch to the "LaTeX Editor" tab
2. View the generated LaTeX code
3. Copy the code to use in your own LaTeX environment
4. Or download the .tex file directly

## 📁 Project Structure

```
src/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── compile/              # LaTeX to PDF compilation
│   │   ├── compile-mock/         # Mock compiler for development
│   │   └── parse-pdf/            # PDF text extraction
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/
│   ├── ResumeEditor/             # Main editor components
│   │   ├── FormEditor.tsx        # Visual form editor
│   │   ├── LatexEditor.tsx       # LaTeX code editor
│   │   ├── Preview.tsx           # PDF preview panel
│   │   ├── ImportDialog.tsx      # Import functionality
│   │   ├── DownloadDialog.tsx    # Export functionality
│   │   ├── SettingsDialog.tsx    # Settings and export options
│   │   └── DraggableSections.tsx # Drag and drop for sections
│   └── ui/                       # Reusable UI components
├── lib/
│   ├── latex/
│   │   ├── compiler.ts           # LaTeX compilation interface
│   │   ├── parser.ts             # PDF/LaTeX to JSON parsers
│   │   └── template-jake/
│   │       └── generator.ts      # JSON to LaTeX generator
│   ├── resume-model.ts           # Core data types
│   ├── validation.ts             # Zod validation schemas
│   └── utils.ts                  # Utility functions
└── store/
    └── resume.ts                 # Zustand state management
```

## 🏗️ Architecture

This application follows a **data-centric architecture** with JSON as the single source of truth. All editing modes (Visual and LaTeX) work with a unified JSON data model stored in Zustand.

For detailed architecture documentation, see [ARCHITECTURE.md](ARCHITECTURE.md).

### Key Design Principles

1. **JSON as Single Source of Truth** - All resume data is stored in a validated JSON structure
2. **Unidirectional Data Flow** - Changes flow from editor → JSON → LaTeX → PDF
3. **Separation of Concerns** - Each component has a single responsibility
4. **Format Agnostic** - Easy to add new templates or export formats

## 🔧 Development

### Running Linter

```bash
npm run lint
```

### Building the Project

```bash
npm run build
```

### Project Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Resume template based on [Jake Gutierrez's resume](https://github.com/jakegut/resume)
- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide](https://lucide.dev/)

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

Made with ❤️ for job seekers everywhere
