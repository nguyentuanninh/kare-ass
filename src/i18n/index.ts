import { I18n, TranslateOptions } from 'i18n';
import { join } from 'path';

// Configure i18n
const i18n = new I18n();

i18n.configure({
    locales: ['vi'],
    defaultLocale: 'vi',
    directory: join(process.cwd(), 'src/i18n/locales'),
    objectNotation: true,
    updateFiles: false,
    header: 'accept-language',
});

// Export the configured i18n instance
export default i18n;
