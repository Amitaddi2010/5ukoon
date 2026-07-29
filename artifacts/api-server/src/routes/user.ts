import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, attendanceRequestsTable, eventsTable } from "@workspace/db";
import { eq, or, desc } from "drizzle-orm";
import { createHash } from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "sukoon-salt-2026").digest("hex");
}

function serializeUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    department: user.department,
    phone: user.phone,
    email: user.email,
  };
}

// POST /user/signup — Register user account
router.post("/user/signup", async (req, res) => {
  const { name, department, phone, email, password } = req.body;

  if (!name || !department || !phone || !email || !password) {
    return res.status(400).json({ error: "Name, department, phone, email, and password are required" });
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanPhone = phone.trim();

  try {
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, cleanEmail));

    if (existing.length > 0) {
      return res.status(400).json({ error: "An account with this email already exists. Please log in." });
    }

    const [user] = await db
      .insert(usersTable)
      .values({
        name: name.trim(),
        department: department.trim(),
        phone: cleanPhone,
        email: cleanEmail,
        passwordHash: hashPassword(password),
      })
      .returning();

    // Link existing attendance requests to this new user account
    await db
      .update(attendanceRequestsTable)
      .set({ userId: user.id })
      .where(
        or(
          eq(attendanceRequestsTable.email, cleanEmail),
          eq(attendanceRequestsTable.phone, cleanPhone)
        )
      );

    // Store in session
    (req.session as any).user = serializeUser(user);

    return res.status(201).json(serializeUser(user));
  } catch (err) {
    req.log.error({ err }, "Failed to register user");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /user/login — Guest login
router.post("/user/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, cleanEmail));

    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Auto-link existing attendance requests to user account
    await db
      .update(attendanceRequestsTable)
      .set({ userId: user.id })
      .where(
        or(
          eq(attendanceRequestsTable.email, cleanEmail),
          eq(attendanceRequestsTable.phone, user.phone)
        )
      );

    const sessionUser = serializeUser(user);
    (req.session as any).user = sessionUser;

    return res.json(sessionUser);
  } catch (err) {
    req.log.error({ err }, "Failed to login user");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Helper to normalize 10-digit phone number
function normalizePhone(p: string | null | undefined): string {
  if (!p) return "";
  const digits = p.replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

// POST /user/reset-password — Reset user password via strict phone & email verification
router.post("/user/reset-password", async (req, res) => {
  const { email, phone, newPassword } = req.body;

  if (!email || !phone || !newPassword) {
    return res.status(400).json({ error: "Email, registered phone number, and new password are required." });
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanPhone = phone.trim();
  const normInputPhone = normalizePhone(cleanPhone);

  if (!normInputPhone || normInputPhone.length < 10) {
    return res.status(400).json({ error: "Please enter a valid 10-digit registered phone number." });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters long." });
  }

  try {
    // 1. Check usersTable by email
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, cleanEmail));

    if (user) {
      const userNormPhone = normalizePhone(user.phone);
      if (userNormPhone !== normInputPhone) {
        return res.status(400).json({
          error: "The entered phone number does not match the registered phone number for this email account.",
        });
      }

      await db
        .update(usersTable)
        .set({ passwordHash: hashPassword(newPassword) })
        .where(eq(usersTable.id, user.id));

      return res.json({ message: "Password reset successful! Please log in with your new password." });
    }

    // 2. Fall back to attendanceRequestsTable (for guests who registered for an event)
    const [request] = await db
      .select()
      .from(attendanceRequestsTable)
      .where(eq(attendanceRequestsTable.email, cleanEmail));

    if (request) {
      const requestNormPhone = normalizePhone(request.phone);
      if (requestNormPhone !== normInputPhone) {
        return res.status(400).json({
          error: "The entered phone number does not match the registered phone number for this email account.",
        });
      }

      // Create user account for this registrant
      const [newUser] = await db
        .insert(usersTable)
        .values({
          name: request.name,
          department: request.department || "PGIMER",
          phone: request.phone,
          email: request.email,
          passwordHash: hashPassword(newPassword),
        })
        .returning();

      // Link request to newly created user
      await db
        .update(attendanceRequestsTable)
        .set({ userId: newUser.id })
        .where(eq(attendanceRequestsTable.id, request.id));

      return res.json({ message: "Password set & account created successfully! Please sign in with your new password." });
    }

    return res.status(404).json({ error: "No registered user account or event pass found for this email address." });
  } catch (err) {
    req.log.error({ err }, "Failed to reset user password");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /user/logout — Guest logout
router.post("/user/logout", (req, res) => {
  delete (req.session as any).user;
  return res.json({ message: "Logged out" });
});

// GET /user/me — Current user profile
router.get("/user/me", (req, res) => {
  const user = (req.session as any)?.user;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return res.json(user);
});

// GET /user/passes — Digital ticket passes for logged-in user
router.get("/user/passes", async (req, res) => {
  const user = (req.session as any)?.user;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const cleanEmail = user.email ? user.email.toLowerCase().trim() : "";
    const cleanPhone = user.phone ? user.phone.trim() : "";

    req.log.info({ sessionUser: user, cleanEmail, cleanPhone }, "GET /user/passes — session user");

    const conditions = [];
    if (user.id) conditions.push(eq(attendanceRequestsTable.userId, user.id));
    if (cleanEmail) conditions.push(eq(attendanceRequestsTable.email, cleanEmail));
    if (cleanPhone) conditions.push(eq(attendanceRequestsTable.phone, cleanPhone));

    req.log.info({ conditionCount: conditions.length, hasId: !!user.id, hasEmail: !!cleanEmail, hasPhone: !!cleanPhone }, "GET /user/passes — conditions");

    // Find all attendance requests matching user's id, email, or phone
    const requests = await db
      .select({
        request: attendanceRequestsTable,
        event: eventsTable,
      })
      .from(attendanceRequestsTable)
      .innerJoin(eventsTable, eq(attendanceRequestsTable.eventId, eventsTable.id))
      .where(conditions.length > 0 ? or(...conditions) : eq(attendanceRequestsTable.id, -1))
      .orderBy(desc(attendanceRequestsTable.createdAt));

    req.log.info({ resultCount: requests.length }, "GET /user/passes — query results");

    const passes = requests.map(({ request, event }) => ({
      id: request.id,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date.toISOString(),
      eventVenue: event.venue,
      status: request.status,
      ticketCode: request.ticketCode,
      name: request.name,
      department: request.department || user.department,
      attendancePossibility: request.attendancePossibility,
      checkedIn: request.checkedIn,
      createdAt: request.createdAt.toISOString(),
    }));

    return res.json(passes);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch user passes");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
