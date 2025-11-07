'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    EducationEntry,
    ExperienceEntry,
    ProjectEntry,
    ResumeSection,
    SkillsEntry
} from '@/lib/resume-model';
import { useResumeStore } from '@/store/resume';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function FormEditor() {
  const { resume, updateHeader, addSection } = useResumeStore();

  return (
    <div className="space-y-6 p-6 h-full overflow-auto">
      {/* Header Section */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Header</h2>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={resume.header.name}
              onChange={(e) => updateHeader({ name: e.target.value })}
              placeholder="Jake Thompson"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={resume.header.phone}
                onChange={(e) => updateHeader({ phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={resume.header.email}
                onChange={(e) => updateHeader({ email: e.target.value })}
                placeholder="jake@email.com"
              />
            </div>
          </div>
          <div>
            <Label>Links</Label>
            {resume.header.links.map((link, idx) => (
              <div key={idx} className="flex gap-2 mt-2">
                <Input
                  placeholder="Label"
                  value={link.label}
                  onChange={(e) => {
                    const newLinks = [...resume.header.links];
                    newLinks[idx] = { ...link, label: e.target.value };
                    updateHeader({ links: newLinks });
                  }}
                />
                <Input
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => {
                    const newLinks = [...resume.header.links];
                    newLinks[idx] = { ...link, url: e.target.value };
                    updateHeader({ links: newLinks });
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newLinks = resume.header.links.filter((_, i) => i !== idx);
                    updateHeader({ links: newLinks });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                updateHeader({
                  links: [...resume.header.links, { label: '', url: '' }],
                });
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Link
            </Button>
          </div>
        </div>
      </Card>

      {/* Sections */}
      {resume.sections.map((section) => (
        <SectionEditor key={section.id} section={section} />
      ))}

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          const newSection = {
            id: `section-${Date.now()}`,
            type: 'experience' as const,
            title: 'New Section',
            entries: [],
          };
          addSection(newSection);
        }}
      >
        <Plus className="h-4 w-4 mr-2" /> Add Section
      </Button>
    </div>
  );
}

function SectionEditor({ section }: { section: ResumeSection }) {
  const { updateSection, removeSection, addEntry } = useResumeStore();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
          <Input
            value={section.title}
            onChange={(e) => updateSection(section.id, { title: e.target.value })}
            className="font-bold text-lg border-none p-0 h-auto"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeSection(section.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {section.type === 'experience' && (
            <ExperienceEntries sectionId={section.id} entries={section.entries as ExperienceEntry[]} />
          )}
          {section.type === 'education' && (
            <EducationEntries sectionId={section.id} entries={section.entries as EducationEntry[]} />
          )}
          {section.type === 'projects' && (
            <ProjectEntries sectionId={section.id} entries={section.entries as ProjectEntry[]} />
          )}
          {section.type === 'skills' && (
            <SkillsEntries sectionId={section.id} entries={section.entries as SkillsEntry[]} />
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newEntry = createNewEntry(section.type);
              addEntry(section.id, newEntry);
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Entry
          </Button>
        </div>
      )}
    </Card>
  );
}

function ExperienceEntries({ sectionId, entries }: { sectionId: string; entries: ExperienceEntry[] }) {
  const { updateEntry, removeEntry } = useResumeStore();

  return (
    <>
      {entries.map((entry: any) => (
        <div key={entry.id} className="border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Company</Label>
              <Input
                value={entry.company}
                onChange={(e) => updateEntry(sectionId, entry.id, { company: e.target.value })}
              />
            </div>
            <div>
              <Label>Role</Label>
              <Input
                value={entry.role}
                onChange={(e) => updateEntry(sectionId, entry.id, { role: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Location</Label>
              <Input
                value={entry.location}
                onChange={(e) => updateEntry(sectionId, entry.id, { location: e.target.value })}
              />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="month"
                value={entry.startDate}
                onChange={(e) => updateEntry(sectionId, entry.id, { startDate: e.target.value })}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                value={entry.endDate}
                onChange={(e) => updateEntry(sectionId, entry.id, { endDate: e.target.value })}
                placeholder="Present"
              />
            </div>
          </div>
          <div>
            <Label>Achievements</Label>
            {entry.bullets.map((bullet: string, idx: number) => (
              <div key={idx} className="flex gap-2 mt-2">
                <Textarea
                  value={bullet}
                  onChange={(e) => {
                    const newBullets = [...entry.bullets];
                    newBullets[idx] = e.target.value;
                    updateEntry(sectionId, entry.id, { bullets: newBullets });
                  }}
                  rows={2}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newBullets = entry.bullets.filter((_: any, i: number) => i !== idx);
                    updateEntry(sectionId, entry.id, { bullets: newBullets });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                updateEntry(sectionId, entry.id, { bullets: [...entry.bullets, ''] });
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Bullet
            </Button>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => removeEntry(sectionId, entry.id)}
          >
            Remove Entry
          </Button>
        </div>
      ))}
    </>
  );
}

function EducationEntries({ sectionId, entries }: { sectionId: string; entries: EducationEntry[] }) {
  const { updateEntry, removeEntry } = useResumeStore();

  return (
    <>
      {entries.map((entry: any) => (
        <div key={entry.id} className="border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Institution</Label>
              <Input
                value={entry.institution}
                onChange={(e) => updateEntry(sectionId, entry.id, { institution: e.target.value })}
              />
            </div>
            <div>
              <Label>Degree</Label>
              <Input
                value={entry.degree}
                onChange={(e) => updateEntry(sectionId, entry.id, { degree: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Location</Label>
              <Input
                value={entry.location}
                onChange={(e) => updateEntry(sectionId, entry.id, { location: e.target.value })}
              />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="month"
                value={entry.startDate}
                onChange={(e) => updateEntry(sectionId, entry.id, { startDate: e.target.value })}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="month"
                value={entry.endDate}
                onChange={(e) => updateEntry(sectionId, entry.id, { endDate: e.target.value })}
              />
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => removeEntry(sectionId, entry.id)}
          >
            Remove Entry
          </Button>
        </div>
      ))}
    </>
  );
}

function ProjectEntries({ sectionId, entries }: { sectionId: string; entries: ProjectEntry[] }) {
  const { updateEntry, removeEntry } = useResumeStore();

  return (
    <>
      {entries.map((entry: any) => (
        <div key={entry.id} className="border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Project Name</Label>
              <Input
                value={entry.name}
                onChange={(e) => updateEntry(sectionId, entry.id, { name: e.target.value })}
              />
            </div>
            <div>
              <Label>Technologies</Label>
              <Input
                value={entry.technologies}
                onChange={(e) => updateEntry(sectionId, entry.id, { technologies: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            {entry.bullets.map((bullet: string, idx: number) => (
              <div key={idx} className="flex gap-2 mt-2">
                <Textarea
                  value={bullet}
                  onChange={(e) => {
                    const newBullets = [...entry.bullets];
                    newBullets[idx] = e.target.value;
                    updateEntry(sectionId, entry.id, { bullets: newBullets });
                  }}
                  rows={2}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newBullets = entry.bullets.filter((_: any, i: number) => i !== idx);
                    updateEntry(sectionId, entry.id, { bullets: newBullets });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                updateEntry(sectionId, entry.id, { bullets: [...entry.bullets, ''] });
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Bullet
            </Button>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => removeEntry(sectionId, entry.id)}
          >
            Remove Entry
          </Button>
        </div>
      ))}
    </>
  );
}

function SkillsEntries({ sectionId, entries }: { sectionId: string; entries: SkillsEntry[] }) {
  const { updateEntry, removeEntry } = useResumeStore();

  return (
    <>
      {entries.map((entry: any) => (
        <div key={entry.id} className="border rounded-lg p-4 space-y-3">
          <div>
            <Label>Category</Label>
            <Input
              value={entry.category}
              onChange={(e) => updateEntry(sectionId, entry.id, { category: e.target.value })}
            />
          </div>
          <div>
            <Label>Skills (comma-separated)</Label>
            <Input
              value={entry.skills.join(', ')}
              onChange={(e) => {
                const skills = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                updateEntry(sectionId, entry.id, { skills });
              }}
            />
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => removeEntry(sectionId, entry.id)}
          >
            Remove Entry
          </Button>
        </div>
      ))}
    </>
  );
}

function createNewEntry(type: string) {
  const id = `entry-${Date.now()}`;

  switch (type) {
    case 'experience':
      return {
        id,
        company: '',
        role: '',
        location: '',
        startDate: '',
        endDate: '',
        bullets: [''],
      };
    case 'education':
      return {
        id,
        institution: '',
        degree: '',
        location: '',
        startDate: '',
        endDate: '',
        details: [],
      };
    case 'projects':
      return {
        id,
        name: '',
        technologies: '',
        bullets: [''],
      };
    case 'skills':
      return {
        id,
        category: '',
        skills: [],
      };
    default:
      return {
        id,
        title: '',
        bullets: [''],
      };
  }
}
