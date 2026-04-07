import serverless from "serverless-http";
import app from "./app";

const handler_fn = serverless(app, {
  request(req: any) {
    if (req.url && !req.url.startsWith("/api")) {
      req.url = "/api" + req.url;
    }
  },
});

export const handler = async (event: any, context: any) => {
  console.log("[netlify-fn] path:", event.path, "method:", event.httpMethod);
  return handler_fn(event, context);
};
