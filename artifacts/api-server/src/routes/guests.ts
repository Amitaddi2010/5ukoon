import { Router } from "express";
import { db } from "@workspace/db";
import { guestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function serializeGuest(g: typeof guestsTable.$inferSelect) {
  return {
    ...g,
    checkedInAt: g.checkedInAt ? g.checkedInAt.toISOString() : null,
    createdAt: g.createdAt.toISOString(),
  };
}

// GET /guests — admin/check-in view
router.get("/guests", async (req, res) => {
  if (!(req.session as any)?.admin) return res.status(401).json({ error: "Unauthorized" });

  const { eventId } = req.query as { eventId?: string };

  try {
    let rows = await db.select().from(guestsTable).orderBy(guestsTable.name);
    if (eventId) rows = rows.filter((g: any) => g.eventId === Number(eventId));
    return res.json(rows.map((g: any) => serializeGuest(g)));
  } catch (err) {
    req.log.error({ err }, "Failed to list guests");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /guests/:id/checkin — mark arrived
router.patch("/guests/:id/checkin", async (req, res) => {
  if (!(req.session as any)?.admin) return res.status(401).json({ error: "Unauthorized" });
  const id = Number(req.params.id);

  try {
    const [existing] = await db.select().from(guestsTable).where(eq(guestsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });

    const [updated] = await db
      .update(guestsTable)
      .set({ checkedIn: true, checkedInAt: new Date() })
      .where(eq(guestsTable.id, id))
      .returning();

    return res.json(serializeGuest(updated));
  } catch (err) {
    req.log.error({ err }, "Failed to check in guest");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
