import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { coursesTable } from "./courses";
import { facultyTable } from "./faculty";
import { departmentsTable } from "./departments";

export const feedbackTable = pgTable("feedback", {
  id: serial("id").primaryKey(),
  referenceId: text("reference_id").notNull().unique(),
  courseId: integer("course_id")
    .notNull()
    .references(() => coursesTable.id),
  facultyId: integer("faculty_id").references(() => facultyTable.id),
  departmentId: integer("department_id")
    .notNull()
    .references(() => departmentsTable.id),
  semester: integer("semester").notNull(),
  academicYear: text("academic_year").notNull(),
  studentYear: integer("student_year"),
  section: text("section"),
  feedbackType: text("feedback_type").notNull().default("semester_end"),
  ratingCourseContent: real("rating_course_content").notNull(),
  ratingTeachingQuality: real("rating_teaching_quality").notNull(),
  ratingLabFacilities: real("rating_lab_facilities").notNull(),
  ratingStudyMaterial: real("rating_study_material").notNull(),
  ratingOverall: real("rating_overall").notNull(),
  comments: text("comments"),
  customAnswers: jsonb("custom_answers"),
  isAnonymous: boolean("is_anonymous").notNull().default(true),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFeedbackSchema = createInsertSchema(feedbackTable).omit({ id: true, createdAt: true });
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedbackTable.$inferSelect;
