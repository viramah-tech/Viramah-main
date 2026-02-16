import { env } from "./environment";

export const paymentConfig = {
    razorpay: {
        keyId: env.RAZORPAY_KEY_ID ?? "",
        keySecret: env.RAZORPAY_KEY_SECRET ?? "",
        webhookSecret: env.RAZORPAY_WEBHOOK_SECRET ?? "",
    },
    isConfigured: Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET),
};
