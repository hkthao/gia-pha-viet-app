import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useThemeContext } from '@/context/ThemeContext';
import { IStorageService, defaultStorageService } from '@/services/storageService'; // Import storage service
import { TFunction } from 'i18next'; // Import TFunction for i18n instance typing

const LANGUAGE_STORAGE_KEY = 'user-language-preference';

interface UseAppSettingsDeps {
  storageService: IStorageService;
  i18n: {
    language: string;
    changeLanguage: (lng: string) => Promise<TFunction>;
  };
}

const defaultDeps: UseAppSettingsDeps = {
  storageService: defaultStorageService,
  i18n: {
    language: 'vi', // Default language
    changeLanguage: async (lng: string) => { console.warn('i18n.changeLanguage not provided in deps'); return {} as TFunction; }
  }
};

export function useAppSettings(deps: UseAppSettingsDeps = defaultDeps) {
  // Use a temporary variable to hold i10n from defaultDeps and then update it with the actual useTranslation hook.
  // This is a workaround because useTranslation can only be called inside a component.
  // For the actual hook usage in a component, the i10n object from useTranslation will be passed in via deps.
  const { i18n } = useTranslation();
  if (!deps.i18n.changeLanguage || deps.i18n === defaultDeps.i18n) {
    deps.i18n = i18n;
  }
  const { storageService } = deps;

  const { themePreference, setThemePreference } = useThemeContext();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [isLoaded, setIsLoaded] = useState(false);

  // Theme logic
  const isDarkMode = themePreference === 'dark';

  const toggleTheme = useCallback(() => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setThemePreference(newTheme);
  }, [isDarkMode, setThemePreference]);

  // Language logic
  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        const storedLanguage = await storageService.getItem(LANGUAGE_STORAGE_KEY);
        if (storedLanguage && storedLanguage !== i18n.language) {
          await deps.i18n.changeLanguage(storedLanguage);
          setCurrentLanguage(storedLanguage);
        } else {
            // If no stored language, or it's the same as current, ensure currentLanguage state is correct
            setCurrentLanguage(i18n.language);
        }
      } catch (error) {
        console.error('Failed to load language preference from storage service', error);
      } finally {
        setIsLoaded(true);
      }
    };

    // if (deps.i18n.changeLanguage) { // Removed as always true
      loadLanguagePreference();
    // }
  }, [storageService, deps.i18n, i18n.language]);

  const changeLanguage = useCallback(async (lng: string) => {
    try {
      await deps.i18n.changeLanguage(lng);
      await storageService.setItem(LANGUAGE_STORAGE_KEY, lng);
      setCurrentLanguage(lng);
    } catch (error) {
      console.error('Failed to change and save language preference', error);
    }
  }, [storageService, deps.i18n]);

  return {
    state: {
      isDarkMode,
      currentLanguage,
      isLoaded,
    },
    actions: {
      toggleTheme,
      changeLanguage,
    },
  };
}
