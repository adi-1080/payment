import { Hono } from "hono";

import { z } from "zod";

import { createPayment } from "../services/payment.service";

const app = new Hono();

const schema = z.object({
  amount: z.number().positive()
});

app.post("/", async (c) => {

  const body =
    await c.req.json();

  const parsed =
    schema.parse(body);

  const idempotencyKey =
    c.req.header("Idempotency-Key");

  if (!idempotencyKey) {

    return c.json(
      {
        error:
          "Idempotency-Key required"
      },
      400
    );
  }

  const payment =
    await createPayment(
      parsed.amount,
      idempotencyKey
    );

  return c.json(payment);
});

export default app;