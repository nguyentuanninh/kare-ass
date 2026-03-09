import ApiError from '@/helpers/ApiError.js';

export interface ApiResponse<T = any> {
    success: boolean;
    code: number;
    message: string;
    data?: T;
    error?: ApiError;
}

export interface DataTableResponse {
    totalItems: number;
    items: Partial<object[]>;
    totalPages: number;
    currentPage: number;
}

export interface DataTableDaoResponse {
    count: number;
    rows: Partial<object[]>;
}

export interface BulkOperationResponse<T = any> {
    updated: number;
    failed: number;
    details: Array<{
        id: string;
        success: boolean;
        error?: string;
        data?: T;
    }>;
}
