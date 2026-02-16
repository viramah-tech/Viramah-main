import { describe, it, expect } from "vitest";
import { APIError } from "@/backend/lib/errors/api-error";
import { AuthError, ForbiddenError } from "@/backend/lib/errors/auth-error";
import { BookingError, RoomUnavailableError } from "@/backend/lib/errors/booking-error";
import { PaymentError, InvalidSignatureError } from "@/backend/lib/errors/payment-error";

describe("Error Classes", () => {
    describe("APIError", () => {
        it("creates error with all fields", () => {
            const error = new APIError("TEST_CODE", "Test message", 400, { field: "val" });
            expect(error.code).toBe("TEST_CODE");
            expect(error.message).toBe("Test message");
            expect(error.statusCode).toBe(400);
            expect(error.details).toEqual({ field: "val" });
        });

        it("toJSON() returns serializable object", () => {
            const error = new APIError("ERR", "msg", 500);
            const json = error.toJSON();
            expect(json).toEqual({ error: "msg", code: "ERR" });
        });

        it("toJSON() includes details when present", () => {
            const error = new APIError("ERR", "msg", 500, { key: "val" });
            const json = error.toJSON();
            expect(json.details).toEqual({ key: "val" });
        });
    });

    describe("AuthError", () => {
        it("defaults to 401 status code", () => {
            const error = new AuthError();
            expect(error.statusCode).toBe(401);
            expect(error.code).toBe("AUTH_REQUIRED");
        });

        it("accepts custom message and code", () => {
            const error = new AuthError("Token expired", "AUTH_EXPIRED_TOKEN");
            expect(error.message).toBe("Token expired");
            expect(error.code).toBe("AUTH_EXPIRED_TOKEN");
        });
    });

    describe("ForbiddenError", () => {
        it("defaults to 403 status code", () => {
            const error = new ForbiddenError();
            expect(error.statusCode).toBe(403);
            expect(error.code).toBe("AUTH_FORBIDDEN");
        });
    });

    describe("BookingError", () => {
        it("defaults to 400 status code", () => {
            const error = new BookingError();
            expect(error.statusCode).toBe(400);
        });
    });

    describe("RoomUnavailableError", () => {
        it("includes room ID in message", () => {
            const error = new RoomUnavailableError("room-123");
            expect(error.message).toContain("room-123");
            expect(error.code).toBe("ROOM_UNAVAILABLE");
        });
    });

    describe("PaymentError", () => {
        it("defaults to 400 status code", () => {
            const error = new PaymentError();
            expect(error.statusCode).toBe(400);
            expect(error.code).toBe("PAYMENT_FAILED");
        });
    });

    describe("InvalidSignatureError", () => {
        it("has correct code and message", () => {
            const error = new InvalidSignatureError();
            expect(error.code).toBe("PAYMENT_SIGNATURE_INVALID");
            expect(error.statusCode).toBe(400);
        });
    });

    describe("Error inheritance", () => {
        it("all errors are instances of APIError", () => {
            expect(new AuthError()).toBeInstanceOf(APIError);
            expect(new ForbiddenError()).toBeInstanceOf(APIError);
            expect(new BookingError()).toBeInstanceOf(APIError);
            expect(new RoomUnavailableError("x")).toBeInstanceOf(APIError);
            expect(new PaymentError()).toBeInstanceOf(APIError);
            expect(new InvalidSignatureError()).toBeInstanceOf(APIError);
        });

        it("all errors are instances of Error", () => {
            expect(new AuthError()).toBeInstanceOf(Error);
            expect(new BookingError()).toBeInstanceOf(Error);
            expect(new PaymentError()).toBeInstanceOf(Error);
        });
    });
});
