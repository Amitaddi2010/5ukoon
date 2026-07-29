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

// PATCH /admin/events/:id - Update pricing and offers
router.patch("/admin/events/:id", async (req, res) => {
  if (!(req.session as any)?.admin) return res.status(401).json({ error: "Unauthorized" });
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid event ID" });

  try {
    // Dynamically import eventsTable from db to avoid circular/missing imports if it was missing
    const { eventsTable } = await import("@workspace/db");
    
    const { price, originalPrice, offerText } = req.body;
    
    // We update only the fields that were provided
    const updateData: any = {};
    if (price !== undefined) updateData.price = price;
    if (originalPrice !== undefined) updateData.originalPrice = originalPrice;
    if (offerText !== undefined) updateData.offerText = offerText;

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
