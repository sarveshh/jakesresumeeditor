/**
 * Jake's Resume Template Generator
 * Converts Resume model to LaTeX source code
 */

import { CustomEntry, EducationEntry, ExperienceEntry, ProjectEntry, Resume, ResumeSection, SkillsEntry } from '../../resume-model';

export function generateLatex(resume: Resume): string {
  return `\\documentclass[11pt,letterpaper]{article}

% ATS-Compliant Resume Template
% No tables, icons, or fancy formatting
% Uses standard fonts and maintains text layer

\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}

% Remove page numbers
\\pagestyle{empty}

% Customize section formatting
\\usepackage{titlesec}
\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{12pt}{6pt}

% Compact lists
\\setlist[itemize]{leftmargin=*,itemsep=0pt,parsep=0pt,topsep=2pt}

\\begin{document}

${generateHeader(resume.header)}

${resume.sections.map(section => generateSection(section)).join('\n\n')}

\\end{document}`;
}

function generateHeader(header: Resume['header']): string {
  const links = header.links.map(link =>
    `\\href{https://${link.url}}{${link.label}}`
  ).join(' $|$ ');

  return `% Header
\\begin{center}
  {\\LARGE \\textbf{${escapeLaTeX(header.name)}}}\\\\[4pt]
  ${escapeLaTeX(header.phone)} $|$ ${escapeLaTeX(header.email)}${links ? ' $|$ ' + links : ''}
\\end{center}`;
}

function generateSection(section: ResumeSection): string {
  let content = `\\section*{${escapeLaTeX(section.title)}}`;

  switch (section.type) {
    case 'experience':
      content += '\n' + section.entries.map(e => generateExperience(e as ExperienceEntry)).join('\n\n');
      break;
    case 'education':
      content += '\n' + section.entries.map(e => generateEducation(e as EducationEntry)).join('\n\n');
      break;
    case 'projects':
      content += '\n' + section.entries.map(e => generateProject(e as ProjectEntry)).join('\n\n');
      break;
    case 'skills':
      content += '\n' + section.entries.map(e => generateSkills(e as SkillsEntry)).join('\n\n');
      break;
    case 'custom':
      content += '\n' + section.entries.map(e => generateCustom(e as CustomEntry)).join('\n\n');
      break;
  }

  return content;
}

function generateExperience(entry: ExperienceEntry): string {
  const dateRange = formatDateRange(entry.startDate, entry.endDate);

  return `\\noindent
\\textbf{${escapeLaTeX(entry.company)}} \\hfill ${escapeLaTeX(entry.location)}\\\\
\\textit{${escapeLaTeX(entry.role)}} \\hfill ${dateRange}
${entry.bullets.length > 0 ? `\\begin{itemize}
${entry.bullets.map(b => `  \\item ${escapeLaTeX(b)}`).join('\n')}
\\end{itemize}` : ''}`;
}

function generateEducation(entry: EducationEntry): string {
  const dateRange = formatDateRange(entry.startDate, entry.endDate);

  return `\\noindent
\\textbf{${escapeLaTeX(entry.institution)}} \\hfill ${escapeLaTeX(entry.location)}\\\\
${escapeLaTeX(entry.degree)} \\hfill ${dateRange}
${entry.details.length > 0 ? `\\begin{itemize}
${entry.details.map(d => `  \\item ${escapeLaTeX(d)}`).join('\n')}
\\end{itemize}` : ''}`;
}

function generateProject(entry: ProjectEntry): string {
  const dateRange = entry.startDate && entry.endDate
    ? formatDateRange(entry.startDate, entry.endDate)
    : '';

  return `\\noindent
\\textbf{${escapeLaTeX(entry.name)}} ${entry.technologies ? `-- \\textit{${escapeLaTeX(entry.technologies)}}` : ''} ${dateRange ? `\\hfill ${dateRange}` : ''}
${entry.bullets.length > 0 ? `\\begin{itemize}
${entry.bullets.map(b => `  \\item ${escapeLaTeX(b)}`).join('\n')}
\\end{itemize}` : ''}`;
}

function generateSkills(entry: SkillsEntry): string {
  return `\\noindent
\\textbf{${escapeLaTeX(entry.category)}:} ${entry.skills.map(s => escapeLaTeX(s)).join(', ')}`;
}

function generateCustom(entry: CustomEntry): string {
  const dateRange = entry.startDate && entry.endDate
    ? formatDateRange(entry.startDate, entry.endDate)
    : '';

  return `\\noindent
\\textbf{${escapeLaTeX(entry.title)}}${entry.subtitle ? ` -- \\textit{${escapeLaTeX(entry.subtitle)}}` : ''} ${entry.location ? `\\hfill ${escapeLaTeX(entry.location)}` : ''}${dateRange ? `\\\\${dateRange}` : ''}
${entry.bullets.length > 0 ? `\\begin{itemize}
${entry.bullets.map(b => `  \\item ${escapeLaTeX(b)}`).join('\n')}
\\end{itemize}` : ''}`;
}

function formatDateRange(start: string, end: string): string {
  const formatDate = (date: string) => {
    if (!date) return '';
    if (date.toLowerCase() === 'present') return 'Present';

    // Parse YYYY-MM format
    const [year, month] = date.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  return `${formatDate(start)} -- ${formatDate(end)}`;
}

function escapeLaTeX(text: string): string {
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/[&%$#_{}]/g, '\\$&')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}
