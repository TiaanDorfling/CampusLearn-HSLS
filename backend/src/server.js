import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";

// Routers
import usersRouter   from "../routes/users.js";
import pmRouter      from "../routes/pm.js";
import aiRouter      from "../routes/ai.js";
import studentRouter from "../routes/studentRoutes.js";  // correct import

const app = express();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const corsOptions = {
  origin: CLIENT_ORIGIN,
  credentials: true,
  methods: ["GET","POST","PATCH","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","X-Requested-With"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/__ping", (_req, res) => {
  res.json({ ok: true, at: "/api/__ping", time: new Date().toISOString() });
});

app.get("/api/__db", (_req, res) => {
  const stateNames = {0:"disconnected",1:"connected",2:"connecting",3:"disconnecting"};
  res.json({
    state: mongoose.connection.readyState,
    stateText: stateNames[mongoose.connection.readyState],
    name: mongoose.connection.name,
  });
});

app.use("/api/users",   usersRouter);
app.use("/api/pm",      pmRouter);
app.use("/api",         aiRouter);
app.use("/api/students", studentRouter); 


app.use((req, res) => {
  res.status(404).json({ error:"Not found", path:req.originalUrl });
});

export default app;
