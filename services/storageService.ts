import AsyncStorage from '@react-native-async-storage/async-storage';

export interface IStorageService {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export const AsyncKVS: IStorageService = {
  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.error(`Error getting item ${key} from AsyncStorage:`, e);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error(`Error setting item ${key} to AsyncStorage:`, e);
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing item ${key} from AsyncStorage:`, e);
    }
  },
};

// Default dependencies for the hook
export const defaultStorageService: IStorageService = AsyncKVS;
