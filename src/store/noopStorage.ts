interface NoopStorage {
  getItem(key: string): Promise<string | number | object | null>;
  setItem(key: string, value: string | number | object): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export const noopStorage: NoopStorage = {
  getItem() {
    return Promise.resolve(null);  // null or other types based on the storage content
  },
  setItem(_key: string, value: string | number | object) {
    return new Promise((resolve) => {
      // Simulate some async operation, then resolve the promise
      resolve();
    });
  },
  removeItem() {
    return new Promise((resolve) => {
      // Simulate removal of an item, then resolve the promise
      resolve();
    });
  }
};
