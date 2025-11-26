// backend/src/app.js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";

const app = express();

/* ----------------------------
   CORS CONFIGURATION
   Allows:
   - Your production frontend (env)
   - Localhost 3000
   - ANY Vercel preview deployment (*.vercel.app)
----------------------------- */

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser clients

    const allowed = [
      process.env.FRONTEND_URL,      // e.g. https://fullstack-admin-panel-demo.vercel.app
      "http://localhost:3000",
    ];

    const isVercelPreview = origin.endsWith(".vercel.app");

    if (allowed.includes(origin) || isVercelPreview) {
      callback(null, true);
    } else {
      console.log("❌ CORS blocked:", origin);
      callback(new Error("CORS blocked: " + origin), false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false, // keep false unless using cookies
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle preflight

/* ----------------------------
   Middleware
----------------------------- */

app.use(express.json());

/* ----------------------------
   Routes
----------------------------- */

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);

/* ----------------------------
   Health check route
----------------------------- */

app.get("/", (req, res) => {
  res.json({ status: "Backend running", version: "1.0.0" });
});

/* ----------------------------
   Global Error Handler
----------------------------- */

app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);
  res.status(500).json({ error: "SERVER_ERROR", message: err.message });
});

export default app;
