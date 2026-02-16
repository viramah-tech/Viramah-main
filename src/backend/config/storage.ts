import { env } from "./environment";

export const storageConfig = {
    bucket: env.S3_BUCKET ?? "",
    region: env.S3_REGION ?? "ap-south-1",
    accessKey: env.S3_ACCESS_KEY ?? "",
    secretKey: env.S3_SECRET_KEY ?? "",
    isConfigured: Boolean(env.S3_BUCKET && env.S3_ACCESS_KEY),
};
