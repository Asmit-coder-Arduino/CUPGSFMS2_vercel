import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { departmentsTable } from "./departments";

// Each HOD can save one custom form template per department.
// The 'fields' column stores an array of FieldConfig objects (see type below).
export const formTemplatesTable = pgTable("form_templates", {
  id: serial("id").primaryKey(),
  departmentId: integer("department_id")
    .notNull()
    .unique()
    .references(() => departmentsTable.id),
  title: text("title").notNull().default("Student Feedback Form"),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  fields: jsonb("fields").notNull().$type<FieldConfig[]>(),
  commentLabel: text("comment_label").notNull().default("Additional Comments / Suggestions"),
  commentRequired: boolean("comment_required").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type FormTemplate = typeof formTemplatesTable.$inferSelect;

// ── FieldConfig — stored as JSONB ─────────────────────────────────────────────

export interface FieldConfig {
  id: string;
  label: string;
  description?: string;
  type: "star_5" | "yes_no" | "mcq" | "text_short";
  options?: string[];     // For MCQ choices
  required: boolean;
  enabled: boolean;
  order: number;
  isStandard: boolean;    // true = maps to a fixed feedback column
  standardKey?: "courseContent" | "teachingQuality" | "labFacilities" | "studyMaterial" | "overall";
}

// ── Default fields (what every new department starts with) ────────────────────

export const DEFAULT_FIELDS: FieldConfig[] = [
  { id: "courseContent",    label: "Course Content",       description: "Quality and coverage of course syllabus",                   type: "star_5", required: true,  enabled: true, order: 1, isStandard: true,  standardKey: "courseContent"    },
  { id: "teachingQuality",  label: "Teaching Quality",     description: "Clarity, communication and effectiveness of teaching",      type: "star_5", required: true,  enabled: true, order: 2, isStandard: true,  standardKey: "teachingQuality"  },
  { id: "labFacilities",    label: "Lab Facilities",       description: "Quality and availability of lab equipment and resources",   type: "star_5", required: true,  enabled: true, order: 3, isStandard: true,  standardKey: "labFacilities"    },
  { id: "studyMaterial",    label: "Study Material",       description: "Adequacy and quality of notes, references and resources",   type: "star_5", required: true,  enabled: true, order: 4, isStandard: true,  standardKey: "studyMaterial"    },
  { id: "overall",          label: "Overall Satisfaction", description: "Your overall rating for this course",                       type: "star_5", required: true,  enabled: true, order: 5, isStandard: true,  standardKey: "overall"          },
];
