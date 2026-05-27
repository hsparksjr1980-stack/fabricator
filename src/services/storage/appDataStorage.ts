import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'fabricator:demo-data';

export const appDataStorage = {
  async save(data: any) {
    try {
      await AsyncStorage.setItem(
        KEY,
        JSON.stringify(data)
      );
    } catch (error) {
      console.log('Failed to save app data', error);
    }
  },

  async load() {
    try {
      const raw = await AsyncStorage.getItem(KEY);

      if (!raw) {
        return null;
      }

      return JSON.parse(raw);
    } catch (error) {
      console.log('Failed to load app data', error);

      await AsyncStorage.removeItem(KEY);

      return null;
    }
  },

  async clear() {
    try {
      await AsyncStorage.removeItem(KEY);
    } catch (error) {
      console.log('Failed to clear app data', error);
    }
  },
};