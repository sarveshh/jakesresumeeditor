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
  location?: string; // e.g., "Mumbai, India (Open to relocation)"
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
  entries: (
    | ExperienceEntry
    | EducationEntry
    | ProjectEntry
    | SkillsEntry
    | CustomEntry
  )[];
}

export interface Resume {
  header: ResumeHeader;
  sections: ResumeSection[];
}

export const createDefaultResume = (): Resume => ({
  header: {
    name: "",
    phone: "",
    email: "",
    links: [],
  },
  sections: [],
});
