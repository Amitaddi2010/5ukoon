import { Router } from "express";
import { db } from "@workspace/db";
import { eventsTable, attendanceRequestsTable, guestsTable } from "@workspace/db";
import { eq, count, and } from "drizzle-orm";

const router = Router();

// GET /events — list upcoming public events
router.get("/events", async (req, res) => {
  try {
    const events = await db
      .select()
      .from(eventsTable)
      .orderBy(eventsTable.date);
    return res.json(
      events.map((e: any) => ({
        ...e,
        price: Number(e.price),
        date: e.date.toISOString(),
        createdAt: e.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list events");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /events/:id — single event
router.get("/events/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid id" });

  try {
    const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, id));
    if (!event) return res.status(404).json({ error: "Not found" });
    return res.json({
      ...event,
      price: Number(event.price),
      date: event.date.toISOString(),
      createdAt: event.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get event");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /events/:id/stats — admin seat stats
router.get("/events/:id/stats", async (req, res) => {
  if (!(req.session as any)?.admin) return res.status(401).json({ error: "Unauthorized" });
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid id" });

  try {
    const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, id));
    if (!event) return res.status(404).json({ error: "Not found" });

    const [[pending], [approved], [waitlisted], [declined], [arrived]] = await Promise.all([
      db.select({ count: count() }).from(attendanceRequestsTable)
        .where(and(eq(attendanceRequestsTable.eventId, id), eq(attendanceRequestsTable.status, "pending"))),
      db.select({ count: count() }).from(attendanceRequestsTable)
        .where(and(eq(attendanceRequestsTable.eventId, id), eq(attendanceRequestsTable.status, "approved"))),
      db.select({ count: count() }).from(attendanceRequestsTable)
        .where(and(eq(attendanceRequestsTable.eventId, id), eq(attendanceRequestsTable.status, "waitlisted"))),
      db.select({ count: count() }).from(attendanceRequestsTable)
        .where(and(eq(attendanceRequestsTable.eventId, id), eq(attendanceRequestsTable.status, "declined"))),
      db.select({ count: count() }).from(guestsTable)
        .where(and(eq(guestsTable.eventId, id), eq(guestsTable.checkedIn, true))),
    ]);

    return res.json({
      eventId: id,
      capacity: event.capacity,
      confirmed: Number(approved?.count ?? 0),
      pending: Number(pending?.count ?? 0),
      waitlisted: Number(waitlisted?.count ?? 0),
      declined: Number(declined?.count ?? 0),
      arrived: Number(arrived?.count ?? 0),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get event stats");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
