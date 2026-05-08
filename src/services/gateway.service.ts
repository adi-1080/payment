import { nanoid } from "nanoid";

export const simulateGateway = async () => {

  await Bun.sleep(
    Math.random() * 3000
  );

  const random = Math.random();

  if (random < 0.6) {
    return {
      success: true,
      transactionId: nanoid()
    };
  }

  if (random < 0.8) {
    return {
      success: false
    };
  }

  throw new Error("Gateway Timeout");
};