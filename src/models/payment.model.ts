import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    amount: Number,

    status: {
      type: String,
      enum: [
        "PENDING",
        "PROCESSING",
        "SUCCESS",
        "FAILED"
      ],
      default: "PENDING"
    },

    idempotencyKey: {
      type: String,
      unique: true
    },

    retryCount: {
      type: Number,
      default: 0
    },

    gatewayTransactionId: String
  },
  {
    timestamps: true
  }
);

export const Payment = mongoose.model(
  "Payment",
  paymentSchema
);