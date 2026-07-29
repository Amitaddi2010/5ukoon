import { Router } from "express";
import { db } from "@workspace/db";
import { attendanceRequestsTable, guestsTable } from "@workspace/db";
import { eq, and, or } from "drizzle-orm";
import { randomBytes } from "crypto";

const router = Router();

function generateTicketCode(): string {
  return "SKN-" + randomBytes(4).toString("hex").toUpperCase();
}

function serializeRequest(r: typeof attendanceRequestsTable.$inferSelect) {
  if (!r) return r;
  let createdAtStr: string;
  try {
    if (r.createdAt instanceof Date) {
      createdAtStr = r.createdAt.toISOString();
    } else if (r.createdAt) {
      createdAtStr = new Date(r.createdAt).toISOString();
    } else {
      createdAtStr = new Date().toISOString();
    }
  } catch {
    createdAtStr = new Date().toISOString();
  }

  return {
    ...r,
    createdAt: createdAtStr,
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
  } catch (err: any) {
    req.log.error({ err, message: err?.message, stack: err?.stack }, "Failed to list requests");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /requests — public submission
router.post("/requests", async (req, res) => {
  const { eventId, name, phone, email, socialHandle, heardAbout, mutualConnection, whyAttend, department, attendancePossibility } = req.body;

  if (!eventId || !name || !phone || !email) {
    return res.status(400).json({ error: "eventId, name, phone, and email are required" });
  }

  const sessionUser = (req.session as any)?.user;
  const cleanEmail = email.toLowerCase().trim();
  const cleanPhone = phone.trim();

  try {
    const existing = await db
      .select()
      .from(attendanceRequestsTable)
      .where(
        and(
          eq(attendanceRequestsTable.eventId, Number(eventId)),
          or(
            eq(attendanceRequestsTable.email, cleanEmail),
            eq(attendanceRequestsTable.phone, cleanPhone)
          )
        )
      );

    if (existing.length > 0) {
      const [updated] = await db
        .update(attendanceRequestsTable)
        .set({
          name: name.trim(),
          phone: phone.trim(),
          department: department || existing[0].department,
          attendancePossibility: attendancePossibility || existing[0].attendancePossibility,
          userId: sessionUser?.id || existing[0].userId,
        })
        .where(eq(attendanceRequestsTable.id, existing[0].id))
        .returning();

      return res.json({
        ...serializeRequest(updated),
        isDuplicate: true,
      });
    }

    const [request] = await db
      .insert(attendanceRequestsTable)
      .values({
        eventId: Number(eventId),
        userId: sessionUser?.id || null,
        name: name.trim(),
        phone: phone.trim(),
        email: cleanEmail,
        socialHandle: socialHandle || null,
        heardAbout: heardAbout || null,
        mutualConnection: mutualConnection || null,
        whyAttend: whyAttend || null,
        department: department || null,
        attendancePossibility: attendancePossibility || null,
        status: "pending",
      })
      .returning();

    return res.status(201).json(serializeRequest(request));
  } catch (err: any) {
    req.log.error({ err, message: err?.message, stack: err?.stack }, "Failed to create request");
    return res.status(500).json({ error: "Internal server error: " + (err?.message || "Failed to save registration") });
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
