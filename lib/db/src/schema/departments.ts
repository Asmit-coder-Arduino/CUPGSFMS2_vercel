import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const departmentsTable = pgTable("departments", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  hodName: text("hod_name"),
  hodEmployeeId: text("hod_employee_id").unique(),
  hodPin: text("hod_pin"),
});

export const insertDepartmentSchema = createInsertSchema(departmentsTable).omit({ id: true });
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departmentsTable.$inferSelect;
