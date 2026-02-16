import { env } from "./environment";

export const securityConfig = {
    jwtSecret: env.JWT_SECRET ?? "",
    encryptionKey: env.ENCRYPTION_KEY ?? "",
    otpExpiry: 300, // 5 minutes in seconds
    sessionExpiry: 3600, // 1 hour in seconds
    refreshTokenExpiry: 604800, // 7 days in seconds
    rateLimits: {
        anonymous: 100, // requests per minute
        authenticated: 1000, // requests per minute
    },
};
