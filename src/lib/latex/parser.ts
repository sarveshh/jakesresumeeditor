/**
 * LaTeX Parser
 * Parses .tex files and extracts structured data
 */

import { Resume } from '../resume-model';

export function parseLatexToResume(latexContent: string): Partial<Resume> {
  const resume: Partial<Resume> = {
    header: {
      name: '',
      phone: '',
      email: '',
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

export async function parsePdfToText(pdfBlob: Blob): Promise<string> {
  // This will be implemented with pdf-parse on the server side
  const formData = new FormData();
  formData.append('pdf', pdfBlob);

  const response = await fetch('/api/parse-pdf', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to parse PDF');
  }

  const data = await response.json();
  return data.text;
}
