import { env } from "./environment";

export const smsConfig = {
    accountSid: env.TWILIO_ACCOUNT_SID ?? "",
    authToken: env.TWILIO_AUTH_TOKEN ?? "",
    phoneNumber: env.TWILIO_PHONE_NUMBER ?? "",
    isConfigured: Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN),
};
