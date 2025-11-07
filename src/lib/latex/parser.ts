/**
 * LaTeX Parser
 * Parses .tex files and extracts structured data
 */

import {
  CustomEntry,
  EducationEntry,
  ExperienceEntry,
  Resume,
  SkillsEntry,
} from "../resume-model";

export function parseLatexToResume(latexContent: string): Partial<Resume> {
  const resume: Partial<Resume> = {
    header: {
      name: "",
      phone: "",
      email: "",
      links: [],
    },
    sections: [],
  };

  // Extract header information
  const nameMatch = latexContent.match(/\\name\{([^}]+)\}/);
  if (nameMatch) resume.header!.name = nameMatch[1];

  const phoneMatch = latexContent.match(/\\phone\{([^}]+)\}/);
  if (phoneMatch) resume.header!.phone = phoneMatch[1];

  const emailMatch = latexContent.match(/\\email\{([^}]+)\}/);
  if (emailMatch) resume.header!.email = emailMatch[1];

  // Extract links
  const linkRegex = /\\href\{([^}]+)\}\{([^}]+)\}/g;
  let linkMatch;
  while ((linkMatch = linkRegex.exec(latexContent)) !== null) {
    resume.header!.links.push({
      url: linkMatch[1],
      label: linkMatch[2],
    });
  }

  // This is a basic parser - in production you'd want more sophisticated parsing
  // For now, we'll return what we can extract
  return resume;
}

/**
 * Parse plain text from PDF to resume structure
 * Attempts to intelligently extract resume information from PDF text
 * This parser is specifically tuned for resumes with inline formatting
 */
export function parsePdfTextToResume(text: string): Partial<Resume> {
  const resume: Partial<Resume> = {
    header: {
      name: "",
      phone: "",
      email: "",
      links: [],
    },
    sections: [],
  };

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // Extract name (usually first non-empty line)
  if (lines.length > 0) {
    const firstLine = lines[0];
    // Name is usually the first line without special characters
    if (
      firstLine.length > 3 &&
      firstLine.length < 50 &&
      !/[@\d+()]/.test(firstLine)
    ) {
      resume.header!.name = firstLine;
    }
  }

  // Extract location (usually second line, contains city/country)
  if (lines.length > 1) {
    const secondLine = lines[1];
    // Location usually contains city names, country, or "relocation"
    if (
      secondLine.length > 3 &&
      secondLine.length < 100 &&
      !secondLine.includes("@") &&
      !secondLine.match(/^\+?\d/) && // Not starting with phone number
      (secondLine.match(/,/) || // Has comma (city, country)
        secondLine.toLowerCase().includes("relocation") ||
        secondLine.toLowerCase().includes("india") ||
        secondLine.toLowerCase().includes("mumbai") ||
        secondLine.toLowerCase().includes("pune") ||
        secondLine.toLowerCase().includes("delhi") ||
        secondLine.toLowerCase().includes("bangalore"))
    ) {
      resume.header!.location = secondLine;
    }
  }

  // Extract email
  const emailRegex =
    /([a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const emailMatches = text.match(emailRegex);
  if (emailMatches && emailMatches.length > 0) {
    resume.header!.email = emailMatches[0];
  }

  // Extract phone
  const phoneRegex = /\+?\d{10,}/g;
  const phoneMatches = text.match(phoneRegex);
  if (phoneMatches && phoneMatches.length > 0) {
    resume.header!.phone = phoneMatches[0];
  }

  // Extract URLs and common platforms
  const links: Array<{ url: string; label: string }> = [];

  // Look for LinkedIn, GitHub, Portfolio in text
  if (text.includes("LinkedIn")) {
    const linkedinMatch = text.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)/i);
    if (linkedinMatch) {
      links.push({
        url: `https://linkedin.com/in/${linkedinMatch[1]}`,
        label: "LinkedIn",
      });
    } else {
      links.push({
        url: "https://linkedin.com/in/yourprofile",
        label: "LinkedIn",
      });
    }
  }

  if (text.includes("GitHub")) {
    const githubMatch = text.match(/github\.com\/([a-zA-Z0-9-]+)/i);
    if (githubMatch) {
      links.push({
        url: `https://github.com/${githubMatch[1]}`,
        label: "GitHub",
      });
    } else {
      links.push({ url: "https://github.com/yourusername", label: "GitHub" });
    }
  }

  if (text.includes("Portfolio Website")) {
    links.push({
      url: "https://yourportfolio.com",
      label: "Portfolio Website",
    });
  }

  resume.header!.links = links;

  // Split text into major sections based on headers
  const sections: Resume["sections"] = [];

  // Find section positions more reliably
  const sectionMarkers = [
    { regex: /^Experience$/im, type: "experience", title: "Experience" },
    { regex: /^Education$/im, type: "education", title: "Education" },
    {
      regex: /^(Technical\s*)?Skills?$/im,
      type: "skills",
      title: "Technical Skills",
    },
    { regex: /^Projects?$/im, type: "projects", title: "Projects" },
    { regex: /^Awards?$/im, type: "custom-awards", title: "Awards" },
    {
      regex: /^Certifications?$/im,
      type: "custom-certs",
      title: "Certifications",
    },
  ];

  const sectionPositions: Array<{
    type: string;
    start: number;
    title: string;
  }> = [];

  lines.forEach((line, index) => {
    for (const marker of sectionMarkers) {
      if (marker.regex.test(line)) {
        sectionPositions.push({
          type: marker.type,
          start: index,
          title: marker.title,
        });
        break;
      }
    }
  });

  // Sort by position
  sectionPositions.sort((a, b) => a.start - b.start);

  // Extract content for each section
  sectionPositions.forEach((section, idx) => {
    const startLine = section.start + 1;
    const endLine =
      idx < sectionPositions.length - 1
        ? sectionPositions[idx + 1].start
        : lines.length;
    const sectionLines = lines.slice(startLine, endLine);
    const sectionText = sectionLines.join("\n");

    if (section.type === "experience") {
      const entries = parseExperienceSectionImproved(sectionText);
      if (entries.length > 0) {
        sections.push({
          id: "experience",
          title: "Experience",
          type: "experience",
          entries,
        });
      }
    } else if (section.type === "education") {
      const entries = parseEducationSectionImproved(sectionText);
      if (entries.length > 0) {
        sections.push({
          id: "education",
          title: "Education",
          type: "education",
          entries,
        });
      }
    } else if (section.type === "skills") {
      const entries = parseSkillsSectionImproved(sectionText);
      if (entries.length > 0) {
        sections.push({
          id: "skills",
          title: "Technical Skills",
          type: "skills",
          entries,
        });
      }
    } else if (section.type === "custom-awards") {
      console.log("🏆 AWARDS RAW TEXT:", sectionText);
      const entries = parseCustomSectionImproved(sectionText);
      console.log(
        "🏆 AWARDS PARSED ENTRIES:",
        JSON.stringify(entries, null, 2)
      );
      if (entries.length > 0) {
        sections.push({
          id: "awards",
          title: "Awards",
          type: "custom",
          entries,
        });
      }
    } else if (section.type === "custom-certs") {
      console.log("📜 CERTIFICATIONS RAW TEXT:", sectionText);
      const entries = parseCustomSectionImproved(sectionText);
      console.log(
        "📜 CERTIFICATIONS PARSED ENTRIES:",
        JSON.stringify(entries, null, 2)
      );
      if (entries.length > 0) {
        sections.push({
          id: "certifications",
          title: "Certifications",
          type: "custom",
          entries,
        });
      }
    }
  });

  resume.sections = sections;
  return resume;
}

// Improved parsers that handle inline formatting better

function parseExperienceSectionImproved(text: string): ExperienceEntry[] {
  const entries: ExperienceEntry[] = [];

  // Split by company - look for pattern: CompanyNameLocation\nRole...Date
  // Companies usually end with a city name followed by role on next line
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l);

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Skip bullet points
    if (line.startsWith("•")) {
      i++;
      continue;
    }

    // Check if this looks like a company line (has location at end like "Mumbai", "Pune", "Delhi")
    const locationMatch = line.match(
      /(.*?)(Mumbai|Pune|Delhi|Bangalore|Hyderabad|Chennai|Kolkata|Remote)$/i
    );

    if (locationMatch && i + 1 < lines.length) {
      const company = locationMatch[1].trim();
      const location = locationMatch[2];
      const nextLine = lines[i + 1];

      // Next line should be role and dates
      // Pattern: RoleMonth Year – Month Year or RoleMonth Year – Present
      const roleDateMatch = nextLine.match(
        /^(.*?)(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\s*[–-]\s*(.*?)$/i
      );

      if (roleDateMatch) {
        const role = roleDateMatch[1].trim();
        const startMonth = roleDateMatch[2];
        const startYear = roleDateMatch[3];
        const endPart = roleDateMatch[4].trim();

        let endDate = "Present";
        if (endPart !== "Present") {
          const endMatch = endPart.match(
            /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i
          );
          if (endMatch) {
            endDate = `${endMatch[1]} ${endMatch[2]}`;
          }
        }

        // Collect bullets - join multi-line bullets
        const bullets: string[] = [];
        i += 2; // Skip company and role lines

        let currentBullet = "";
        while (i < lines.length) {
          const currentLine = lines[i];

          if (currentLine.startsWith("•")) {
            // Save previous bullet if exists
            if (currentBullet) {
              bullets.push(currentBullet.trim());
            }
            // Start new bullet
            currentBullet = currentLine.replace(/^•\s*/, "").trim();
            i++;
          } else if (currentBullet) {
            // Check if this line is start of next entry (company line with location)
            const nextEntryCheck = currentLine.match(
              /(Mumbai|Pune|Delhi|Bangalore|Hyderabad|Chennai|Kolkata|Remote)$/i
            );
            if (nextEntryCheck) {
              // This is a new entry, stop
              break;
            }
            // Continue the current bullet (multi-line)
            currentBullet += " " + currentLine.trim();
            i++;
          } else {
            // No current bullet, stop
            break;
          }
        }

        // Don't forget the last bullet
        if (currentBullet) {
          bullets.push(currentBullet.trim());
        }

        entries.push({
          id: crypto.randomUUID(),
          company,
          role,
          location,
          startDate: `${startMonth} ${startYear}`,
          endDate,
          bullets,
        });

        continue;
      }
    }

    i++;
  }

  return entries;
}

function parseEducationSectionImproved(text: string): EducationEntry[] {
  const entries: EducationEntry[] = [];
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l);

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Skip bullets and section headers
    if (
      line.startsWith("•") ||
      line === "Awards" ||
      line === "Certifications"
    ) {
      i++;
      continue;
    }

    // University name usually has location
    const locationMatch = line.match(
      /(.*?)(Mumbai|Pune|Delhi|Bangalore|Hyderabad|Chennai|Kolkata)$/i
    );

    if (locationMatch && i + 1 < lines.length) {
      const institution = locationMatch[1].trim();
      const location = locationMatch[2];
      const nextLine = lines[i + 1];

      // Next line is degree
      if (!nextLine.startsWith("•")) {
        const degree = nextLine;

        // Collect details - join multi-line details
        const details: string[] = [];
        i += 2;

        let currentDetail = "";
        while (i < lines.length) {
          const currentLine = lines[i];

          if (currentLine.startsWith("•")) {
            // Save previous detail if exists
            if (currentDetail) {
              details.push(currentDetail.trim());
            }
            // Start new detail
            currentDetail = currentLine.replace(/^•\s*/, "").trim();
            i++;
          } else if (currentDetail) {
            // Check if this is start of next section or entry
            const nextSectionCheck = currentLine.match(
              /^(Awards|Certifications|Technical Skills|Experience|Projects)$/i
            );
            const nextEntryCheck = currentLine.match(
              /(Mumbai|Pune|Delhi|Bangalore|Hyderabad|Chennai|Kolkata)$/i
            );

            if (nextSectionCheck || nextEntryCheck) {
              // This is a new section/entry, stop
              break;
            }
            // Continue the current detail (multi-line)
            currentDetail += " " + currentLine.trim();
            i++;
          } else {
            // No current detail, stop
            break;
          }
        }

        // Don't forget the last detail
        if (currentDetail) {
          details.push(currentDetail.trim());
        }

        entries.push({
          id: crypto.randomUUID(),
          institution,
          degree,
          location,
          startDate: "",
          endDate: "",
          details,
        });

        continue;
      }
    }

    i++;
  }

  return entries;
}

function parseSkillsSectionImproved(text: string): SkillsEntry[] {
  const entries: SkillsEntry[] = [];
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l);

  for (const line of lines) {
    // Skills format: "Category: skill1, skill2, skill3"
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const category = line.substring(0, colonIndex).trim();
      const skillsText = line.substring(colonIndex + 1).trim();

      const skills = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      if (skills.length > 0) {
        entries.push({
          id: crypto.randomUUID(),
          category,
          skills,
        });
      }
    }
  }

  return entries;
}

function parseCustomSectionImproved(text: string): CustomEntry[] {
  const entries: CustomEntry[] = [];
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l);

  console.log("🔍 parseCustomSectionImproved - All lines:", lines);

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Skip lines that are clearly not entry titles
    if (line.startsWith("•")) {
      console.log(`  ⏩ Skipping bullet line [${i}]:`, line);
      i++;
      continue;
    }

    // Check if this line looks like an entry title (not a subtitle/credential)
    const looksLikeTitle =
      line.length > 15 || // Long enough to be a title
      line.match(
        /(Jan\.?|Feb\.?|Mar\.?|Apr\.?|May|June?\.?|July?\.?|Aug\.?|Sep\.?|Oct\.?|Nov\.?|Dec\.?)\s+\d{4}$/i
      ) || // Has date
      line.match(/\|/) || // Has pipe separator
      line.match(/\d{4}\s+(Finalist|Winner|Award|Hackathon)/i); // Year followed by award-type word

    // Skip short lines that don't look like titles (probably subtitles/credentials)
    if (!looksLikeTitle && line.length < 20) {
      console.log(`  ⏭️ Skipping non-title line [${i}]:`, line);
      i++;
      continue;
    }

    console.log(`\n  📌 Processing entry at line [${i}]:`, line);

    // This is a potential title line
    let title = line;
    let subtitle = "";
    let location = "";
    let endDate = "";

    // First, extract date if present at the end (with or without space before month)
    const dateMatch = title.match(
      /(.*?)\s*(Jan\.?|Feb\.?|Mar\.?|Apr\.?|May|June?\.?|July?\.?|Aug\.?|Sep\.?|Oct\.?|Nov\.?|Dec\.?)\s*(\d{4})$/i
    );
    if (dateMatch) {
      title = dateMatch[1].trim();
      endDate = `${dateMatch[2]} ${dateMatch[3]}`;
      console.log(
        `    � Extracted date: "${endDate}", remaining title: "${title}"`
      );
    }

    // Extract "by Institution" pattern (for certifications) - do this AFTER date extraction
    const byMatch = title.match(/(.*?)\s*by\s+(.+)$/i);
    if (byMatch) {
      title = byMatch[1].trim();
      subtitle = "by " + byMatch[2].trim();
      console.log(
        `    Extracted 'by' pattern - Title: "${title}", Subtitle: "${subtitle}"`
      );
    }

    // Clean up trailing pipes from title BEFORE location extraction
    title = title.replace(/\|+\s*$/, "").trim();
    if (subtitle) {
      subtitle = subtitle.replace(/\|+\s*$/, "").trim();
    }

    // Extract location and date from title line
    // Pattern: "Title [Location |] Date" or "Title | Location | Date"

    // Check for location with pipe separator
    const locationPipeMatch = title.match(/(.*?)\s*\|\s*([^|]+)$/);
    if (locationPipeMatch) {
      const beforePipe = locationPipeMatch[1].trim();
      const afterPipe = locationPipeMatch[2].trim();

      // Check if what's after the pipe is actually a date
      const isDate = afterPipe.match(
        /^(Jan\.?|Feb\.?|Mar\.?|Apr\.?|May|June?\.?|July?\.?|Aug\.?|Sep\.?|Oct\.?|Nov\.?|Dec\.?)\s*\d{4}$/i
      );

      if (isDate && !endDate) {
        // It's a date, not a location
        title = beforePipe;
        endDate = afterPipe;
        console.log(
          `    � Extracted date (after pipe): "${endDate}", remaining title: "${title}"`
        );
      } else {
        // It's a location
        title = beforePipe;
        location = afterPipe; // FIX: Actually assign the location!
        console.log(
          `    Extracted location (pipe): "${location}", remaining title: "${title}"`
        );
      }
    } else {
      // Check for location at end without pipe (e.g., "TitleDelhi")
      const locationEndMatch = title.match(
        /(.*?)(Mumbai|Pune|Delhi|Bangalore|Hyderabad|Chennai|Kolkata|Remote)$/i
      );
      if (locationEndMatch) {
        title = locationEndMatch[1].trim();
        location = locationEndMatch[2];
        console.log(
          `    Extracted location (end): "${location}", remaining title: "${title}"`
        );
      }
    }

    // Move to next line
    i++;

    // Check if next line is a subtitle (starts with "by" or looks like organization)
    // Only if we didn't already extract subtitle from title
    if (!subtitle && i < lines.length && !lines[i].startsWith("•")) {
      const nextLine = lines[i];
      if (nextLine.match(/^by\s+/i)) {
        subtitle = nextLine;
        console.log(`    📖 Found subtitle (by pattern): "${subtitle}"`);
        i++;
      } else if (
        nextLine.match(/University|Institute|Organization|Credential/i) &&
        nextLine.length < 100
      ) {
        subtitle = nextLine;
        console.log(
          `    📖 Found subtitle (organization pattern): "${subtitle}"`
        );
        i++;
      }
    }

    // Collect bullets - join multi-line bullets
    const bullets: string[] = [];
    let currentBullet = "";
    let bulletSavedBeforeBreak = false;

    console.log(`    Collecting bullets starting at line [${i}]...`);

    while (i < lines.length) {
      const currentLine = lines[i];

      if (currentLine.startsWith("•")) {
        // Save previous bullet if exists
        if (currentBullet) {
          bullets.push(currentBullet.trim());
          console.log(
            `      Saved bullet: "${currentBullet.trim().substring(0, 50)}..."`
          );
        }
        // Start new bullet
        currentBullet = currentLine.replace(/^•\s*/, "").trim();
        i++;
        bulletSavedBeforeBreak = false;
      } else if (currentBullet) {
        // Check if this line starts a new entry (has date pattern or location pattern)
        const isNewEntry =
          currentLine.match(
            /(Jan\.?|Feb\.?|Mar\.?|Apr\.?|May|June?\.?|July?\.?|Aug\.?|Sep\.?|Oct\.?|Nov\.?|Dec\.?)\s+\d{4}$/i
          ) ||
          currentLine.match(
            /\|\s*(Mumbai|Pune|Delhi|Bangalore|Hyderabad|Chennai|Kolkata|Remote)/i
          ) ||
          (currentLine.match(/^by\s+/i) && currentLine.length > 20); // "by University..." is likely new certification

        if (isNewEntry) {
          // This is a new entry, save current bullet and break
          bullets.push(currentBullet.trim());
          bulletSavedBeforeBreak = true;
          break;
        } else {
          // Continue the current bullet (multi-line)
          currentBullet += " " + currentLine;
          i++;
        }
      } else {
        // No current bullet and line doesn't start with •
        // This could be start of new entry or continuation of subtitle
        if (
          currentLine.match(
            /(Jan\.?|Feb\.?|Mar\.?|Apr\.?|May|June?\.?|July?\.?|Aug\.?|Sep\.?|Oct\.?|Nov\.?|Dec\.?)\s+\d{4}$/i
          ) ||
          currentLine.match(/\|/)
        ) {
          // New entry
          break;
        } else if (subtitle && currentLine.length < 150) {
          // Might be continuation of subtitle
          subtitle += " " + currentLine;
          i++;
        } else {
          // Unknown, skip to new entry
          break;
        }
      }
    }

    // Don't forget the last bullet (but only if we didn't already save it before breaking)
    if (currentBullet && !bulletSavedBeforeBreak) {
      bullets.push(currentBullet.trim());
      console.log(
        `      Saved final bullet: "${currentBullet
          .trim()
          .substring(0, 50)}..."`
      );
    }

    if (title && title.length > 2) {
      console.log(`  ✨ Created entry:`, {
        title: title.substring(0, 50) + (title.length > 50 ? "..." : ""),
        subtitle:
          subtitle.substring(0, 50) + (subtitle.length > 50 ? "..." : ""),
        location,
        endDate,
        bullets: bullets.length,
      });
      entries.push({
        id: crypto.randomUUID(),
        title,
        subtitle,
        location,
        startDate: "",
        endDate,
        bullets,
      });
    }
  }

  return entries;
}

export async function parsePdfToText(pdfFile: File): Promise<string> {
  // This will be implemented with pdf-parse on the server side
  const formData = new FormData();
  formData.append("pdf", pdfFile);

  const response = await fetch("/api/parse-pdf", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to parse PDF");
  }

  const data = await response.json();
  return data.text;
}
