import { env } from "./environment";

export const emailConfig = {
    apiKey: env.SENDGRID_API_KEY ?? "",
    isConfigured: Boolean(env.SENDGRID_API_KEY),
    fromAddress: "noreply@viramah.com",
    fromName: "Viramah",
};
