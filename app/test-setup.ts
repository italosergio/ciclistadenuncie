import "@testing-library/jest-dom/vitest";

// Mock do Firebase App
vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({ name: "mock-app" })),
}));

// Mock do Firebase Database
vi.mock("firebase/database", () => ({
  ref: vi.fn((_db, path) => ({ db: _db, path })),
  set: vi.fn(() => Promise.resolve()),
  get: vi.fn(() => Promise.resolve({ exists: () => false, val: () => null, forEach: vi.fn() })),
  push: vi.fn(() => Promise.resolve({ key: "mock-key-123" })),
  remove: vi.fn(() => Promise.resolve()),
  onValue: vi.fn((_ref, callback) => {
    callback({ val: () => null, exists: () => false, forEach: vi.fn() });
    return vi.fn();
  }),
  update: vi.fn(() => Promise.resolve()),
  getDatabase: vi.fn(() => ({ type: "mock-database" })),
}));

// Mock do Firebase Auth
vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({
    currentUser: null,
    signOut: vi.fn(() => Promise.resolve()),
  })),
  onAuthStateChanged: vi.fn((_auth, callback) => {
    callback(null);
    return vi.fn();
  }),
  createUserWithEmailAndPassword: vi.fn(() =>
    Promise.resolve({ user: { uid: "mock-uid-123" } })
  ),
  signInWithEmailAndPassword: vi.fn(() =>
    Promise.resolve({
      user: { uid: "mock-uid-123", getIdToken: () => Promise.resolve("mock-token") },
    })
  ),
  signOut: vi.fn(() => Promise.resolve()),
  updatePassword: vi.fn(() => Promise.resolve()),
  EmailAuthProvider: {
    credential: vi.fn((email, password) => ({ email, password })),
  },
  reauthenticateWithCredential: vi.fn(() => Promise.resolve()),
  sendPasswordResetEmail: vi.fn(() => Promise.resolve()),
  fetchSignInMethodsForEmail: vi.fn(() => Promise.resolve([])),
  verifyBeforeUpdateEmail: vi.fn(() => Promise.resolve()),
}));

// Mock for import.meta.env
vi.stubGlobal("import", {
  meta: {
    env: {
      VITE_FIREBASE_API_KEY: "test-api-key",
      VITE_FIREBASE_AUTH_DOMAIN: "test.firebaseapp.com",
      VITE_FIREBASE_DATABASE_URL: "https://test.firebaseio.com",
      VITE_FIREBASE_PROJECT_ID: "test-project",
      VITE_FIREBASE_STORAGE_BUCKET: "test.appspot.com",
      VITE_FIREBASE_MESSAGING_SENDER_ID: "123456",
      VITE_FIREBASE_APP_ID: "1:123456:web:abc123",
      DEV: true,
    },
  },
});
