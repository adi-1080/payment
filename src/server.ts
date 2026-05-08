import "dotenv/config";

import app from "./app";

import { connectDB }
from "./config/db";

await connectDB();

Bun.serve({
  port: Number(process.env.PORT),
  fetch: app.fetch
});

console.log(
  `Server running on ${process.env.PORT}`
);