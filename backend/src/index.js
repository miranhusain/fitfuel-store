import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import "./lib/db.js";
import productsRouter from "./routes/products.js";
import analyticsRouter from "./routes/analytics.js";
import { loginHandler, logoutHandler } from "./middleware/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// مهم جدًا للـ Railway
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));

// Routes
app.post("/api/auth/login", loginHandler);
app.post("/api/auth/logout", logoutHandler);
app.use("/api/products", productsRouter);
app.use("/api/analytics", analyticsRouter);

// Health check
app.get("/api/healthz", (_, res) =>
  res.json({ status: "ok", time: new Date().toISOString() })
);

// 🔥 Serve frontend الصحيح
const FRONTEND = path.resolve(__dirname, "../../frontend/dist");

if (fs.existsSync(FRONTEND)) {
  app.use(express.static(FRONTEND));

  app.get("*", (_, res) => {
    res.sendFile(path.join(FRONTEND, "index.html"));
  });

  console.log("[APP] Serving frontend ✅");
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
