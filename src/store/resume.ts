/**
 * Zustand Store for Resume State Management
 * Handles localStorage persistence and state updates
 */

import {
    CustomEntry,
    EducationEntry,
    ExperienceEntry,
    ProjectEntry,
    Resume,
    ResumeSection,
    SkillsEntry,
    createDefaultResume
} from '@/lib/resume-model';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ResumeEntry = ExperienceEntry | EducationEntry | ProjectEntry | SkillsEntry | CustomEntry;

interface ResumeStore {
  resume: Resume;
  setResume: (resume: Resume) => void;
  updateHeader: (header: Partial<Resume['header']>) => void;
  addSection: (section: ResumeSection) => void;
  updateSection: (sectionId: string, updates: Partial<ResumeSection>) => void;
  removeSection: (sectionId: string) => void;
  reorderSections: (sections: ResumeSection[]) => void;
  addEntry: (sectionId: string, entry: ResumeEntry) => void;
  updateEntry: (sectionId: string, entryId: string, updates: Partial<ResumeEntry>) => void;
  removeEntry: (sectionId: string, entryId: string) => void;
  reset: () => void;
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      resume: createDefaultResume(),

      setResume: (resume) => set({ resume }),

      updateHeader: (header) =>
        set((state) => ({
          resume: {
            ...state.resume,
            header: { ...state.resume.header, ...header },
          },
        })),

      addSection: (section) =>
        set((state) => ({
          resume: {
            ...state.resume,
            sections: [...state.resume.sections, section],
          },
        })),

      updateSection: (sectionId, updates) =>
        set((state) => ({
          resume: {
            ...state.resume,
            sections: state.resume.sections.map((section) =>
              section.id === sectionId ? { ...section, ...updates } : section
            ),
          },
        })),

      removeSection: (sectionId) =>
        set((state) => ({
          resume: {
            ...state.resume,
            sections: state.resume.sections.filter((s) => s.id !== sectionId),
          },
        })),

      reorderSections: (sections) =>
        set((state) => ({
          resume: { ...state.resume, sections },
        })),

      addEntry: (sectionId, entry) =>
        set((state) => ({
          resume: {
            ...state.resume,
            sections: state.resume.sections.map((section) =>
              section.id === sectionId
                ? { ...section, entries: [...section.entries, entry] }
                : section
            ),
          },
        })),

      updateEntry: (sectionId, entryId, updates) =>
        set((state) => ({
          resume: {
            ...state.resume,
            sections: state.resume.sections.map((section) =>
              section.id === sectionId
                ? {
                    ...section,
                    entries: section.entries.map((entry) =>
                      entry.id === entryId ? { ...entry, ...updates } : entry
                    ),
                  }
                : section
            ),
          },
        })),

      removeEntry: (sectionId, entryId) =>
        set((state) => ({
          resume: {
            ...state.resume,
            sections: state.resume.sections.map((section) =>
              section.id === sectionId
                ? {
                    ...section,
                    entries: section.entries.filter((e) => e.id !== entryId),
                  }
                : section
            ),
          },
        })),

      reset: () => set({ resume: createDefaultResume() }),
    }),
    {
      name: 'jake-resume-storage',
    }
  )
);
