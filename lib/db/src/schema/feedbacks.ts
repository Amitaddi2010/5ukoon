import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { eventsTable } from "./events";

export const feedbacksTable = sqliteTable("feedbacks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id").notNull().references(() => eventsTable.id),
  name: text("name").notNull(),
  department: text("department").notNull(),
  rating: integer("rating").notNull(), // 1 to 5
  message: text("message").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const insertFeedbackSchema = createInsertSchema(feedbacksTable).omit({
  id: true,
  createdAt: true,
});
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedbacksTable.$inferSelect;
