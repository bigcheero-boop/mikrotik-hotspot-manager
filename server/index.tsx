import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-4f18e215/health", (c) => {
  return c.json({ status: "ok" });
});

// ===== AUTHENTICATION =====
app.post("/make-server-4f18e215/auth/login", async (c) => {
  try {
    const { username, password } = await c.req.json();
    const adminUser = Deno.env.get("ADMIN_USERNAME") || "admin";
    const adminPass = Deno.env.get("ADMIN_PASSWORD") || "admin123";

    if (username === adminUser && password === adminPass) {
      const token = crypto.randomUUID();
      await kv.set(`session:${token}`, {
        username,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Log the auth event
      await kv.set(`log:${Date.now()}`, {
        timestamp: new Date().toISOString(),
        type: 'auth',
        message: `Admin login successful`,
        username,
      });

      return c.json({ success: true, token, username });
    }

    return c.json({ success: false, error: "Invalid username or password" }, 401);
  } catch (error) {
    console.log("Error during login:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get("/make-server-4f18e215/auth/verify", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ success: false, error: "No token" }, 401);
    }
    const token = authHeader.slice(7);
    const session = await kv.get(`session:${token}`);
    if (!session || new Date(session.expiresAt) < new Date()) {
      return c.json({ success: false, error: "Session expired" }, 401);
    }
    return c.json({ success: true, username: session.username });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-4f18e215/auth/logout", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      await kv.del(`session:${authHeader.slice(7)}`);
    }
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== ROUTER MANAGEMENT =====

app.get("/make-server-4f18e215/routers", async (c) => {
  try {
    const routers = await kv.getByPrefix("router:");
    return c.json({ success: true, data: routers });
  } catch (error) {
    console.log("Error fetching routers:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-4f18e215/routers", async (c) => {
  try {
    const router = await c.req.json();
    const routerId = `router:${Date.now()}`;
    await kv.set(routerId, {
      ...router,
      id: routerId,
      createdAt: new Date().toISOString(),
      status: 'offline',
    });
    return c.json({ success: true, id: routerId });
  } catch (error) {
    console.log("Error adding router:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-4f18e215/routers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ success: false, error: "Router not found" }, 404);
    }
    await kv.set(id, { ...existing, ...updates });
    return c.json({ success: true });
  } catch (error) {
    console.log("Error updating router:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-4f18e215/routers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting router:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== USER MANAGEMENT =====

app.get("/make-server-4f18e215/users", async (c) => {
  try {
    const users = await kv.getByPrefix("user:");
    return c.json({ success: true, data: users });
  } catch (error) {
    console.log("Error fetching users:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-4f18e215/users", async (c) => {
  try {
    const user = await c.req.json();
    const userId = `user:${Date.now()}`;
    await kv.set(userId, {
      ...user,
      id: userId,
      createdAt: new Date().toISOString(),
      active: true,
    });
    return c.json({ success: true, id: userId });
  } catch (error) {
    console.log("Error creating user:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-4f18e215/users/bulk", async (c) => {
  try {
    const { users } = await c.req.json();
    const ids = [];
    for (const user of users) {
      const userId = `user:${Date.now()}-${Math.random()}`;
      await kv.set(userId, {
        ...user,
        id: userId,
        createdAt: new Date().toISOString(),
        active: true,
      });
      ids.push(userId);
    }
    return c.json({ success: true, ids });
  } catch (error) {
    console.log("Error creating bulk users:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-4f18e215/users/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ success: false, error: "User not found" }, 404);
    }
    await kv.set(id, { ...existing, ...updates });
    return c.json({ success: true });
  } catch (error) {
    console.log("Error updating user:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-4f18e215/users/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting user:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== VOUCHER MANAGEMENT =====

app.get("/make-server-4f18e215/vouchers", async (c) => {
  try {
    const vouchers = await kv.getByPrefix("voucher:");
    return c.json({ success: true, data: vouchers });
  } catch (error) {
    console.log("Error fetching vouchers:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-4f18e215/vouchers/generate", async (c) => {
  try {
    const { count, template } = await c.req.json();
    const vouchers = [];

    for (let i = 0; i < count; i++) {
      let code: string;
      let voucherId: string;
      let attempts = 0;
      do {
        code = generateVoucherCode();
        voucherId = `voucher:${code}`;
        const existing = await kv.get(voucherId);
        if (!existing) break;
        attempts++;
      } while (attempts < 10);

      const voucher = {
        id: voucherId,
        code,
        ...template,
        used: false,
        createdAt: new Date().toISOString(),
      };
      await kv.set(voucherId, voucher);
      vouchers.push(voucher);
    }

    return c.json({ success: true, vouchers });
  } catch (error) {
    console.log("Error generating vouchers:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

function generateVoucherCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

app.delete("/make-server-4f18e215/vouchers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting voucher:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== HOTSPOT ACTIVE USERS =====

app.get("/make-server-4f18e215/hotspot/active-users", async (c) => {
  try {
    const activeUsers = await kv.getByPrefix("hotspot-session:");
    return c.json({ success: true, data: activeUsers });
  } catch (error) {
    console.log("Error fetching active users:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== SESSION SETTINGS =====

app.get("/make-server-4f18e215/session-settings", async (c) => {
  try {
    const settings = await kv.get("config:session-settings");
    return c.json({ success: true, data: settings || {} });
  } catch (error) {
    console.log("Error fetching session settings:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-4f18e215/session-settings", async (c) => {
  try {
    const settings = await c.req.json();
    await kv.set("config:session-settings", settings);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error saving session settings:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== TEMPLATE =====

app.get("/make-server-4f18e215/template", async (c) => {
  try {
    const template = await kv.get("config:login-template");
    return c.json({ success: true, data: template || null });
  } catch (error) {
    console.log("Error fetching template:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-4f18e215/template", async (c) => {
  try {
    const { html } = await c.req.json();
    await kv.set("config:login-template", { html, updatedAt: new Date().toISOString() });
    return c.json({ success: true });
  } catch (error) {
    console.log("Error saving template:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== REPORTS & LOGS =====

app.get("/make-server-4f18e215/reports/logs", async (c) => {
  try {
    const logs = await kv.getByPrefix("log:");
    const sorted = logs.sort((a: any, b: any) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return c.json({ success: true, data: sorted });
  } catch (error) {
    console.log("Error fetching logs:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get("/make-server-4f18e215/reports/traffic", async (c) => {
  try {
    const trafficData = await kv.getByPrefix("traffic:");
    return c.json({ success: true, data: trafficData });
  } catch (error) {
    console.log("Error fetching traffic data:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== ANALYTICS =====

app.get("/make-server-4f18e215/analytics/dashboard", async (c) => {
  try {
    const routers = await kv.getByPrefix("router:");
    const users = await kv.getByPrefix("user:");
    const vouchers = await kv.getByPrefix("voucher:");

    const activeRouters = routers.filter((r: any) => r.status === 'online').length;
    const activeUsers = users.filter((u: any) => u.active).length;
    const usedVouchers = vouchers.filter((v: any) => v.used).length;

    return c.json({
      success: true,
      data: {
        totalRouters: routers.length,
        activeRouters,
        totalUsers: users.length,
        activeUsers,
        totalVouchers: vouchers.length,
        usedVouchers,
        unusedVouchers: vouchers.length - usedVouchers,
      },
    });
  } catch (error) {
    console.log("Error fetching analytics:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get("/make-server-4f18e215/analytics/traffic", async (c) => {
  try {
    const trafficData = await kv.getByPrefix("traffic:");
    const data = Object.values(trafficData).map((item: any) => ({
      ...item,
    }));
    return c.json({ success: true, data });
  } catch (error) {
    console.log("Error fetching traffic data:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);
