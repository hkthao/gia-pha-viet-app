// eslint-disable-next-line import/no-named-as-default-member
import i18nextInstance from 'i18next';
import { initReactI18next } from 'react-i18next';
import { AsyncKVS } from '@/services/storageService'; // Import AsyncKVS

// Import translation files
import en from '@/assets/locales/en.json';
import vi from '@/assets/locales/vi.json';

const LANGUAGE_STORAGE_KEY = 'user-language-preference'; // Key for stored language

const resources = {
  en: {
    translation: en,
  },
  vi: {
    translation: vi,
  },
};

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    try {
      const storedLanguage = await AsyncKVS.getItem(LANGUAGE_STORAGE_KEY);
      if (storedLanguage) {
        callback(storedLanguage);
      } else {
        // Default to 'vi' if no language is stored
        callback('vi');
      }
    } catch (error) {
      console.error('Failed to detect language from storage', error);
      callback('vi'); // Fallback to 'vi' on error
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng) => {
    try {
      await AsyncKVS.setItem(LANGUAGE_STORAGE_KEY, lng);
    } catch (error) {
      console.error('Failed to cache user language', error);
    }
  },
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

