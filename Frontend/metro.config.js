const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Reduce memory consumption by limiting workers
config.maxWorkers = 2;

// Reduce transformer workers for web bundling
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    mangle: {
      keep_fnames: true,
    },
  },
};

module.exports = config;
