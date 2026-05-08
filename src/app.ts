import { Hono } from "hono";

import paymentRoutes
from "./routes/payment.routes";

import webhookRoutes
from "./routes/webhook.routes";

const app = new Hono();

app.route("/payments", paymentRoutes);

app.route("/webhook", webhookRoutes);

export default app;