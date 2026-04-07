import pino from "pino";

let transport: pino.TransportSingleOptions | undefined;

try {
  if (process.env.NODE_ENV !== "production" && !process.env.NETLIFY) {
    require.resolve("pino-pretty");
    transport = {
      target: "pino-pretty",
      options: { colorize: true },
    };
  }
} catch {}

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']",
  ],
  ...(transport ? { transport } : {}),
});
