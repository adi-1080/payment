import "dotenv/config";

import { Worker } from "bullmq";

import { redis } from "../config/redis";

import { Payment } from "../models/payment.model";

import { simulateGateway } from "../services/gateway.service";

import { connectDB } from "../config/db";

await connectDB();

const worker = new Worker(
  "payment-processing",

  async (job) => {

    const { paymentId } = job.data;

    const payment = await Payment.findOneAndUpdate(
      {
        _id: paymentId,
        status: "PENDING"
      },
      {
        status: "PROCESSING"
      },
      {
        // new: true
        returnDocument: "after"
      }
    );

    if (!payment) return;

    try {

      const result =
        await simulateGateway();

      if (result.success) {

        payment.status = "SUCCESS";

        payment.gatewayTransactionId =
          result.transactionId;

        await payment.save();

        return;
      }

      payment.status = "FAILED";

      await payment.save();

    } catch (error) {

      payment.retryCount += 1;

      if (payment.retryCount < 3) {

        payment.status = "PENDING";

        await payment.save();

        throw error;
      }

      payment.status = "FAILED";

      await payment.save();
    }
  },

  {
    connection: redis,

    concurrency: 5
  }
);

worker.on("failed", (job) => {
  console.log("Job failed", job?.id);
});