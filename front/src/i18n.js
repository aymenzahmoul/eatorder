import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import TranslationFR from './locales/fr/TranslationFR';
import TranslationES from './locales/es/TranslationES';
import TranslationIT from './locales/it/TranslationIT';
const savedLanguage = localStorage.getItem('i18nextLng');
if (!i18n.isInitialized) {
    i18n
        .use(LanguageDetector)
        .init({
            resources: {
                fr: {
                    translation: TranslationFR,
                },
                es: {
                    translation: TranslationES,
                },
                it: {
                  translation: TranslationIT,
              },
            },
            fallbackLng: 'en',
            lng: savedLanguage,
            missingKeyHandler: false,
            debug: false,
            interpolation: {
                escapeValue: false,
            },
        });
    document.documentElement.lang = savedLanguage;
    document.documentElement.setAttribute('translate', 'no');
}
export default i18n