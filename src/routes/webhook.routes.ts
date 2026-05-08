import { Hono } from "hono";

import { Payment } from "../models/payment.model";

const app = new Hono();

app.post("/", async (c) => {

  const body = await c.req.json();

  const payment =
    await Payment.findById(
      body.paymentId
    );

  if (!payment) {

    return c.json(
      {
        error: "Not found"
      },
      404
    );
  }

  if (
    payment.status === "SUCCESS"
  ) {

    return c.json({
      ignored: true
    });
  }

  payment.status = body.status;

  await payment.save();

  return c.json({
    updated: true
  });
});

export default app;