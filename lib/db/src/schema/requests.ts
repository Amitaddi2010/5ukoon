import { pgTable, serial, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { eventsTable } from "./events";

export const requestStatusEnum = pgEnum("request_status", ["pending", "approved", "declined", "waitlisted"]);

export const attendanceRequestsTable = pgTable("attendance_requests", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => eventsTable.id),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  socialHandle: text("social_handle"),
  heardAbout: text("heard_about"),
  mutualConnection: text("mutual_connection"),
  whyAttend: text("why_attend"),
  status: requestStatusEnum("status").notNull().default("pending"),
  ticketCode: text("ticket_code"),
  checkedIn: boolean("checked_in").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
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
