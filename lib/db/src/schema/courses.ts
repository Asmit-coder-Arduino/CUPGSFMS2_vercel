import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { departmentsTable } from "./departments";
import { facultyTable } from "./faculty";

export const coursesTable = pgTable("courses", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  departmentId: integer("department_id")
    .notNull()
    .references(() => departmentsTable.id),
  facultyId: integer("faculty_id").references(() => facultyTable.id),
  semester: integer("semester").notNull(),
  academicYear: text("academic_year").notNull(),
  credits: integer("credits").notNull().default(3),
});

export const insertCourseSchema = createInsertSchema(coursesTable).omit({ id: true });
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof coursesTable.$inferSelect;
