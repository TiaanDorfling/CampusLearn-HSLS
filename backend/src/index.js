// backend/src/index.js
import http from "http";
import dotenv from "dotenv";
import app from "./server.js";
import { connectDB } from "../config/db.js";

dotenv.config(); // loads .env

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI;

(async () => {
  try {
    await connectDB(MONGO_URI); // ✅ reuse your working connector

    const server = http.createServer(app);
    server.listen(PORT, HOST, () => {
      console.log(`🚀  Server listening at http://${HOST}:${PORT}`);
    });

    server.on("error", (err) => console.error("HTTP server error:", err));
  } catch (err) {
    console.error("❌ Failed to start server:", err?.message || err);
    process.exit(1);
  }
})();
