module.exports = function override(config) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "assert": require.resolve("assert/"),
    "os": require.resolve("os-browserify/browser"),
    "process": require.resolve("process/browser"),
  };

  return config;
}; 