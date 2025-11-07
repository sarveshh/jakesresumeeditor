/**
 * Development Mock PDF Compiler
 * Returns a simple placeholder PDF for development without Tectonic
 */

import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    const { latex } = await request.json();

    if (!latex) {
      return NextResponse.json(
        { message: "LaTeX source is required" },
        { status: 400 }
      );
    }

    // Create a simple PDF using pdf-lib for development
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([612, 792]); // Letter size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const { height, width } = page.getSize();
    const margin = 54; // 0.75 inch
    let y = height - margin;

    // Helper to add new page if needed
    const checkNewPage = (requiredSpace: number) => {
      if (y - requiredSpace < margin) {
        page = pdfDoc.addPage([612, 792]);
        y = height - margin;
        return true;
      }
      return false;
    };

    // Simple text rendering from LaTeX
    const lines = latex.split("\n");

    page.drawText("DEVELOPMENT PREVIEW - Install Tectonic for production", {
      x: margin,
      y: y,
      size: 8,
      font: font,
      color: rgb(0.6, 0.6, 0.6),
    });

    y -= 25;

    // Parse and render content
    let inTabular = false;
    let currentSection = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith("%")) continue;

      checkNewPage(20);

      // Skip preamble and document commands
      if (
        line.startsWith("\\documentclass") ||
        line.startsWith("\\usepackage") ||
        line.startsWith("\\begin{document}") ||
        line.startsWith("\\end{document}") ||
        line.startsWith("\\addtolength") ||
        line.startsWith("\\setlength") ||
        line.startsWith("\\urlstyle") ||
        line.startsWith("\\raggedbottom") ||
        line.startsWith("\\raggedright") ||
        line.startsWith("\\pdfgentounicode") ||
        line.startsWith("\\titleformat") ||
        line.startsWith("\\newcommand") ||
        line.includes("\\resumeSubHeadingListStart") ||
        line.includes("\\resumeSubHeadingListEnd") ||
        line.includes("\\resumeItemListStart") ||
        line.includes("\\resumeItemListEnd")
      ) {
        continue;
      }

      // Header - Extract name from \Huge \scshape
      if (line.includes("\\Huge") && line.includes("\\scshape")) {
        // Extract text between \scshape and end of line
        const nameMatch = line.match(/\\scshape\s+([^\\]+)/);
        if (nameMatch) {
          const name = nameMatch[1].trim().replace(/[{}]/g, "");
          page.drawText(name, {
            x: width / 2 - name.length * 6,
            y: y,
            size: 18,
            font: boldFont,
            color: rgb(0, 0, 0),
          });
          y -= 22;
        }
        continue;
      }

      // Contact info - parse the tabular environment
      if (line.includes("\\begin{tabular}")) {
        inTabular = true;
        continue;
      }
      if (line.includes("\\end{tabular}")) {
        inTabular = false;
        y -= 5;
        continue;
      }
      if (inTabular) {
        // Parse contact line: \small \href{url}{text} $|$ \href{url}{text}
        const contact = line
          .replace(/\\small/g, "")
          .replace(/\\href{([^}]+)}{([^}]+)}/g, "$2")
          .replace(/\$\|\$/g, " | ")
          .replace(/\\\\/g, "")
          .replace(/[{}]/g, "")
          .trim();

        if (contact && contact.length > 0 && contact.length < 200) {
          page.drawText(contact, {
            x: width / 2 - contact.length * 2.5,
            y: y,
            size: 10,
            font: font,
            color: rgb(0, 0, 0),
          });
          y -= 14;
        }
        continue;
      }
      // Section headers
      else if (line.includes("\\section")) {
        y -= 8;
        checkNewPage(30);
        currentSection = line
          .replace(/\\section\*?{([^}]+)}.*/, "$1")
          .replace(/\\scshape/g, "")
          .trim()
          .toUpperCase();

        page.drawText(currentSection, {
          x: margin,
          y: y,
          size: 10,
          font: boldFont,
          color: rgb(0, 0, 0),
        });

        // Draw underline
        page.drawLine({
          start: { x: margin, y: y - 2 },
          end: { x: width - margin, y: y - 2 },
          thickness: 0.5,
          color: rgb(0, 0, 0),
        });
        y -= 14;
      }
      // Handle \resumeSubheading{Company}{Date}{Role}{Location}
      else if (line.includes("\\resumeSubheading")) {
        checkNewPage(40);
        // Extract the four arguments
        const match = line.match(
          /\\resumeSubheading{([^}]+)}{([^}]+)}{([^}]+)}{([^}]+)}/
        );
        if (match) {
          const [, company, dates, role, location] = match;

          // Line 1: Company (left) | Dates (right)
          page.drawText(company, {
            x: margin,
            y: y,
            size: 10,
            font: boldFont,
            color: rgb(0, 0, 0),
          });

          page.drawText(dates, {
            x: width - margin - dates.length * 5.5,
            y: y,
            size: 10,
            font: font,
            color: rgb(0, 0, 0),
          });
          y -= 12;

          // Line 2: Role (left, italic) | Location (right, italic)
          page.drawText(role, {
            x: margin,
            y: y,
            size: 10,
            font: italicFont,
            color: rgb(0, 0, 0),
          });

          page.drawText(location, {
            x: width - margin - location.length * 5.5,
            y: y,
            size: 10,
            font: italicFont,
            color: rgb(0, 0, 0),
          });
          y -= 14;
        }
      }
      // Handle \resumeProjectHeading{Project | Tech}{Date}
      else if (line.includes("\\resumeProjectHeading")) {
        checkNewPage(30);
        const match = line.match(/\\resumeProjectHeading{([^}]+)}{([^}]+)}/);
        if (match) {
          const [, projectTech, dates] = match;

          page.drawText(projectTech, {
            x: margin,
            y: y,
            size: 10,
            font: boldFont,
            color: rgb(0, 0, 0),
          });

          if (dates) {
            page.drawText(dates, {
              x: width - margin - dates.length * 5.5,
              y: y,
              size: 10,
              font: font,
              color: rgb(0, 0, 0),
            });
          }
          y -= 14;
        }
      }
      // Handle \resumeItem{text}
      else if (line.includes("\\resumeItem{")) {
        checkNewPage(15);
        const text = line
          .replace(/\\resumeItem{/, "")
          .replace(/}$/, "")
          .replace(/\\[a-zA-Z]+{([^}]+)}/g, "$1")
          .replace(/[{}\\]/g, "")
          .trim();

        if (text && text.length > 0) {
          // Bullet point
          page.drawText("•", {
            x: margin + 8,
            y: y,
            size: 10,
            font: font,
            color: rgb(0, 0, 0),
          });

          // Wrap text if needed
          const maxWidth = width - margin * 2 - 20;
          const words = text.split(" ");
          let currentLine = "";
          const textLines = [];

          for (const word of words) {
            const testLine = currentLine ? currentLine + " " + word : word;
            const testWidth = testLine.length * 5.3;

            if (testWidth > maxWidth && currentLine) {
              textLines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) textLines.push(currentLine);

          for (let j = 0; j < textLines.length; j++) {
            page.drawText(textLines[j], {
              x: margin + 20,
              y: y,
              size: 9,
              font: font,
              color: rgb(0, 0, 0),
            });
            y -= 11;
            checkNewPage(15);
          }
          y -= 2;
        }
      }
      // Company/Institution (bold text) - fallback for old format
      else if (line.includes("\\textbf{") && !line.includes("\\Large")) {
        checkNewPage(40);
        const parts = line.split("\\hfill");
        const leftPart = parts[0]
          .replace(/\\noindent/g, "")
          .replace(/\\textbf{([^}]+)}/g, "$1")
          .replace(/\\[a-zA-Z]+/g, "")
          .replace(/[{}\\]/g, "")
          .trim();

        if (leftPart && leftPart.length < 100) {
          page.drawText(leftPart, {
            x: margin,
            y: y,
            size: 10,
            font: boldFont,
            color: rgb(0, 0, 0),
          });

          // Right-aligned text (location)
          if (parts[1]) {
            const rightPart = parts[1]
              .replace(/\\[a-zA-Z]+{([^}]+)}/g, "$1")
              .replace(/[{}\\]/g, "")
              .trim();
            if (rightPart && rightPart.length < 50) {
              page.drawText(rightPart, {
                x: width - margin - rightPart.length * 5,
                y: y,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
            }
          }
          y -= 12;
        }
      }
      // Role/Degree (italic text)
      else if (line.includes("\\textit{")) {
        const parts = line.split("\\hfill");
        const leftPart = parts[0]
          .replace(/\\textit{([^}]+)}/g, "$1")
          .replace(/\\[a-zA-Z]+/g, "")
          .replace(/[{}\\]/g, "")
          .trim();

        if (leftPart && leftPart.length < 100) {
          page.drawText(leftPart, {
            x: margin,
            y: y,
            size: 10,
            font: italicFont,
            color: rgb(0, 0, 0),
          });

          // Right-aligned text (dates)
          if (parts[1]) {
            const rightPart = parts[1]
              .replace(/\\[a-zA-Z]+/g, "")
              .replace(/[{}\\]/g, "")
              .trim();
            if (rightPart && rightPart.length < 50) {
              page.drawText(rightPart, {
                x: width - margin - rightPart.length * 5,
                y: y,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
            }
          }
          y -= 12;
        }
      }
      // Itemize environment (for skills bullets)
      else if (line.includes("\\begin{itemize}")) {
        y -= 2;
      } else if (line.includes("\\end{itemize}")) {
        y -= 6;
      }
      // Bullet points
      else if (line.includes("\\item")) {
        checkNewPage(15);
        const text = line
          .replace(/\\item/g, "")
          .replace(/\\[a-zA-Z]+{([^}]+)}/g, "$1")
          .replace(/[{}\\]/g, "")
          .trim();

        if (text && text.length > 0) {
          // Bullet point
          page.drawText("•", {
            x: margin + 8,
            y: y,
            size: 9,
            font: font,
            color: rgb(0, 0, 0),
          });

          // Wrap text if too long
          const maxWidth = width - margin * 2 - 20;
          const words = text.split(" ");
          let currentLine = "";

          for (const word of words) {
            const testLine = currentLine + (currentLine ? " " : "") + word;
            if (testLine.length * 5 > maxWidth) {
              if (currentLine) {
                page.drawText(currentLine, {
                  x: margin + 18,
                  y: y,
                  size: 9,
                  font: font,
                  color: rgb(0, 0, 0),
                });
                y -= 11;
                checkNewPage(11);
              }
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }

          if (currentLine) {
            page.drawText(currentLine, {
              x: margin + 18,
              y: y,
              size: 9,
              font: font,
              color: rgb(0, 0, 0),
            });
            y -= 11;
          }
        }
      }
      // Skills (category: skills)
      else if (
        line.includes(":") &&
        !line.includes("\\") &&
        line.length < 200
      ) {
        checkNewPage(15);
        const text = line
          .replace(/\\[a-zA-Z]+/g, "")
          .replace(/[{}]/g, "")
          .trim();
        if (text) {
          page.drawText(text, {
            x: margin,
            y: y,
            size: 9,
            font: font,
            color: rgb(0, 0, 0),
          });
          y -= 11;
        }
      }
      // Regular text (degrees, details without bullets)
      else if (!line.startsWith("\\") && line.length > 0 && line.length < 200) {
        checkNewPage(15);
        const text = line.trim();
        if (text && !text.match(/^(begin|end|document|item)/)) {
          page.drawText(text.substring(0, 90), {
            x: margin,
            y: y,
            size: 9,
            font: font,
            color: rgb(0, 0, 0),
          });
          y -= 11;
        }
      }
    }

    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="resume-preview.pdf"',
      },
    });
  } catch (error) {
    console.error("Mock compilation error:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Compilation failed",
      },
      { status: 500 }
    );
  }
}
