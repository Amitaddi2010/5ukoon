import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { eventsTable } from "./events";
import { attendanceRequestsTable } from "./requests";

export const guestsTable = sqliteTable("guests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  requestId: integer("request_id").notNull().references(() => attendanceRequestsTable.id),
  eventId: integer("event_id").notNull().references(() => eventsTable.id),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  ticketCode: text("ticket_code").notNull(),
  status: text("status", { enum: ["confirmed", "waitlisted"] }).notNull().default("confirmed"),
  checkedIn: integer("checked_in", { mode: "boolean" }).notNull().default(false),
  checkedInAt: integer("checked_in_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const insertGuestSchema = createInsertSchema(guestsTable).omit({
  id: true,
  checkedIn: true,
  checkedInAt: true,
  createdAt: true,
});
export type InsertGuest = z.infer<typeof insertGuestSchema>;
export type Guest = typeof guestsTable.$inferSelect;
