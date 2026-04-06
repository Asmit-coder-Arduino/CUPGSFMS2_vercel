import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { departmentsTable } from "./departments";

export const facultyTable = pgTable("faculty", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  designation: text("designation").notNull(),
  departmentId: integer("department_id")
    .notNull()
    .references(() => departmentsTable.id),
  employeeId: text("employee_id").unique(),
  loginPin: text("login_pin"),
  qualification: text("qualification"),
  specialization: text("specialization"),
  photoUrl: text("photo_url"),
});

export const facultyLikesTable = pgTable("faculty_likes", {
  id: serial("id").primaryKey(),
  facultyId: integer("faculty_id")
    .notNull()
    .references(() => facultyTable.id),
  sessionId: text("session_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertFacultySchema = createInsertSchema(facultyTable).omit({ id: true });
export type InsertFaculty = z.infer<typeof insertFacultySchema>;
export type Faculty = typeof facultyTable.$inferSelect;
