export default class ApiError extends Error {
    code: number;

    isOperational: boolean;

    constructor(code: number, message: string | undefined, isOperational = true, stack = '') {
        super(message);
        this.code = code;
        this.isOperational = isOperational;

        if (stack !== '') {
            this.stack = stack;
        } else Error.captureStackTrace(this, this.constructor);
    }
}
