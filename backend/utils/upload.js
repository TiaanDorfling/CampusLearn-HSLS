import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DESTINATION = 'uploads/topic-resources/';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Configure disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    ensureDir(UPLOAD_DESTINATION);
    cb(null, UPLOAD_DESTINATION);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    // Your route uses "/:id/resource"
    const topicIdentifier = req.params.id || 'unknown';
    cb(null, `${topicIdentifier}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 } // 5MB
});

export default upload;
