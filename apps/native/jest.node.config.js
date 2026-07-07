/**
 * Plain-node jest config for property tests on pure helpers that do not
 * import from `react-native` / `expo-*`. Sidesteps the `jest-expo` +
 * pnpm-flat-node_modules transformIgnorePatterns interaction which fails
 * to transform `@react-native/js-polyfills` under `.pnpm/`.
 *
 * Match only the `__tests__` folders whose files are safe to run in a
 * plain node context (no JSX, no native modules).
 */

module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": [
      "babel-jest",
      { presets: ["babel-preset-expo"] },
    ],
  },
  testMatch: [
    "**/src/utils/__tests__/hymn-of-day.test.ts",
    "**/src/utils/__tests__/share-hymn.test.ts",
    "**/src/data/repositories/__tests__/search-helpers.test.ts",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};
