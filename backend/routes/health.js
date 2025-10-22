import express from "express";

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({
    ok: true,
    status: "operational",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mirror of index router helper so /api/health/env-keys works
router.get("/env-keys", (_req, res) => {
  const keys = ["MONGO_URI", "PORT", "JWT_SECRET", "CLIENT_ORIGIN"];
  const present = keys.filter((k) => process.env[k] !== undefined);
  res.json({ envKeys: present });
});

export default router;
