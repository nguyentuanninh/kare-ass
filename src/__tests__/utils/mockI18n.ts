import { vi } from 'vitest';
import viTranslations from '@/i18n/locales/vi.json';

// Helper function to get nested value from object
const getNestedValue = (obj: any, path: string): string | undefined =>
    path.split('.').reduce((current, key) => current?.[key], obj);

// Mock i18n methods
const mockI18n = {
    __: (key: string) => {
        const value = getNestedValue(viTranslations, key);
        if (typeof value === 'string') {
            return value;
        }
        // If value is an object or undefined, return the key
        return key;
    },
    __h: vi.fn(),
    __l: vi.fn(),
    __mf: vi.fn(),
    __n: vi.fn(),
    getLocale: () => 'vi',
};

// Mock request object with Express Request type
export const mockRequest = {
    __: mockI18n.__,
    __h: mockI18n.__h,
    __l: mockI18n.__l,
    __mf: mockI18n.__mf,
    __n: mockI18n.__n,
    getLocale: mockI18n.getLocale,
    // Add required Express Request properties
    get: vi.fn(),
    header: vi.fn(),
    accepts: vi.fn(),
    acceptsCharsets: vi.fn(),
    acceptsEncodings: vi.fn(),
    acceptsLanguages: vi.fn(),
    // Add other required properties as needed
} as any;
