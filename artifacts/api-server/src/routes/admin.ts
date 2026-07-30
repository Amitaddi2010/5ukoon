import { Router } from "express";
import { db } from "@workspace/db";
import { adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "sukoon-salt-2026").digest("hex");
}

// POST /admin/login
router.post("/admin/login", async (req, res) => {
  const { username, password } = req.body as { username: string; password: string };
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    // 1. Check environment variables first (most secure & convenient)
    const envUser = process.env.ADMIN_USERNAME?.trim();
    const envPass = process.env.ADMIN_PASSWORD?.trim();

    if (envUser && envPass && username.trim() === envUser && password === envPass) {
      (req.session as any).admin = { username: envUser, name: "Administrator" };
      return res.json({ username: envUser, name: "Administrator" });
    }

    // 2. Fall back to database if env variables aren't set or don't match
    const [admin] = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.username, username));

    if (!admin || admin.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    (req.session as any).admin = { username: admin.username, name: admin.name };
    return res.json({ username: admin.username, name: admin.name });
  } catch (err) {
    req.log.error({ err }, "Admin login failed");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /admin/logout
router.post("/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

// GET /admin/me
router.get("/admin/me", (req, res) => {
  const admin = (req.session as any)?.admin;
  if (!admin) return res.status(401).json({ error: "Unauthorized" });
  return res.json(admin);
});

// POST /admin/events - Create new event
router.post("/admin/events", async (req, res) => {
  if (!(req.session as any)?.admin) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { eventsTable } = await import("@workspace/db");
    const {
      title,
      editionNumber,
      date,
      city,
      venue,
      capacity,
      price,
      originalPrice,
      offerText,
      status,
      rsvpLink,
    } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: "Title and Date are required" });
    }

    let parsedDate: Date;
    if (date instanceof Date) {
      parsedDate = date;
    } else if (typeof date === "number") {
      parsedDate = new Date(date < 10000000000 ? date * 1000 : date);
    } else {
      const trimmed = String(date).trim();
      if (/^\d+$/.test(trimmed)) {
        const num = Number(trimmed);
        parsedDate = new Date(num < 10000000000 ? num * 1000 : num);
      } else {
        parsedDate = new Date(trimmed);
      }
    }
    if (isNaN(parsedDate.getTime())) {
      parsedDate = new Date("2026-08-01T12:30:00.000Z");
    }

    const [newEvent] = await db
      .insert(eventsTable)
      .values({
        title,
        editionNumber: Number(editionNumber) || 1,
        date: parsedDate,
        city: city || "Chandigarh",
        venue: venue || null,
        capacity: capacity ? Number(capacity) : 25,
        price: price !== undefined ? Number(price) : 299,
        originalPrice: originalPrice ? Number(originalPrice) : null,
        offerText: offerText || null,
        status: status || "upcoming",
        rsvpLink: rsvpLink || null,
        createdAt: new Date(),
      })
      .returning();

    return res.status(201).json(newEvent);
  } catch (err) {
    req.log.error({ err }, "Failed to create event");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /admin/events/:id - Update all event details
router.patch("/admin/events/:id", async (req, res) => {
  if (!(req.session as any)?.admin) return res.status(401).json({ error: "Unauthorized" });
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid event ID" });

  try {
    const { eventsTable } = await import("@workspace/db");
    
    const {
      title,
      editionNumber,
      date,
      city,
      venue,
      capacity,
      price,
      originalPrice,
      offerText,
      status,
      rsvpLink,
    } = req.body;
    
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (editionNumber !== undefined) updateData.editionNumber = Number(editionNumber);
    if (city !== undefined) updateData.city = city;
    if (venue !== undefined) updateData.venue = venue;
    if (capacity !== undefined) updateData.capacity = Number(capacity);
    if (price !== undefined) updateData.price = Number(price);
    if (originalPrice !== undefined) updateData.originalPrice = originalPrice ? Number(originalPrice) : null;
    if (offerText !== undefined) updateData.offerText = offerText || null;
    if (status !== undefined) updateData.status = status;
    if (rsvpLink !== undefined) updateData.rsvpLink = rsvpLink || null;

    if (date !== undefined) {
      let parsedDate: Date;
      if (date instanceof Date) {
        parsedDate = date;
      } else if (typeof date === "number") {
        parsedDate = new Date(date < 10000000000 ? date * 1000 : date);
      } else {
        const trimmed = String(date).trim();
        if (/^\d+$/.test(trimmed)) {
          const num = Number(trimmed);
          parsedDate = new Date(num < 10000000000 ? num * 1000 : num);
        } else {
          parsedDate = new Date(trimmed);
        }
      }
      if (!isNaN(parsedDate.getTime())) {
        updateData.date = parsedDate;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    await db.update(eventsTable).set(updateData).where(eq(eventsTable.id, id));
    
    return res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to update event details");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /admin/events/:id - Delete an event
router.delete("/admin/events/:id", async (req, res) => {
  if (!(req.session as any)?.admin) return res.status(401).json({ error: "Unauthorized" });
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid event ID" });

  try {
    const { eventsTable, attendanceRequestsTable, guestsTable } = await import("@workspace/db");

    // Clean up dependent records first
    await db.delete(guestsTable).where(eq(guestsTable.eventId, id));
    await db.delete(attendanceRequestsTable).where(eq(attendanceRequestsTable.eventId, id));
    await db.delete(eventsTable).where(eq(eventsTable.id, id));

    return res.json({ message: "Event deleted successfully" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete event");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/users - List all registered accounts (users + event registrants)
router.get("/admin/users", async (req, res) => {
  if (!(req.session as any)?.admin) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { usersTable, attendanceRequestsTable } = await import("@workspace/db");

    // 1. Get explicit signed-up user accounts
    const signedUpUsers = await db.select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      phone: usersTable.phone,
      department: usersTable.department,
      createdAt: usersTable.createdAt,
    }).from(usersTable);

    const userMap = new Map<string, any>();

    signedUpUsers.forEach((u) => {
      let isoDate: string;
      try {
        const d = u.createdAt instanceof Date ? u.createdAt : new Date(u.createdAt);
        isoDate = !isNaN(d.getTime()) ? d.toISOString() : new Date().toISOString();
      } catch {
        isoDate = new Date().toISOString();
      }
      const cleanEmail = u.email.toLowerCase().trim();
      userMap.set(cleanEmail, {
        ...u,
        createdAt: isoDate,
        isSignedUp: true,
      });
    });

    // 2. Get event registration guests and include any not yet in userMap
    const requests = await db.select().from(attendanceRequestsTable);

    requests.forEach((r) => {
      const cleanEmail = r.email.toLowerCase().trim();
      if (!userMap.has(cleanEmail)) {
        let isoDate: string;
        try {
          const d = r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt);
          isoDate = !isNaN(d.getTime()) ? d.toISOString() : new Date().toISOString();
        } catch {
          isoDate = new Date().toISOString();
        }
        userMap.set(cleanEmail, {
          id: r.id, // request id fallback
          name: r.name,
          email: r.email,
          phone: r.phone,
          department: r.department || "PGIMER",
          createdAt: isoDate,
          isSignedUp: false,
          status: r.status,
        });
      }
    });

    const combinedList = Array.from(userMap.values());
    return res.json(combinedList);
  } catch (err) {
    req.log.error({ err }, "Failed to list registered users");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /admin/users/:id - Remove a user account
router.delete("/admin/users/:id", async (req, res) => {
  if (!(req.session as any)?.admin) return res.status(401).json({ error: "Unauthorized" });
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid user ID" });

  try {
    const { usersTable, attendanceRequestsTable } = await import("@workspace/db");

    // Unlink attendance requests first
    await db.update(attendanceRequestsTable).set({ userId: null }).where(eq(attendanceRequestsTable.userId, id));

    // Delete user
    await db.delete(usersTable).where(eq(usersTable.id, id));

    return res.json({ message: "User deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete user");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
