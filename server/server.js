import app from "./app.js";
import { assertEnv, env } from "./config/env.js";

assertEnv();

app.listen(env.port, () => {
  console.log(`Admin API running on http://localhost:${env.port}`);
});
