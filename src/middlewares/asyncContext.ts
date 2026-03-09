import { Request, Response, NextFunction } from 'express';
import { AsyncLocalStorage } from 'async_hooks';
import { I18n } from 'i18n';

// Create async local storage instance
export const asyncLocalStorage = new AsyncLocalStorage<Request>();

// Store request in async context
const runInContext = (req: Request, fn: () => Promise<any>) => asyncLocalStorage.run(req, fn);

export const asyncContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
    runInContext(req, async () => {
        next();
    });
};

interface I18nRequest
    extends Omit<
        I18n,
        | 'setLocale'
        | 'configure'
        | 'getLocales'
        | 'addLocale'
        | 'removeLocale'
        | 'init'
        | 'getCatalog'
        | 'overrideLocaleFromQuery'
        | 'version'
    > {}

/**
 * Hook to access i18n translation functions within the request context.
 * @returns {I18nRequest} Object containing translation functions
 * @throws {Error} If called outside of a request context
 */
export const useI18n = (): I18nRequest => {
    const req = asyncLocalStorage.getStore();
    if (!req) {
        throw new Error('No request context found. Make sure to use runInContext');
    }
    return {
        /** Translates a given string based on current locale */
        __: req.__.bind(req),
        /** Translates and returns HTML content, safely escaping values */
        __h: req.__h.bind(req),
        /** Translates and returns an array of strings */
        __l: req.__l.bind(req),
        /** Translates using ICU MessageFormat patterns */
        __mf: req.__mf.bind(req),
        /** Translates and formats numbers based on locale */
        __n: req.__n.bind(req),
        /** Gets the current locale */
        getLocale: req.getLocale.bind(req),
    };
};
