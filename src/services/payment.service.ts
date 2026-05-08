import { Payment } from "../models/payment.model";
import { paymentQueue } from "../queues/payment.queue";

export const createPayment = async (
  amount: number,
  idempotencyKey: string
) => {

  const existing = await Payment.findOne({
    idempotencyKey
  });

  if (existing) {
    return existing;
  }

  const payment = await Payment.create({
    amount,
    idempotencyKey
  });

  await paymentQueue.add(
    "process-payment",
    {
      paymentId: payment.id
    }
  );

  return payment;
};