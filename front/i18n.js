import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const en = require('./src/locales/en.json');
const ko = require('./src/locales/ko.json');

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            ko: { translation: ko },
        },
        lng: 'ko',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
