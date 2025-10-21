// backend/src/server.js
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";

// Routers
import usersRouter from "../routes/users.js";
import pmRouter from "../routes/pm.js";
import aiRouter from "../routes/ai.js";

const app = express();

/**
 * If you ever serve HTTPS through a reverse proxy (ngrok/Render/Vercel/Nginx),
 * AND you set cookies with { secure: true, sameSite: "none" }, uncomment:
 *
 * app.set("trust proxy", 1);
 */

// ---- Core middleware ----
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const corsOptions = {
  origin: CLIENT_ORIGIN,                  // must NOT be "*"
  credentials: true,                      // allow cookies
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));      // handle preflight explicitly

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// ---- Health / debug ----
app.get("/api/__ping", (_req, res) => {
  res.json({ ok: true, at: "/api/__ping", time: new Date().toISOString() });
});

app.get("/api/__db", (_req, res) => {
  const stateNames = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
  res.json({
    state: mongoose.connection.readyState,
    stateText: stateNames[mongoose.connection.readyState],
    name: mongoose.connection.name,
  });
});

// (Optional) Quick routes inspector while debugging mounts
app.get("/__routes", (req, res) => {
  const out = [];
  function walk(stack, prefix = "") {
    for (const l of stack) {
      if (l.route?.path) {
        out.push(`${Object.keys(l.route.methods).join(",").toUpperCase()} ${prefix}${l.route.path}`);
      } else if (l.name === "router" && l.handle?.stack) {
        // derive base path from regexp best-effort
        const base = l.regexp?.fast_slash ? "/" :
          (l.regexp?.source || "")
            .replace("^\\/", "/")
            .replace("\\/?(?=\\/|$)", "")
            .replace(/\\\//g, "/")
            .replace(/\(\?:\(\[\^\\\/]\+\?\)\)/g, ":param");
        walk(l.handle.stack, base || prefix);
      }
    }
  }
  walk(app._router.stack);
  res.json(out);
});

// ---- Base-mounted routers ----
// Final paths:
//   GET /api/users          (router.get("/"))
//   GET /api/pm             (router.get("/"))
//   POST /api/pm            (router.post("/"))
//   PATCH /api/pm/:id/read  (router.patch("/:id/read"))
//   POST /api/ai/chat       (from aiRouter)
app.use("/api/users", usersRouter);
app.use("/api/pm", pmRouter);
app.use("/api", aiRouter);

// ---- Catch-all 404 (MUST be last) ----
app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.originalUrl });
});

export default app;
