const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Allow `import migration from "./0000_initial.sql"` — handled by
// babel-plugin-inline-import in babel.config.js.
config.resolver.sourceExts = [...config.resolver.sourceExts, "sql"];

const uniwindConfig = withUniwindConfig(config, {
  cssEntryFile: "./global.css",
  dtsFile: "./uniwind-types.d.ts",
});

module.exports = uniwindConfig;
