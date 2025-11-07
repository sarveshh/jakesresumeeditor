/**
 * Jake's Resume Template Generator
 * Converts Resume model to LaTeX source code
 */

import {
  CustomEntry,
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
  Resume,
  ResumeSection,
  SkillsEntry,
} from "../../resume-model";

export function generateLatex(resume: Resume): string {
  return `\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{} % clear all header and footer fields
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% Ensure that generate pdf is machine readable/ATS parsable
\\pdfgentounicode=1

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{\\small#1} & \\textit{\\small #2} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\begin{document}

${generateHeader(resume.header)}

${resume.sections.map((section) => generateSection(section)).join("\n\n")}

\\end{document}`;
}

function generateHeader(header: Resume["header"]): string {
  const links = header.links
    .map((link) => {
      const url = link.url.startsWith("http")
        ? link.url
        : `https://${link.url}`;
      return `\\href{${url}}{\\underline{${escapeLaTeX(link.label)}}}`;
    })
    .join(" $|$\\n    ");

  return `%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge \\scshape ${escapeLaTeX(header.name)}} \\\\ \\vspace{1pt}
    \\small ${escapeLaTeX(header.phone)} $|$ \\href{mailto:${
    header.email
  }}{\\underline{${escapeLaTeX(header.email)}}}${
    links ? ` $|$\n    ${links}` : ""
  }
\\end{center}
`;
}

function generateSection(section: ResumeSection): string {
  let content = `%-----------${section.title.toUpperCase()}-----------
\\section{${escapeLaTeX(section.title)}}`;

  switch (section.type) {
    case "experience":
      content += `
  \\resumeSubHeadingListStart
${section.entries
  .map((e) => generateExperience(e as ExperienceEntry))
  .join("\n")}
  \\resumeSubHeadingListEnd`;
      break;
    case "education":
      content += `
  \\resumeSubHeadingListStart
${section.entries.map((e) => generateEducation(e as EducationEntry)).join("\n")}
  \\resumeSubHeadingListEnd`;
      break;
    case "projects":
      content += `
    \\resumeSubHeadingListStart
${section.entries.map((e) => generateProject(e as ProjectEntry)).join("\n")}
    \\resumeSubHeadingListEnd`;
      break;
    case "skills":
      content += `
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
${section.entries.map((e) => generateSkills(e as SkillsEntry)).join(" \\\\\n")}
    }}
 \\end{itemize}`;
      break;
    case "custom":
      content += `
  \\resumeSubHeadingListStart
${section.entries.map((e) => generateCustom(e as CustomEntry)).join("\n")}
  \\resumeSubHeadingListEnd`;
      break;
  }

  return content;
}

function generateExperience(entry: ExperienceEntry): string {
  const dateRange = formatDateRange(entry.startDate, entry.endDate);
  const hasBullets =
    entry.bullets.length > 0 && entry.bullets.some((b) => b.trim());

  return `
    \\resumeSubheading
      {${escapeLaTeX(entry.company)}}{${dateRange}}
      {${escapeLaTeX(entry.role)}}{${escapeLaTeX(entry.location)}}${
    hasBullets
      ? `
      \\resumeItemListStart
${entry.bullets
  .filter((b) => b.trim())
  .map((b) => `        \\resumeItem{${escapeLaTeX(b)}}`)
  .join("\n")}
      \\resumeItemListEnd`
      : ""
  }`;
}

function generateEducation(entry: EducationEntry): string {
  const dateRange = formatDateRange(entry.startDate, entry.endDate);
  const hasDetails =
    entry.details.length > 0 && entry.details.some((d) => d.trim());

  return `
    \\resumeSubheading
      {${escapeLaTeX(entry.institution)}}{${dateRange}}
      {${escapeLaTeX(entry.degree)}}{${escapeLaTeX(entry.location)}}${
    hasDetails
      ? `
      \\resumeItemListStart
${entry.details
  .filter((d) => d.trim())
  .map((d) => `        \\resumeItem{${escapeLaTeX(d)}}`)
  .join("\n")}
      \\resumeItemListEnd`
      : ""
  }`;
}

function generateProject(entry: ProjectEntry): string {
  const dateRange =
    entry.startDate && entry.endDate
      ? formatDateRange(entry.startDate, entry.endDate)
      : "";
  const hasBullets =
    entry.bullets.length > 0 && entry.bullets.some((b) => b.trim());

  const projectTitle = entry.technologies
    ? `\\textbf{${escapeLaTeX(entry.name)}} $|$ \\emph{${escapeLaTeX(
        entry.technologies
      )}}`
    : `\\textbf{${escapeLaTeX(entry.name)}}`;

  return `
      \\resumeProjectHeading
          {${projectTitle}}{${dateRange}}${
    hasBullets
      ? `
          \\resumeItemListStart
${entry.bullets
  .filter((b) => b.trim())
  .map((b) => `            \\resumeItem{${escapeLaTeX(b)}}`)
  .join("\n")}
          \\resumeItemListEnd`
      : ""
  }`;
}

function generateSkills(entry: SkillsEntry): string {
  return `     \\textbf{${escapeLaTeX(entry.category)}}{: ${entry.skills
    .map((s) => escapeLaTeX(s))
    .join(", ")}}`;
}

function generateCustom(entry: CustomEntry): string {
  console.log("🎨 generateCustom called with:", JSON.stringify(entry, null, 2));
  
  // Handle single date (for certifications/awards with just one date)
  const singleDate =
    entry.startDate && !entry.endDate ? formatSingleDate(entry.startDate) : "";
  const dateRange =
    entry.startDate && entry.endDate
      ? formatDateRange(entry.startDate, entry.endDate)
      : "";
  const displayDate = dateRange || singleDate;
  const hasBullets =
    entry.bullets.length > 0 && entry.bullets.some((b) => b.trim());

  // For simple entries (awards, certifications without bullets)
  if (!hasBullets) {
    const subtitle = entry.subtitle || "";
    const location = entry.location || displayDate || "";
    
    const latex = `
    \\resumeSubheading
      {${escapeLaTeX(entry.title)}}{${location}}
      {${subtitle}}{}`;
    console.log("📝 Generated LaTeX (no bullets):", latex);
    return latex;
  }

  // For entries with bullets
  const location = entry.location || displayDate || "";
  const subtitle = entry.subtitle || "";

  const latex = `
    \\resumeSubheading
      {${escapeLaTeX(entry.title)}}{${location}}
      {${subtitle}}{}
      \\resumeItemListStart
${entry.bullets
  .filter((b) => b.trim())
  .map((b) => `        \\resumeItem{${escapeLaTeX(b)}}`)
  .join("\n")}
      \\resumeItemListEnd`;
  console.log("📝 Generated LaTeX (with bullets):", latex);
  return latex;
}

function formatSingleDate(date: string): string {
  if (!date) return "";

  // Check if it's already formatted (contains letters)
  if (/[a-zA-Z]/.test(date)) return date;

  // Parse YYYY-MM or YYYY format
  if (date.includes("-")) {
    const [year, month] = date.split("-");
    const monthNames = [
      "Jan.",
      "Feb.",
      "Mar.",
      "Apr.",
      "May",
      "June",
      "July",
      "Aug.",
      "Sep.",
      "Oct.",
      "Nov.",
      "Dec.",
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  }

  return date; // Return as-is if just year
}

function formatDateRange(start: string, end: string): string {
  const formatDate = (date: string) => {
    if (!date) return "";
    if (date.toLowerCase() === "present") return "Present";

    // If already formatted, return as-is
    if (/[a-zA-Z]/.test(date)) return date;

    // Parse YYYY-MM format
    const parts = date.split("-");
    if (parts.length === 2) {
      const [year, month] = parts;
      const monthNames = [
        "Jan.",
        "Feb.",
        "Mar.",
        "Apr.",
        "May",
        "June",
        "July",
        "Aug.",
        "Sep.",
        "Oct.",
        "Nov.",
        "Dec.",
      ];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    }

    return date; // Return year only
  };

  return `${formatDate(start)} -- ${formatDate(end)}`;
}

function escapeLaTeX(text: string): string {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/[&%$#_{}]/g, "\\$&")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}
