import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

async function main() {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`[server] Flowmetrics API listening on port ${env.port}`);
  });
}

main().catch((err) => {
  console.error("[server] Fatal startup error:", err);
  process.exit(1);
});
