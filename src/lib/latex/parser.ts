/**
 * LaTeX Parser
 * Parses .tex files and extracts structured data
 */

import {
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
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

  // Extract name (usually first non-empty line with reasonable length)
  for (const line of lines) {
    if (line.length > 3 && line.length < 50 && !/[@\d]/.test(line)) {
      resume.header!.name = line;
      break;
    }
  }

  // Extract email - more robust regex
  const emailRegex =
    /([a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const emailMatches = text.match(emailRegex);
  if (emailMatches && emailMatches.length > 0) {
    resume.header!.email = emailMatches[0];
  }

  // Extract phone - multiple formats
  const phoneRegex =
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{10,}/g;
  const phoneMatches = text.match(phoneRegex);
  if (phoneMatches && phoneMatches.length > 0) {
    resume.header!.phone = phoneMatches[0];
  }

  // Extract URLs and common platforms
  const links: Array<{ url: string; label: string }> = [];

  // GitHub
  const githubMatch = text.match(/github\.com\/([a-zA-Z0-9-]+)/i);
  if (githubMatch) {
    links.push({
      url: `https://github.com/${githubMatch[1]}`,
      label: "GitHub",
    });
  }

  // LinkedIn
  const linkedinMatch = text.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)/i);
  if (linkedinMatch) {
    links.push({
      url: `https://linkedin.com/in/${linkedinMatch[1]}`,
      label: "LinkedIn",
    });
  }

  // Portfolio/website - look for other URLs
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urlMatches = text.match(urlRegex);
  if (urlMatches) {
    urlMatches.forEach((url) => {
      if (!url.includes("github.com") && !url.includes("linkedin.com")) {
        const label = url.includes("portfolio")
          ? "Portfolio"
          : url.split("/")[2] || "Website";
        links.push({ url, label });
      }
    });
  }

  resume.header!.links = links;

  // Parse sections with improved heuristics
  const sections: Resume["sections"] = [];

  // Identify section boundaries
  const sectionHeaders = {
    education: /\b(EDUCATION|ACADEMIC|QUALIFICATIONS?)\b/i,
    experience: /\b(EXPERIENCE|EMPLOYMENT|WORK\s*HISTORY)\b/i,
    projects: /\b(PROJECTS?|PORTFOLIO)\b/i,
    skills: /\b(SKILLS?|TECHNICAL\s*SKILLS?|TECHNOLOGIES)\b/i,
  };

  // Find section positions
  const sectionPositions: Array<{
    type: string;
    start: number;
    title: string;
  }> = [];
  lines.forEach((line, index) => {
    for (const [type, regex] of Object.entries(sectionHeaders)) {
      if (regex.test(line)) {
        sectionPositions.push({ type, start: index, title: line });
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

    if (section.type === "education") {
      const entries = parseEducationSection(sectionLines);
      if (entries.length > 0) {
        sections.push({
          id: "education",
          title: "Education",
          type: "education",
          entries,
        });
      }
    } else if (section.type === "experience") {
      const entries = parseExperienceSection(sectionLines);
      if (entries.length > 0) {
        sections.push({
          id: "experience",
          title: "Experience",
          type: "experience",
          entries,
        });
      }
    } else if (section.type === "projects") {
      const entries = parseProjectsSection(sectionLines);
      if (entries.length > 0) {
        sections.push({
          id: "projects",
          title: "Projects",
          type: "projects",
          entries,
        });
      }
    } else if (section.type === "skills") {
      const entries = parseSkillsSection(sectionLines);
      if (entries.length > 0) {
        sections.push({
          id: "skills",
          title: "Technical Skills",
          type: "skills",
          entries,
        });
      }
    }
  });

  resume.sections = sections;
  return resume;
}

// Helper functions for parsing sections
function parseEducationSection(lines: string[]): EducationEntry[] {
  const entries: EducationEntry[] = [];
  let currentEntry: Partial<EducationEntry> | null = null;

  for (const line of lines) {
    // Skip empty lines
    if (!line) continue;

    // Check for date patterns to identify entry boundaries
    const dateMatch = line.match(/(\d{4})\s*[-–—]\s*(\d{4}|Present|Current)/i);

    // If line looks like an institution or degree
    if (
      !currentEntry ||
      (line.length > 15 && !line.startsWith("•") && !line.startsWith("-"))
    ) {
      if (currentEntry && currentEntry.institution) {
        entries.push(currentEntry as EducationEntry);
      }

      currentEntry = {
        id: crypto.randomUUID(),
        institution: line
          .replace(/\d{4}\s*[-–—]\s*(\d{4}|Present|Current)/gi, "")
          .trim(),
        degree: "",
        location: "",
        startDate: dateMatch ? dateMatch[1] : "",
        endDate: dateMatch ? dateMatch[2] : "",
        details: [],
      };

      // Extract dates if in the same line
      if (dateMatch) {
        currentEntry.institution = line
          .substring(0, line.indexOf(dateMatch[0]))
          .trim();
      }
    } else if (currentEntry) {
      // Additional details - could be degree, location, or bullet points
      if (
        line.includes("Bachelor") ||
        line.includes("Master") ||
        line.includes("B.S.") ||
        line.includes("M.S.")
      ) {
        currentEntry.degree = line;
      } else if (line.startsWith("•") || line.startsWith("-")) {
        currentEntry.details!.push(line.replace(/^[•\-]\s*/, ""));
      } else if (!currentEntry.degree) {
        currentEntry.degree = line;
      }
    }
  }

  if (currentEntry && currentEntry.institution) {
    entries.push(currentEntry as EducationEntry);
  }

  return entries.filter((e) => e.institution && e.degree);
}

function parseExperienceSection(lines: string[]): ExperienceEntry[] {
  const entries: ExperienceEntry[] = [];
  let currentEntry: Partial<ExperienceEntry> | null = null;

  for (const line of lines) {
    if (!line) continue;

    // Check for date patterns
    const dateMatch = line.match(
      /(\w+\.?\s+\d{4})\s*[-–—]\s*(\w+\.?\s+\d{4}|Present|Current)/i
    );

    // Detect new entry - usually company name (longer, not a bullet)
    if (
      line.length > 10 &&
      !line.startsWith("•") &&
      !line.startsWith("-") &&
      !currentEntry?.company
    ) {
      if (currentEntry && currentEntry.company && currentEntry.role) {
        entries.push(currentEntry as ExperienceEntry);
      }

      currentEntry = {
        id: crypto.randomUUID(),
        company: line
          .replace(
            /\w+\.?\s+\d{4}\s*[-–—]\s*(\w+\.?\s+\d{4}|Present|Current)/gi,
            ""
          )
          .trim(),
        role: "",
        location: "",
        startDate: "",
        endDate: "",
        bullets: [],
      };

      // Extract dates if present
      if (dateMatch) {
        currentEntry.company = line
          .substring(0, line.indexOf(dateMatch[0]))
          .trim();
        currentEntry.startDate = dateMatch[1];
        currentEntry.endDate = dateMatch[2];
      }
    } else if (currentEntry) {
      if (
        !currentEntry.role &&
        !line.startsWith("•") &&
        !line.startsWith("-")
      ) {
        // This is likely the role
        currentEntry.role = line
          .replace(
            /\w+\.?\s+\d{4}\s*[-–—]\s*(\w+\.?\s+\d{4}|Present|Current)/gi,
            ""
          )
          .trim();

        if (dateMatch && !currentEntry.startDate) {
          currentEntry.startDate = dateMatch[1];
          currentEntry.endDate = dateMatch[2];
        }
      } else if (line.startsWith("•") || line.startsWith("-")) {
        currentEntry.bullets!.push(line.replace(/^[•\-]\s*/, ""));
      }
    }
  }

  if (currentEntry && currentEntry.company && currentEntry.role) {
    entries.push(currentEntry as ExperienceEntry);
  }

  return entries.filter((e) => e.company && e.role);
}

function parseProjectsSection(lines: string[]): ProjectEntry[] {
  const entries: ProjectEntry[] = [];
  let currentEntry: Partial<ProjectEntry> | null = null;

  for (const line of lines) {
    if (!line) continue;

    // New project - not a bullet point
    if (line.length > 5 && !line.startsWith("•") && !line.startsWith("-")) {
      if (currentEntry && currentEntry.name) {
        entries.push(currentEntry as ProjectEntry);
      }

      // Check if technologies are in the same line (e.g., "Project Name | React, Node.js")
      const techSplit = line.split(/[|–—]/);

      currentEntry = {
        id: crypto.randomUUID(),
        name: techSplit[0].trim(),
        technologies: techSplit.length > 1 ? techSplit[1].trim() : "",
        startDate: "",
        endDate: "",
        bullets: [],
      };
    } else if (currentEntry && (line.startsWith("•") || line.startsWith("-"))) {
      currentEntry.bullets!.push(line.replace(/^[•\-]\s*/, ""));
    }
  }

  if (currentEntry && currentEntry.name) {
    entries.push(currentEntry as ProjectEntry);
  }

  return entries.filter((e) => e.name);
}

function parseSkillsSection(lines: string[]): SkillsEntry[] {
  const entries: SkillsEntry[] = [];

  for (const line of lines) {
    if (!line) continue;

    // Skills are usually in format: "Category: skill1, skill2, skill3"
    if (line.includes(":")) {
      const colonIndex = line.indexOf(":");
      const category = line.substring(0, colonIndex).trim();
      const skillsText = line.substring(colonIndex + 1).trim();

      const skills = skillsText
        .split(/[,;|]/)
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
