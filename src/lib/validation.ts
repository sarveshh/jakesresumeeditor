/**
 * Validation Schemas
 * Zod schemas for form validation
 */

import { z } from "zod";

// Date validation (YYYY-MM format or "Present")
const dateSchema = z.string().refine(
  (val) => {
    if (val.toLowerCase() === "present") return true;
    return /^\d{4}-(0[1-9]|1[0-2])$/.test(val);
  },
  { message: 'Date must be in YYYY-MM format or "Present"' }
);

// Phone validation (flexible formats)
const phoneSchema = z.string().refine(
  (val) => {
    const cleaned = val.replace(/[\s\-\(\)\.]/g, "");
    return /^\d{10,11}$/.test(cleaned);
  },
  { message: "Phone must be a valid 10-11 digit number" }
);

// Email validation
const emailSchema = z.string().email({ message: "Invalid email address" });

// URL validation
const urlSchema = z
  .string()
  .url()
  .or(
    z
      .string()
      .regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, { message: "Invalid URL" })
  );

// Header validation
export const headerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: phoneSchema,
  email: emailSchema,
  links: z.array(
    z.object({
      label: z.string().min(1, "Label is required"),
      url: z.string().min(1, "URL is required"),
    })
  ),
});

// Experience entry validation
export const experienceEntrySchema = z
  .object({
    id: z.string(),
    company: z.string().min(1, "Company name is required"),
    role: z.string().min(1, "Role is required"),
    location: z.string().min(1, "Location is required"),
    startDate: dateSchema,
    endDate: dateSchema,
    bullets: z.array(z.string()),
  })
  .refine(
    (data) => {
      if (data.endDate.toLowerCase() === "present") return true;
      return data.startDate <= data.endDate;
    },
    { message: "End date must be after start date", path: ["endDate"] }
  );

// Education entry validation
export const educationEntrySchema = z
  .object({
    id: z.string(),
    institution: z.string().min(1, "Institution is required"),
    degree: z.string().min(1, "Degree is required"),
    location: z.string().min(1, "Location is required"),
    startDate: dateSchema,
    endDate: dateSchema,
    details: z.array(z.string()),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

// Project entry validation
export const projectEntrySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Project name is required"),
  technologies: z.string().min(1, "Technologies are required"),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  bullets: z.array(z.string()),
});

// Skills entry validation
export const skillsEntrySchema = z.object({
  id: z.string(),
  category: z.string().min(1, "Category is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
});

// Full resume validation
export const resumeSchema = z.object({
  header: headerSchema,
  sections: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["experience", "education", "projects", "skills", "custom"]),
      title: z.string().min(1, "Section title is required"),
      entries: z.array(z.any()), // Polymorphic - validated based on type
    })
  ),
});
