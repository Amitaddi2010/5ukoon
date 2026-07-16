import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { eventsTable } from "./events";

export const attendanceRequestsTable = sqliteTable("attendance_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id").notNull().references(() => eventsTable.id),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  socialHandle: text("social_handle"),
  heardAbout: text("heard_about"),
  mutualConnection: text("mutual_connection"),
  whyAttend: text("why_attend"),
  status: text("status", { enum: ["pending", "approved", "declined", "waitlisted"] }).notNull().default("pending"),
  ticketCode: text("ticket_code"),
  checkedIn: integer("checked_in", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const insertAttendanceRequestSchema = createInsertSchema(attendanceRequestsTable).omit({
  id: true,
  status: true,
  ticketCode: true,
  checkedIn: true,
  createdAt: true,
});
export type InsertAttendanceRequest = z.infer<typeof insertAttendanceRequestSchema>;
export type AttendanceRequest = typeof attendanceRequestsTable.$inferSelect;
