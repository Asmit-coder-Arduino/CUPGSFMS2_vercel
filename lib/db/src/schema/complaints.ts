import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { departmentsTable } from "./departments";

export const complaintsTable = pgTable("complaints", {
  id: serial("id").primaryKey(),
  referenceId: text("reference_id").notNull().unique(),
  studentName: text("student_name").notNull(),
  rollNumber: text("roll_number").notNull(),
  departmentId: integer("department_id").notNull().references(() => departmentsTable.id),
  category: text("category").notNull(),
  priority: text("priority").notNull().default("medium"),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  adminRemarks: text("admin_remarks"),
  hodRemarks: text("hod_remarks"),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});
