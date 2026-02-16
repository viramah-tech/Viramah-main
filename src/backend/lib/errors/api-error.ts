/**
 * Base API error class.
 * All service/middleware errors should extend this.
 */
export class APIError extends Error {
    constructor(
        public code: string,
        message: string,
        public statusCode: number,
        public details?: Record<string, unknown>
    ) {
        super(message);
        this.name = "APIError";
    }

    toJSON() {
        return {
            error: this.message,
            code: this.code,
            ...(this.details ? { details: this.details } : {}),
        };
    }
}
