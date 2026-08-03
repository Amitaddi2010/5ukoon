import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { feedbacksTable, eventsTable } from "@workspace/db/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// GET /api/feedbacks
// Fetch 4-5 star feedbacks
router.get("/feedbacks", async (req: Request, res: Response) => {
  try {
    const eventId = req.query.eventId ? parseInt(req.query.eventId as string) : undefined;
    
    let conditions = [gte(feedbacksTable.rating, 4)];
    if (eventId && !isNaN(eventId)) {
      conditions.push(eq(feedbacksTable.eventId, eventId));
    }
    
    const feedbacks = await db
      .select()
      .from(feedbacksTable)
      .where(and(...conditions))
      .orderBy(desc(feedbacksTable.createdAt));
      
    res.json(feedbacks);
  } catch (err) {
    console.error("Failed to fetch feedbacks:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const feedbackSchema = z.object({
  eventId: z.number(),
  name: z.string().min(2),
  department: z.string(),
  rating: z.number().min(1).max(5),
  message: z.string().min(5)
});

// POST /api/feedbacks
// Submit a feedback
router.post("/feedbacks", async (req: Request, res: Response) => {
  try {
    const parsed = feedbackSchema.parse(req.body);
    
    // Check if event exists
    const event = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, parsed.eventId))
      .get();
      
    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    
    const newFeedback = await db
      .insert(feedbacksTable)
      .values({
        eventId: parsed.eventId,
        name: parsed.name,
        department: parsed.department,
        rating: parsed.rating,
        message: parsed.message
      })
      .returning()
      .get();
      
    res.status(201).json(newFeedback);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors });
      return;
    }
    console.error("Failed to submit feedback:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
