import { APIError } from "./api-error";

export class AuthError extends APIError {
    constructor(message: string = "Authentication required", code: string = "AUTH_REQUIRED") {
        super(code, message, 401);
        this.name = "AuthError";
    }
}

export class ForbiddenError extends APIError {
    constructor(message: string = "Forbidden", code: string = "AUTH_FORBIDDEN") {
        super(code, message, 403);
        this.name = "ForbiddenError";
    }
}
