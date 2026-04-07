import serverless from "serverless-http";
import app from "./app";
import router from "./routes";

app.use("/", router);

const handler_fn = serverless(app);

export const handler = async (event: any, context: any) => {
  if (!event.requestContext) {
    event.requestContext = { identity: {} };
  }
  if (!event.requestContext.identity) {
    event.requestContext.identity = {};
  }

  console.log("[netlify-fn] path:", event.path, "method:", event.httpMethod);

  try {
    return await handler_fn(event, context);
  } catch (err: any) {
    console.error("[netlify-fn] error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal server error", detail: err.message }),
    };
  }
};
