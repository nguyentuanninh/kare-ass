import { ApiResponse, DataTableDaoResponse, DataTableResponse } from '@/types/api.types.js';
import { useI18n } from '@/middlewares/asyncContext.js';
import ApiError from './ApiError.js';

const returnError = (code: number, message: string) => {
    // Create a temporary error to capture the correct stack trace context
    const tempError = new Error(message);
    Error.captureStackTrace(tempError, returnError);

    const response: ApiResponse = {
        success: false,
        code,
        message,
        error: new ApiError(code, message, true, tempError.stack),
    };
    return response;
};

const returnSuccess = <T = any>(code: number, message: string, data?: T) => {
    const response: ApiResponse<T> = {
        success: true,
        code,
        message,
        data,
    };
    return response;
};

const returnPagination = (rows: DataTableDaoResponse, page: number, limit: number) => {
    const i18n = useI18n();
    const { count: totalItems, rows: items } = rows;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);

    const paginationData: DataTableResponse = {
        totalItems,
        items,
        totalPages,
        currentPage,
    };

    const response: ApiResponse<DataTableResponse> = {
        success: true,
        code: 200,
        message: i18n.__('common.success.retrieved'),
        data: paginationData,
    };
    return response;
};

export default {
    returnError,
    returnSuccess,
    returnPagination,
};
