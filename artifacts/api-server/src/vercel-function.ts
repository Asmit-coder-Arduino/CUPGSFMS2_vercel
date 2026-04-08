import type { IncomingMessage, ServerResponse } from "node:http";
import app from "./app";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req as any, res as any, () => {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Not found" }));
  });
}
