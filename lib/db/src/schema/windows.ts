import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const windowsTable = pgTable("feedback_windows", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  feedbackType: text("feedback_type").notNull().default("semester_end"),
  academicYear: text("academic_year").notNull(),
  semester: integer("semester").notNull(),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  departmentIds: text("department_ids").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWindowSchema = createInsertSchema(windowsTable).omit({ id: true, createdAt: true });
export type InsertWindow = z.infer<typeof insertWindowSchema>;
export type Window = typeof windowsTable.$inferSelect;
