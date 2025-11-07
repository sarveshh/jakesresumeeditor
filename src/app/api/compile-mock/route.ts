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

    console.log("📄 Compiling LaTeX - First 50 lines:");
    console.log(latex.split('\n').slice(0, 50).join('\n'));
    console.log("...");

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

    // Parse and render content
    let inCenter = false;
    let currentSection = "";
    let skipNextLines = 0;
    let inPreamble = true; // Skip everything until \begin{document}

    for (let i = 0; i < lines.length; i++) {
      // Skip lines if we consumed them in a multi-line command
      if (skipNextLines > 0) {
        skipNextLines--;
        continue;
      }

      const line = lines[i].trim();
      if (!line || line.startsWith("%")) continue;

      // Check if we're entering the document body
      if (line.includes("\\begin{document}")) {
        inPreamble = false;
        continue;
      }

      // Skip EVERYTHING in the preamble
      if (inPreamble) {
        continue;
      }

      checkNewPage(20);

      // Skip preamble and document commands - but BEFORE \begin{document}
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
        line.startsWith("\\renewcommand") ||
        line.startsWith("\\input{") ||
        line.startsWith("\\pagestyle") ||
        line.startsWith("\\fancyhf") ||
        line.startsWith("\\fancyfoot") ||
        line.includes("\\resumeSubHeadingListStart") ||
        line.includes("\\resumeSubHeadingListEnd") ||
        line.includes("\\resumeItemListStart") ||
        line.includes("\\resumeItemListEnd") ||
        line.includes("\\color{black}") ||
        line.includes("\\titlerule") ||
        line.match(/^[#\$&\\{}]+$/) || // LaTeX special chars
        line.match(/^•\s*small\s*$/) || // • small
        line.match(/^•\s*-?\d+pt\s*$/) || // • -2pt, •-2pt
        line.match(/^#\d+\s*&\s*#\d+/) || // #1 & #2, #3 & #4
        line.match(/^#\d+\s*\\vspace/) || // #1 \vspace{-2pt}
        line.match(/^#\d+\s*\\vspace\{[^}]*\}\}/) || // #1 \vspace{-2pt}}
        line.match(/^\s*\\vspace\{[^}]*\}\}/) || // \vspace{-2pt}}
        line.match(/^\s*\\vspace/) || // Standalone \vspace{...}
        line.match(/^•-?\d+pt/) || // •-2pt (no space)
        line.match(/^\s*\\item\s*$/) || // Empty \item
        line.trim() === "#1 \\vspace{-2pt}}" || // Exact match for artifact
        line.trim() === "#3 & #4" || // Exact match for artifact
        line.trim() === "#1 & #2" || // Exact match for artifact
        line.includes("\\extracolsep") ||
        line.includes("\\textwidth") ||
        line.includes("\\begin{tabular") ||
        line.includes("\\end{tabular") ||
        line.includes("\\textbf{#") ||
        line.includes("\\textit{#") ||
        line === "}" || // Standalone closing brace
        line === "{" || // Standalone opening brace
        line.includes("%%%%%%") // Comment separators
      ) {
        continue;
      }

      // Center environment for header
      if (line.includes("\\begin{center}")) {
        inCenter = true;
        y -= 5;
        continue;
      }
      if (line.includes("\\end{center}")) {
        inCenter = false;
        y -= 15;
        continue;
      }

      // Header - Extract name from \Huge \scshape
      if (line.includes("\\Huge") && line.includes("\\scshape")) {
        // Extract text between \scshape and end of line
        const nameMatch = line.match(/\\scshape\s+([^\\}]+)/);
        if (nameMatch) {
          const name = nameMatch[1].trim().replace(/[{}]/g, "");
          checkNewPage(25);
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

      // Contact line in center (with \small, \href, $|$)
      if (
        inCenter &&
        (line.includes("\\small") ||
          line.includes("\\href") ||
          line.includes("$|$"))
      ) {
        // Extract links and text
        const hrefMatches = [
          ...line.matchAll(
            /\\href\{([^}]+)\}\{\\underline\{([^}]+)\}\}|\\href\{mailto:([^}]+)\}\{\\underline\{([^}]+)\}\}|\\href\{([^}]+)\}\{([^}]+)\}/g
          ),
        ];

        if (hrefMatches.length > 0) {
          const yPosition = y;

          // Split by parts: plain text and links
          const remainingLine = line
            .replace(/\\small/g, "")
            .replace(/\\\\/g, "")
            .replace(/\\n\s*/g, " ");

          // Calculate total width first to center the entire line
          let totalWidth = 0;

          // Check if there's phone number
          const phoneMatch = remainingLine.match(/^\s*([\+\d\s-]+)\s*\$\|\$/);
          if (phoneMatch) {
            const phone = phoneMatch[1].trim();
            totalWidth += (phone.length + 3) * 5.5; // phone + " | "
          }

          // Add width of each link + separators
          for (let i = 0; i < hrefMatches.length; i++) {
            const match = hrefMatches[i];
            const label = match[2] || match[4] || match[6];
            if (label) {
              const cleanLabel = label
                .replace(/\\underline\{([^}]+)\}/g, "$1")
                .replace(/[{}]/g, "");
              totalWidth += cleanLabel.length * 5.5;
              if (i < hrefMatches.length - 1) {
                totalWidth += 15; // separator " | "
              }
            }
          }

          // Start from center - half of total width
          let xPosition = (width - totalWidth) / 2;

          // Draw phone number if exists
          if (phoneMatch) {
            const phone = phoneMatch[1].trim();
            page.drawText(phone + " | ", {
              x: xPosition,
              y: yPosition,
              size: 10,
              font: font,
              color: rgb(0, 0, 0),
            });
            xPosition += (phone.length + 3) * 5.5;
          }

          // Now draw each link
          for (let i = 0; i < hrefMatches.length; i++) {
            const match = hrefMatches[i];
            const url = match[1] || match[3] || match[5];
            const label = match[2] || match[4] || match[6];

            if (url && label) {
              const cleanLabel = label
                .replace(/\\underline\{([^}]+)\}/g, "$1")
                .replace(/[{}]/g, "");
              const cleanUrl = url.replace(/mailto:/g, "");

              // Draw the link text (black, not blue)
              page.drawText(cleanLabel, {
                x: xPosition,
                y: yPosition,
                size: 10,
                font: font,
                color: rgb(0, 0, 0), // Black color like regular text
              });

              // Add underline for links
              const linkWidth = cleanLabel.length * 5.5;
              page.drawLine({
                start: { x: xPosition, y: yPosition - 1 },
                end: { x: xPosition + linkWidth, y: yPosition - 1 },
                thickness: 0.5,
                color: rgb(0, 0, 0), // Black underline
              });

              // Create clickable link annotation
              const linkAnnot = pdfDoc.context.obj({
                Type: "Annot",
                Subtype: "Link",
                Rect: [
                  xPosition,
                  yPosition - 2,
                  xPosition + linkWidth,
                  yPosition + 12,
                ],
                Border: [0, 0, 0],
                A: pdfDoc.context.obj({
                  S: "URI",
                  URI: pdfDoc.context.obj(
                    url.startsWith("http") || url.startsWith("mailto:")
                      ? url
                      : `https://${cleanUrl}`
                  ),
                }),
              });

              // Add annotation to page
              const annots = page.node.get(pdfDoc.context.obj("Annots"));
              if (annots) {
                const annotsArray = page.node.context.lookup(annots);
                if (annotsArray instanceof Array) {
                  page.node.set(
                    pdfDoc.context.obj("Annots"),
                    pdfDoc.context.obj([...annotsArray, linkAnnot])
                  );
                }
              } else {
                page.node.set(
                  pdfDoc.context.obj("Annots"),
                  pdfDoc.context.obj([linkAnnot])
                );
              }

              xPosition += linkWidth + 15; // Space after link and separator

              // Add separator if not last
              if (i < hrefMatches.length - 1) {
                page.drawText("| ", {
                  x: xPosition,
                  y: yPosition,
                  size: 10,
                  font: font,
                  color: rgb(0, 0, 0),
                });
                xPosition += 10;
              }
            }
          }

          y -= 14;
        } else {
          // Fallback to simple text rendering if no links found
          const contact = line
            .replace(/\\small/g, "")
            .replace(/\\href\{([^}]+)\}\{\\underline\{([^}]+)\}\}/g, "$2")
            .replace(
              /\\href\{mailto:([^}]+)\}\{\\underline\{([^}]+)\}\}/g,
              "$2"
            )
            .replace(/\\href\{([^}]+)\}\{([^}]+)\}/g, "$2")
            .replace(/\$\|\$/g, " | ")
            .replace(/\\n\s*/g, " ")
            .replace(/\\\\/g, "")
            .replace(/[{}]/g, "")
            .trim();

          if (contact && contact.length > 0 && contact.length < 250) {
            checkNewPage(15);
            page.drawText(contact, {
              x: width / 2 - contact.length * 2.5,
              y: y,
              size: 10,
              font: font,
              color: rgb(0, 0, 0),
            });
            y -= 14;
          }
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

        console.log("📋 Section:", currentSection, "Y:", y);

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
        // Extract the four arguments - they span multiple lines
        let fullLine = line;
        let lineIdx = i;
        let consumed = 0;

        // Keep reading lines until we have all 4 arguments (4 opening and 4 closing braces)
        let openBraces = (fullLine.match(/{/g) || []).length;
        let closeBraces = (fullLine.match(/}/g) || []).length;

        while (
          openBraces < 4 ||
          closeBraces < 4 ||
          openBraces !== closeBraces
        ) {
          lineIdx++;
          consumed++;
          if (lineIdx >= lines.length) break;
          const nextLine = lines[lineIdx].trim();
          if (!nextLine) continue; // Skip empty lines
          fullLine += " " + nextLine;
          openBraces = (fullLine.match(/{/g) || []).length;
          closeBraces = (fullLine.match(/}/g) || []).length;

          // Safety break if we've consumed too many lines
          if (consumed > 10) break;
        }

        // Extract the four arguments
        const match = fullLine.match(
          /\\resumeSubheading\s*{([^}]+)}\s*{([^}]+)}\s*{([^}]+)}\s*{([^}]+)}/
        );
        if (match) {
          const [, company, dates, role, location] = match;

          console.log(
            "🏢 resumeSubheading - Company:",
            company,
            "Dates:",
            dates,
            "Role:",
            role,
            "Location:",
            location,
            "Y:",
            y
          );

          // Line 1: Company (left, bold) | Dates (right)
          page.drawText(company, {
            x: margin,
            y: y,
            size: 10,
            font: boldFont,
            color: rgb(0, 0, 0),
          });

          const cleanDates = dates.replace(/--/g, "–").trim();
          if (cleanDates) {
            page.drawText(cleanDates, {
              x: width - margin - cleanDates.length * 5.5,
              y: y,
              size: 10,
              font: font,
              color: rgb(0, 0, 0),
            });
          }
          y -= 12;

          // Line 2: Role (left, italic) | Location (right, italic)
          page.drawText(role, {
            x: margin,
            y: y,
            size: 10,
            font: italicFont,
            color: rgb(0, 0, 0),
          });

          if (location.trim()) {
            page.drawText(location, {
              x: width - margin - location.length * 5.5,
              y: y,
              size: 10,
              font: italicFont,
              color: rgb(0, 0, 0),
            });
          }
          y -= 14;

          // Skip the lines we consumed
          skipNextLines = consumed;
        }
      }
      // Also catch bare brace lines that might be arguments to commands above
      else if (line.match(/^\s*{[^}]*}\s*{[^}]*}\s*$/)) {
        // This is likely part of a command we should have caught - skip it
        continue;
      } else if (line.match(/^\s*{[^}]*}\s*$/)) {
        // Single argument line - skip it
        continue;
      }
      // Skip lines that look like they're from the preamble or template definition
      else if (
        line.match(/^--\s*$/) || // Just dashes
        line.match(/^\\\\+\s*$/) || // Just line breaks
        line.match(/^[&\\]+$/) || // Ampersands and backslashes
        line.length < 3 // Very short lines that are probably artifacts
      ) {
        continue;
      }
      // Handle \resumeProjectHeading{Project | Tech}{Date}
      else if (line.includes("\\resumeProjectHeading")) {
        checkNewPage(30);

        // Extract arguments - may be multiline
        let fullLine = line;
        let lineIdx = i;
        let consumed = 0;

        while (
          (fullLine.match(/{/g) || []).length < 2 ||
          (fullLine.match(/}/g) || []).length < 2
        ) {
          lineIdx++;
          consumed++;
          if (lineIdx >= lines.length) break;
          fullLine += " " + lines[lineIdx].trim();
        }

        const match = fullLine.match(
          /\\resumeProjectHeading\s*{([^}]+)}\s*{([^}]*)}/
        );
        if (match) {
          const [, projectTech, dates] = match;

          console.log(
            "🎯 resumeProjectHeading - Title:",
            projectTech,
            "Dates:",
            dates,
            "Y:",
            y
          );

          page.drawText(projectTech, {
            x: margin,
            y: y,
            size: 10,
            font: boldFont,
            color: rgb(0, 0, 0),
          });

          if (dates && dates.trim()) {
            const cleanDates = dates.replace(/--/g, "–");
            page.drawText(cleanDates, {
              x: width - margin - cleanDates.length * 5.5,
              y: y,
              size: 10,
              font: font,
              color: rgb(0, 0, 0),
            });
          }
          y -= 14;
          skipNextLines = consumed;
        } else {
          console.log("❌ resumeProjectHeading NO MATCH - Line:", fullLine);
        }
      } else if (line.includes("\\resumeProjectHeading")) {
        checkNewPage(30);

        // Extract arguments - may be multiline
        let fullLine = line;
        let lineIdx = i;
        let consumed = 0;

        while (
          (fullLine.match(/{/g) || []).length < 2 ||
          (fullLine.match(/}/g) || []).length < 2
        ) {
          lineIdx++;
          consumed++;
          if (lineIdx >= lines.length) break;
          fullLine += " " + lines[lineIdx].trim();
        }

        const match = fullLine.match(
          /\\resumeProjectHeading\s*{([^}]+)}\s*{([^}]*)}/
        );
        if (match) {
          const [, projectTech, dates] = match;

          page.drawText(projectTech, {
            x: margin,
            y: y,
            size: 10,
            font: boldFont,
            color: rgb(0, 0, 0),
          });

          if (dates && dates.trim()) {
            const cleanDates = dates.replace(/--/g, "–");
            page.drawText(cleanDates, {
              x: width - margin - cleanDates.length * 5.5,
              y: y,
              size: 10,
              font: font,
              color: rgb(0, 0, 0),
            });
          }
          y -= 14;
          skipNextLines = consumed;
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
        continue;
      } else if (line.includes("\\end{itemize}")) {
        y -= 6;
        continue;
      }
      // Bullet points - but skip if it's just wrapping (has \small{\item{)
      else if (line.includes("\\item") && !line.includes("\\small{\\item{")) {
        checkNewPage(15);
        const text = line
          .replace(/\\item/g, "")
          .replace(/\\small/g, "") // Remove \small
          .replace(/\\[a-zA-Z]+{([^}]+)}/g, "$1")
          .replace(/[{}\\]/g, "")
          .trim();

        if (text && text.length > 0 && !text.match(/^(small|item)$/)) {
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
      // Skills (category: skills) - handle \textbf{Category}{: value}
      else if (line.includes("\\textbf{") && line.includes("}{:")) {
        checkNewPage(15);
        // Extract category and skills: \textbf{Languages}{: Python, JavaScript, SQL}
        const match = line.match(/\\textbf\{([^}]+)\}\{:\s*([^}]+)\}/);
        if (match) {
          const category = match[1];
          const skills = match[2];

          // Draw category in bold
          page.drawText(category + ": ", {
            x: margin,
            y: y,
            size: 9,
            font: boldFont,
            color: rgb(0, 0, 0),
          });

          // Calculate width of category text to position skills after it
          const categoryWidth = (category.length + 2) * 5.5; // Approximate width

          // Draw skills in regular font
          page.drawText(skills, {
            x: margin + categoryWidth,
            y: y,
            size: 9,
            font: font,
            color: rgb(0, 0, 0),
          });
          y -= 11;
        }
      }
      // Skills (category: skills) - plain format
      else if (
        line.includes(":") &&
        !line.includes("\\") &&
        line.length < 200 &&
        !line.includes("small") // Skip lines with "small"
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
        // Skip lines that are just curly braces (LaTeX artifacts)
        if (line.match(/^[{}]+$/) || line.match(/^{[^}]*}$/)) {
          continue;
        }

        // Skip lines that look like standalone dates (e.g., "Jun 2023 – Present")
        if (line.match(/^\w{3}\s+\d{4}\s*[–-]\s*(\w{3}\s+\d{4}|Present)$/i)) {
          continue;
        }

        // Skip lines that are just city names (common locations)
        if (
          line.match(
            /^(Mumbai|Pune|Delhi|Bangalore|Hyderabad|Chennai|Kolkata|Remote)$/i
          )
        ) {
          continue;
        }

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
