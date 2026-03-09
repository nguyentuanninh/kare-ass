import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

const ATTRIBUTE_NAME = 'id';

export default function createRequestId({ headerName = 'X-Request-Id', setHeader = true } = {}) {
    return (request: Request, response: Response, next: NextFunction) => {
        const oldValue = request.get(headerName);
        const id = oldValue === undefined ? uuidv4() : oldValue;

        if (setHeader) {
            response.set(headerName, id);
        }

        request[ATTRIBUTE_NAME] = id;

        next();
    };
}
