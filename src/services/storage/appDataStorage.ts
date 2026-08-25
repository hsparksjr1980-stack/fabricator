import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'fabricator:demo-data';

type LoadResult =
  | { data: any; error: null; recoveredCorruptData?: false }
  | { data: null; error: string; recoveredCorruptData?: boolean };

function messageFromError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Local device storage was unavailable.';
}

export const appDataStorage = {
  async save(data: any) {
    try {
      await AsyncStorage.setItem(
        KEY,
        JSON.stringify(data)
      );

      return {
        ok: true,
        error: null,
      };
    } catch (error) {
      return {
        ok: false,
        error: messageFromError(error),
      };
    }
  },

  async load(): Promise<LoadResult> {
    try {
      const raw = await AsyncStorage.getItem(KEY);

      if (!raw) {
        return {
          data: null,
          error: null,
        };
      }

      return {
        data: JSON.parse(raw),
        error: null,
      };
    } catch (error) {
      try {
        await AsyncStorage.removeItem(KEY);
      } catch {
        // Keep the original load/parse error as the user-facing issue.
      }

      return {
        data: null,
        error: messageFromError(error),
        recoveredCorruptData: true,
      };
    }
  },

  async clear() {
    try {
      await AsyncStorage.removeItem(KEY);

      return {
        ok: true,
        error: null,
      };
    } catch (error) {
      return {
        ok: false,
        error: messageFromError(error),
      };
    }
  },
};
