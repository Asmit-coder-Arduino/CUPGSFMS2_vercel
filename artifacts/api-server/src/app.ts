import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// ── Trust proxy (Replit runs behind a reverse proxy) ─────────────────────────
app.set("trust proxy", 1);

// ── Security headers (Helmet) ────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["*"];

app.use(
  cors({
    origin: allowedOrigins.includes("*") ? "*" : (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) cb(null, true);
      else cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: !allowedOrigins.includes("*"),
  })
);

// ── Body size limits ─────────────────────────────────────────────────────────
app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ extended: true, limit: "64kb" }));

// ── Logging ──────────────────────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  })
);

// ── Global rate limiter — 100 req / 15 min per IP ────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again after 15 minutes." },
});

// ── Strict limiter for auth endpoints — 10 req / 15 min ──────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again after 15 minutes." },
});

// ── Feedback submission limiter — 20 submissions / 10 min ────────────────────
const feedbackLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many feedback submissions. Please wait a few minutes and try again." },
});

app.use("/api", globalLimiter);
app.use("/api/auth", authLimiter);
app.use("/api/feedback", feedbackLimiter);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", router);

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err, "Unhandled error");
  const status = (err as { status?: number }).status ?? 500;
  res.status(status).json({ error: status === 500 ? "Internal server error" : err.message });
});

export default app;
