import { APIError } from "./api-error";

export class BookingError extends APIError {
    constructor(message: string = "Booking failed", code: string = "BOOKING_FAILED") {
        super(code, message, 400);
        this.name = "BookingError";
    }
}

export class RoomUnavailableError extends BookingError {
    constructor(roomId: string) {
        super(`Room ${roomId} is not available`, "ROOM_UNAVAILABLE");
        this.name = "RoomUnavailableError";
    }
}
