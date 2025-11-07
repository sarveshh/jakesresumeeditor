/**
 * Draggable Sections Container
 * Enables drag-and-drop reordering of resume sections
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ResumeSection } from "@/lib/resume-model";
import { useResumeStore } from "@/store/resume";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from "lucide-react";

export default function DraggableSections({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resume, reorderSections } = useResumeStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = resume.sections.findIndex((s) => s.id === active.id);
      const newIndex = resume.sections.findIndex((s) => s.id === over.id);

      const reordered = arrayMove(resume.sections, oldIndex, newIndex);
      reorderSections(reordered);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={resume.sections.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </DndContext>
  );
}

export function SortableSection({
  section,
  children,
  isExpanded,
  onToggleExpand,
  onRemove,
  onUpdateTitle,
}: {
  section: ResumeSection;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRemove: () => void;
  onUpdateTitle: (title: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            value={section.title}
            onChange={(e) => onUpdateTitle(e.target.value)}
            className="font-bold text-lg border-none p-0 h-auto"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onToggleExpand}>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isExpanded && <div className="space-y-4">{children}</div>}
    </Card>
  );
}
