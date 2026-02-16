import { APIError } from "./api-error";

export class PaymentError extends APIError {
    constructor(message: string = "Payment failed", code: string = "PAYMENT_FAILED") {
        super(code, message, 400);
        this.name = "PaymentError";
    }
}

export class InvalidSignatureError extends PaymentError {
    constructor() {
        super("Payment signature verification failed", "PAYMENT_SIGNATURE_INVALID");
        this.name = "InvalidSignatureError";
    }
}
