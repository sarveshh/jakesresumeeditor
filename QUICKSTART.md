# 🚀 Quick Start Guide

## Running the App

The development server is already running at:
**http://localhost:3000**

## First Steps

1. **Edit Your Information**

   - Update the header with your name, phone, email
   - Add your LinkedIn and GitHub links

2. **Add Experience**

   - Click on the Experience section
   - Fill in company, role, location, dates
   - Add achievement bullets

3. **Add More Sections**

   - Scroll down to add Education, Projects, Skills
   - Click "Add Entry" to add more items
   - Click "Add Section" at the bottom for custom sections

4. **View LaTeX Code**

   - Click the "LaTeX Editor" tab at the top
   - See the generated LaTeX code
   - (Advanced) Edit the LaTeX directly

5. **Preview & Download**
   - Right panel shows PDF preview
   - Click "Download" to save your resume
   - Currently using mock PDF (install Tectonic for production quality)

## Commands

```powershell
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Keyboard Shortcuts

- **Ctrl + S** - Auto-saves (already auto-saving to localStorage)
- **Ctrl + Click** on sections to expand/collapse

## Tips

- All your changes are automatically saved to browser localStorage
- Data persists even after closing the browser
- No account needed - completely anonymous
- To reset, clear browser localStorage or click the reset button (todo)

## Common Tasks

### Change Section Order

- (Coming in v0.4) Drag the grip icon to reorder

### Add Multiple Jobs

- Click "Add Entry" in the Experience section
- Fill in details for each position

### Delete a Section

- Click the trash icon in the section header

### Export Resume

- Click "Download" in the preview panel
- File saves as `YourName_Resume.pdf`

## Troubleshooting

### Preview not showing?

- Click "Refresh" button in the preview panel
- Check browser console for errors (F12)

### Data disappeared?

- Check if localStorage is enabled
- Don't use incognito/private mode

### Want higher quality PDFs?

- Install Tectonic: `choco install tectonic`
- See PROJECT_STATUS.md for instructions

## What's Next?

Check out:

- `PROJECT_STATUS.md` - Full implementation status
- `README.md` - Technical documentation
- `src/lib/resume-model.ts` - Data structure

Happy resume building! 🎯
