// backend/middleware/rateLimit.js
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQS = 120;        // per IP per minute

const bucket = new Map();

export default function rateLimit(req, res, next) {
  if (req.method === "OPTIONS") return next();

  const ip = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress || "unknown";
  const now = Date.now();
  let entry = bucket.get(ip);
  if (!entry || now - entry.start >= WINDOW_MS) {
    entry = { start: now, count: 0 };
    bucket.set(ip, entry);
  }
  entry.count += 1;

  if (entry.count > MAX_REQS) {
    return res.status(429).json({ error: "Too many requests, slow down." });
  }
  return next();
}
