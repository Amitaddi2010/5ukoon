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

export default router;
