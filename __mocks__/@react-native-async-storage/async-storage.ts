// __mocks__/@react-native-async-storage/async-storage.ts

const asyncStorageMock: { [key: string]: string } = {};

export default {
  setItem: jest.fn((key, value) => {
    return new Promise((resolve, reject) => {
      asyncStorageMock[key] = value;
      resolve(null);
    });
  }),
  getItem: jest.fn((key) => {
    return new Promise((resolve, reject) => {
      resolve(asyncStorageMock[key] || null);
    });
  }),
  removeItem: jest.fn((key) => {
    return new Promise((resolve, reject) => {
      delete asyncStorageMock[key];
      resolve(null);
    });
  }),
  clear: jest.fn(() => {
    return new Promise((resolve, reject) => {
      for (const key in asyncStorageMock) {
        delete asyncStorageMock[key];
      }
      resolve(null);
    });
  }),
  getAllKeys: jest.fn(() => {
    return new Promise((resolve, reject) => {
      resolve(Object.keys(asyncStorageMock));
    });
  }),
};
