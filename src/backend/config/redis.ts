import { env } from "./environment";

export const redisConfig = {
    url: env.REDIS_URL ?? "",
    isConfigured: Boolean(env.REDIS_URL),
    keyPrefix: "viramah:",
    holdTtl: 900, // 15 minutes for room holds
};
