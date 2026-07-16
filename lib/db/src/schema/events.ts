import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const eventsTable = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  editionNumber: integer("edition_number").notNull(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  city: text("city").notNull(),
  venue: text("venue"),
  capacity: integer("capacity").notNull().default(25),
  price: real("price").notNull(),
  status: text("status", { enum: ["upcoming", "past", "cancelled"] }).notNull().default("upcoming"),
  rsvpLink: text("rsvp_link"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const insertEventSchema = createInsertSchema(eventsTable).omit({ id: true, createdAt: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof eventsTable.$inferSelect;
