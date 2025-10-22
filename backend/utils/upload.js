// backend/utils/upload.js
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute path to "<repo>/backend/uploads/topic-resources"
const UPLOAD_DIR = path.resolve(__dirname, "..", "uploads", "topic-resources");

// Ensure folder exists at startup
function ensureDir(p) {
  try {
    fs.mkdirSync(p, { recursive: true });
  } catch (e) {
    // no-op
  }
}
ensureDir(UPLOAD_DIR);

// Basic, safe filename sanitizer
function sanitizeName(name) {
  return String(name).replace(/[^a-zA-Z0-9._-]+/g, "_");
}

// Optional: limit file types (tweak as needed)
const allowed = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(req, file, cb) {
    // Your route is "/api/topics/:id/resource", so param is "id" (not topicId)
    const topicId = req.params.id || "topic";
    const ts = Date.now();
    const base = sanitizeName(file.originalname || "upload.bin");
    cb(null, `${topicId}-${ts}-${base}`);
  },
});

function fileFilter(req, file, cb) {
  if (allowed.size === 0) return cb(null, true);
  if (allowed.has(file.mimetype)) return cb(null, true);
  return cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
}

const MAX_SIZE_MB = Number(process.env.MAX_UPLOAD_MB || 10);

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
});

export default upload;
