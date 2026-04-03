// Custom transformer to replace import.meta.env with a mock
const { createTransformer } = require('ts-jest').default;

const tsJestTransformer = createTransformer();

module.exports = {
  process(src, filename, config, options) {
    let transformedSrc = src;
    // Replace import.meta.env with a mock object before ts-jest processes it
    transformedSrc = transformedSrc.replace(
      /import\.meta\.env/g,
      '(globalThis as any).import?.meta?.env || { MODE: "test", VITE_BACKEND_URL: "http://localhost:8085", VITE_BASE_URL: "/", PROD: false, DEV: true }'
    );
    // Replace import.meta.url so Jest can parse (used e.g. for new URL(..., import.meta.url))
    transformedSrc = transformedSrc.replace(
      /import\.meta\.url/g,
      '"file:///"'
    );
    // Use ts-jest to transform the rest
    return tsJestTransformer.process(transformedSrc, filename, config, options);
  },
  getCacheKey(fileData, filename, configString, options) {
    return tsJestTransformer.getCacheKey(fileData, filename, configString, options);
  },
};

