import { pgTable, serial, text, integer, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const eventStatusEnum = pgEnum("event_status", ["upcoming", "past", "cancelled"]);

export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  editionNumber: integer("edition_number").notNull(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  city: text("city").notNull(),
  venue: text("venue"),
  capacity: integer("capacity").notNull().default(25),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  status: eventStatusEnum("status").notNull().default("upcoming"),
  rsvpLink: text("rsvp_link"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEventSchema = createInsertSchema(eventsTable).omit({ id: true, createdAt: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof eventsTable.$inferSelect;
