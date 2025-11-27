// backend/src/app.js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";

const app = express();

/**
 * Read FRONTEND_URL from env.
 * You may set:
 *  - a specific URL: https://my-frontend.vercel.app
 *  - or the special wildcard token: https://*.vercel.app
 *  - or leave empty/null (we'll still allow .vercel.app and localhost)
 */
const FRONTEND_URL = process.env.FRONTEND_URL || "";

function isVercelPreviewOrigin(origin) {
  try {
    if (!origin) return false;
    const host = new URL(origin).host; // e.g. fullstack-admin-....vercel.app
    return host.endsWith(".vercel.app");
  } catch (e) {
    return false;
  }
}

const corsOptions = {
  origin: (origin, callback) => {
    // allow server-to-server or tools with no origin
    if (!origin) return callback(null, true);

    // 1) exact match with FRONTEND_URL (if set to a real URL)
    if (FRONTEND_URL && FRONTEND_URL !== "https://*.vercel.app") {
      if (origin === FRONTEND_URL) return callback(null, true);
    }

    // 2) if FRONTEND_URL is the special wildcard token, accept any vercel.app origin
    if (FRONTEND_URL === "https://*.vercel.app" && isVercelPreviewOrigin(origin)) {
      return callback(null, true);
    }

    // 3) always allow local development
    if (origin === "http://localhost:3000" || origin === "http://127.0.0.1:3000") {
      return callback(null, true);
    }

    // 4) also accept any vercel preview by default (optional fallback)
    //    -> keep this if you want previews to work without setting env
    if (isVercelPreviewOrigin(origin)) {
      return callback(null, true);
    }

    console.warn("CORS blocked:", origin);
    return callback(new Error("CORS blocked: " + origin), false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
  credentials: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);

app.get("/", (req, res) => {
  res.json({ status: "Backend running" });
});

app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);
  res.status(500).json({ error: "SERVER_ERROR", message: err.message });
});

export default app;
