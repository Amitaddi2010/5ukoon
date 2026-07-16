import { Router } from "express";
import { db } from "@workspace/db";
import { attendanceRequestsTable, guestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

const router = Router();

function generateTicketCode(): string {
  return "SKN-" + randomBytes(4).toString("hex").toUpperCase();
}

function serializeRequest(r: typeof attendanceRequestsTable.$inferSelect) {
  return {
    ...r,
    createdAt: r.createdAt.toISOString(),
  };
}

// GET /requests — admin only
router.get("/requests", async (req, res) => {
  if (!(req.session as any)?.admin) return res.status(401).json({ error: "Unauthorized" });

  const { eventId, status } = req.query as { eventId?: string; status?: string };

  try {
    let rows = await db.select().from(attendanceRequestsTable).orderBy(attendanceRequestsTable.createdAt);
    if (eventId) rows = rows.filter((r: any) => r.eventId === Number(eventId));
    if (status) rows = rows.filter((r: any) => r.status === status);
    return res.json(rows.map((r: any) => serializeRequest(r)));
  } catch (err) {
    req.log.error({ err }, "Failed to list requests");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /requests — public submission
router.post("/requests", async (req, res) => {
  const { eventId, name, phone, email, socialHandle, heardAbout, mutualConnection, whyAttend } = req.body;

  if (!eventId || !name || !phone || !email) {
    return res.status(400).json({ error: "eventId, name, phone, and email are required" });
  }

  try {
    const [request] = await db
      .insert(attendanceRequestsTable)
      .values({
        eventId: Number(eventId),
        name,
        phone,
        email,
        socialHandle: socialHandle || null,
        heardAbout: heardAbout || null,
        mutualConnection: mutualConnection || null,
        whyAttend: whyAttend || null,
        status: "pending",
      })
      .returning();

    return res.status(201).json(serializeRequest(request));
  } catch (err) {
    req.log.error({ err }, "Failed to create request");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /requests/:id — admin only
router.get("/requests/:id", async (req, res) => {
  if (!(req.session as any)?.admin) return res.status(401).json({ error: "Unauthorized" });
  const id = Number(req.params.id);

  try {
    const [request] = await db
      .select()
      .from(attendanceRequestsTable)
      .where(eq(attendanceRequestsTable.id, id));
    if (!request) return res.status(404).json({ error: "Not found" });
    return res.json(serializeRequest(request));
  } catch (err) {
    req.log.error({ err }, "Failed to get request");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /requests/:id/status — admin only
router.patch("/requests/:id/status", async (req, res) => {
  if (!(req.session as any)?.admin) return res.status(401).json({ error: "Unauthorized" });
  const id = Number(req.params.id);
  const { status } = req.body as { status: "approved" | "declined" | "waitlisted" };

  if (!["approved", "declined", "waitlisted"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const [existing] = await db
      .select()
      .from(attendanceRequestsTable)
      .where(eq(attendanceRequestsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });

    let ticketCode = existing.ticketCode;

    if (status === "approved" && existing.status !== "approved") {
      ticketCode = generateTicketCode();
      const existingGuest = await db
        .select()
        .from(guestsTable)
        .where(eq(guestsTable.requestId, id));

      if (existingGuest.length === 0) {
        await db.insert(guestsTable).values({
          requestId: id,
          eventId: existing.eventId,
          name: existing.name,
          phone: existing.phone,
          email: existing.email,
          ticketCode,
          status: "confirmed",
        });
      }
    }

    const [updated] = await db
      .update(attendanceRequestsTable)
      .set({ status, ticketCode })
      .where(eq(attendanceRequestsTable.id, id))
      .returning();

    return res.json(serializeRequest(updated));
  } catch (err) {
    req.log.error({ err }, "Failed to update request status");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
