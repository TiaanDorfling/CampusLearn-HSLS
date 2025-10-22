// backend/utils/upload.js
import multer from "multer";
import path from "path";

const UPLOAD_DESTINATION = "uploads/topic-resources/";

// Disk storage
const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    // Ensure this folder exists at startup
    cb(null, UPLOAD_DESTINATION);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    // Our route is /api/topics/:id/resource → param name is "id"
    const topicIdentifier = req.params?.id || "unknown";
    cb(null, `${topicIdentifier}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export default upload;
