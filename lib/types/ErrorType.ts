
/**
 * Custom error types for specific error scenarios.
 * Each error class extends the built-in Error class and sets a specific name.
 * This allows for more granular error handling in the application.
 */
export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NotFoundError";
    }
}

export class BadRequestError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "BadRequestError";
    }
}
export class AlreadyExistError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AlreadyExistError";
    }   
}

export class ConflictError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ConflictError";
    }
}