import { pgTable, serial, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { eventsTable } from "./events";
import { attendanceRequestsTable } from "./requests";

export const guestStatusEnum = pgEnum("guest_status", ["confirmed", "waitlisted"]);

export const guestsTable = pgTable("guests", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull().references(() => attendanceRequestsTable.id),
  eventId: integer("event_id").notNull().references(() => eventsTable.id),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  ticketCode: text("ticket_code").notNull(),
  status: guestStatusEnum("status").notNull().default("confirmed"),
  checkedIn: boolean("checked_in").notNull().default(false),
  checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGuestSchema = createInsertSchema(guestsTable).omit({
  id: true,
  checkedIn: true,
  checkedInAt: true,
  createdAt: true,
});
export type InsertGuest = z.infer<typeof insertGuestSchema>;
export type Guest = typeof guestsTable.$inferSelect;
