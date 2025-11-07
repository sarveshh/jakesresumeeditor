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
      const entries = parseCustomSectionImproved(sectionText);
      if (entries.length > 0) {
        sections.push({
          id: "awards",
          title: "Awards",
          type: "custom",
          entries,
        });
      }
    } else if (section.type === "custom-certs") {
      const entries = parseCustomSectionImproved(sectionText);
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

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Skip bullets
    if (line.startsWith("•")) {
      i++;
      continue;
    }

    // Entry title line - look for various patterns
    // Pattern 1: "Title | Location | Date"
    // Pattern 2: "Title Date" (e.g., "Global Assessment...Jan 2021")
    // Pattern 3: "Titleby Institution" (e.g., "React Specialisation...by University")

    let title = line;
    let subtitle = "";
    let location = "";
    let endDate = "";

    // Check for "by" pattern (certifications)
    const byMatch = line.match(/(.*?)\s+by\s+(.+?)(\||$)/i);
    if (byMatch) {
      title = byMatch[1].trim();
      subtitle = "by " + byMatch[2].trim();

      // Check for date at the end
      const dateMatch = line.match(
        /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})$/i
      );
      if (dateMatch) {
        endDate = `${dateMatch[1]} ${dateMatch[2]}`;
        // Remove date from subtitle if it's there
        subtitle = subtitle.replace(new RegExp(endDate + "$"), "").trim();
      }
    } else {
      // Check for date at end
      const dateMatch = line.match(
        /(.*?)(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})$/i
      );
      if (dateMatch) {
        title = dateMatch[1].trim();
        endDate = `${dateMatch[2]} ${dateMatch[3]}`;
      }

      // Check for location pipe pattern (e.g., "Title | Location")
      const pipeLocationMatch = title.match(
        /(.*?)\|\s*(Mumbai|Pune|Delhi|Bangalore|Hyderabad|Chennai|Kolkata)/i
      );
      if (pipeLocationMatch) {
        title = pipeLocationMatch[1].trim();
        location = pipeLocationMatch[2].trim();
      } else {
        // Check for location at end of title (e.g., "Smart India Hackathon 2020 FinalistDelhi")
        const locationEndMatch = title.match(
          /(.*?)(Mumbai|Pune|Delhi|Bangalore|Hyderabad|Chennai|Kolkata)$/i
        );
        if (locationEndMatch) {
          title = locationEndMatch[1].trim();
          location = locationEndMatch[2];
        }
      }
    }

    // Collect bullets - join multi-line bullets
    const bullets: string[] = [];
    i++;

    let currentBullet = "";
    while (i < lines.length) {
      if (lines[i].startsWith("•")) {
        // Save previous bullet if exists
        if (currentBullet) {
          bullets.push(currentBullet.trim());
        }
        // Start new bullet
        currentBullet = lines[i].replace(/^•\s*/, "").trim();
        i++;
      } else if (currentBullet) {
        // Check if this line is the start of a new entry
        const nextIsEntry =
          lines[i].match(
            /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}$/i
          ) ||
          lines[i].match(/by\s+/i) ||
          lines[i].match(
            /(Mumbai|Pune|Delhi|Bangalore|Hyderabad|Chennai|Kolkata)$/i
          );

        if (nextIsEntry) {
          // This is a new entry, save current bullet and break
          if (currentBullet) {
            bullets.push(currentBullet.trim());
          }
          break;
        } else {
          // Continue the current bullet (multi-line)
          currentBullet += " " + lines[i].trim();
          i++;
        }
      } else {
        // No current bullet and line doesn't start with •, might be new entry
        break;
      }
    }

    // Don't forget the last bullet
    if (currentBullet) {
      bullets.push(currentBullet.trim());
    }

    if (title && title.length > 2) {
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
