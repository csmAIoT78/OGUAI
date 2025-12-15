export const StorageService = {
  save: (key: string, data: any) => {
    try {
      localStorage.setItem(`ogu_${key}`, JSON.stringify(data));
    } catch (e) {
      console.error("Storage save failed", e);
    }
  },
  load: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(`ogu_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },
  clear: (key: string) => {
    localStorage.removeItem(`ogu_${key}`);
  }
};