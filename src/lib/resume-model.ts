/**
 * Core Resume Data Model
 * Structured data that drives both the UI and LaTeX generation
 */

export interface ResumeLink {
  label: string;
  url: string;
}

export interface ResumeHeader {
  name: string;
  phone: string;
  email: string;
  links: ResumeLink[];
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  details: string[];
}

export interface ProjectEntry {
  id: string;
  name: string;
  technologies: string;
  startDate?: string;
  endDate?: string;
  bullets: string[];
}

export interface SkillsEntry {
  id: string;
  category: string;
  skills: string[];
}

export interface CustomEntry {
  id: string;
  title: string;
  subtitle?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  bullets: string[];
}

export type SectionType = 
  | "experience" 
  | "education" 
  | "projects" 
  | "skills" 
  | "custom";

export interface ResumeSection {
  id: string;
  type: SectionType;
  title: string;
  entries: (ExperienceEntry | EducationEntry | ProjectEntry | SkillsEntry | CustomEntry)[];
}

export interface Resume {
  header: ResumeHeader;
  sections: ResumeSection[];
}

export const createDefaultResume = (): Resume => ({
  header: {
    name: "Jake Thompson",
    phone: "(555) 123-4567",
    email: "jake.thompson@email.com",
    links: [
      { label: "LinkedIn", url: "linkedin.com/in/jakethompson" },
      { label: "GitHub", url: "github.com/jakethompson" },
    ],
  },
  sections: [
    {
      id: "experience-1",
      type: "experience",
      title: "Professional Experience",
      entries: [
        {
          id: "exp-1",
          company: "Tech Corp",
          role: "Senior Software Engineer",
          location: "San Francisco, CA",
          startDate: "2022-01",
          endDate: "Present",
          bullets: [
            "Led development of microservices architecture serving 10M+ users",
            "Reduced API response time by 40% through optimization",
            "Mentored team of 5 junior engineers",
          ],
        },
      ],
    },
    {
      id: "education-1",
      type: "education",
      title: "Education",
      entries: [
        {
          id: "edu-1",
          institution: "University of Technology",
          degree: "B.S. in Computer Science",
          location: "Boston, MA",
          startDate: "2014-09",
          endDate: "2018-05",
          details: ["GPA: 3.8/4.0", "Dean's List"],
        },
      ],
    },
    {
      id: "skills-1",
      type: "skills",
      title: "Technical Skills",
      entries: [
        {
          id: "skill-1",
          category: "Languages",
          skills: ["JavaScript", "TypeScript", "Python", "Java"],
        },
        {
          id: "skill-2",
          category: "Frameworks",
          skills: ["React", "Node.js", "Next.js", "Express"],
        },
      ],
    },
  ],
});
