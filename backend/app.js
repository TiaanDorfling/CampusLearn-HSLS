import express, { Router } from "express";
import path, { dirname } from "path";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";

import { loadEnv } from "./config/loadEnv.js";
import { connectDB } from "./config/db.js";

loadEnv();

import "./model/UserModel.js";
import "./model/AdminModel.js";
import "./model/TutorModel.js";
import "./model/StudentModel.js";
import "./model/AIChatBot.js";
import "./model/Forum.js";
import "./model/NotificationService.js";
import "./model/privateMessage.js";
import "./model/QuestionModel.js";
import "./model/Resource.js";
import "./model/Response.js";
import "./model/Topic.js";
import "./model/Submission.js";
import "./model/CalendarEvent.js";

await connectDB(process.env.MONGO_URI);

const app = express();
app.set("trust proxy", true);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  fs.mkdirSync(path.join(__dirname, "..", "uploads", "topic-resources"), { recursive: true });
} catch (e) {
  console.warn("Could not ensure uploads folder:", e?.message);
}

if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

const allow =
  (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allow.includes(origin)) return cb(null, true);
      console.warn(`CORS blocked origin: ${origin}`);
      return cb(new Error(`CORS: Origin not allowed: ${origin}`), false);
    },
    credentials: true,
  })
);
app.options("*", cors({ origin: allow, credentials: true }));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

if (process.env.REQUEST_TRACE === "1") {
  app.use((req, _res, next) => {
    console.log("→", req.method, req.originalUrl);
    next();
  });
}

try {
  const rateLimit = (await import("./middleware/rateLimit.js")).default;
  app.use(rateLimit);
} catch {
  console.warn("[warn] rateLimit middleware missing, continuing without it");
}

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/healthz", (_req, res) => {
  try {
    return res.status(200).json({
      ok: true,
      env: process.env.NODE_ENV || "dev",
      time: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (err) {
    console.error("healthz error:", err);
    return res.status(500).json({ ok: false, error: err?.message || "healthz-failed" });
  }
});

async function loadRoute(name) {
  const variations = [
    `./routes/${name}.routes.js`,
    `./routes/${name}.route.js`,
    `./routes/${name}Routes.js`,
    `./routes/${name}Route.js`,
    `./routes/${name}.js`,
  ];
  for (const rel of variations) {
    const fullPath = path.join(__dirname, rel);
    if (fs.existsSync(fullPath)) {
      console.log(`[routes] Loaded: ${rel}`);
      const routeModule = await import(pathToFileURL(fullPath));
      return routeModule.default || routeModule;
    }
  }
  console.warn(`[routes] No route file found for "${name}" (${variations.join(", ")})`);
  return Router();
}

const routeMap = {
  index: "/",
  auth: "/api/auth",
  user: "/api/user",
  users: "/api/users",
  student: "/api/student",
  tutor: "/api/tutor",
  topics: "/api/topics",
  forum: "/api/forum",
  question: "/api/questions",
  messages: "/api/messages",
  pm: "/api/pm",
  admin: "/api/admin",
  calendar: "/api/calendar",
  resources: "/api/resources",
  submissions: "/api/submissions",
  ai: "/api/ai",
  notifications: "/api/notifications",
  health: "/api/health",
};

for (const [name, base] of Object.entries(routeMap)) {
  try {
    const routes = await loadRoute(name);
    if (routes) app.use(base, routes);
  } catch (err) {
    console.error(`[routes] Failed to load "${name}" route:`, err.message);
  }
}

import { notFound, errorHandler } from "./middleware/error.js";
app.use(notFound);
app.use(errorHandler);

export default app;
