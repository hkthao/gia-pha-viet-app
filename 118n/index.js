import * as Localization from 'expo-localization';
import i18nextInstance from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import en from '@/assets/locales/en.json';
import vi from '@/assets/locales/vi.json';

const resources = {
  en: {
    translation: en,
  },
  vi: {
    translation: vi,
  },
};

// eslint-disable-next-line import/no-named-as-default-member
const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    const preferredLanguage = Localization.locale.split('-')[0]; // e.g., "en-US" -> "en"
    const supportedLanguages = Object.keys(resources);
    const finalLanguage = supportedLanguages.includes(preferredLanguage) ? preferredLanguage : 'vi'; // Default to 'vi' if preferred is not supported

    callback(finalLanguage);
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

i18nextInstance
  .use(languageDetector) // Use custom language detector
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    fallbackLng: 'en', // Fallback language if not found (after custom detection)
    resources,
    debug: true, // Enable debug mode to see console logs for missing keys
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    react: {
      useSuspense: false,
    },
  });

export default i18nextInstance;
