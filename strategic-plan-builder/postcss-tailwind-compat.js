// Compatibility wrapper for Tailwind CSS 4.0 with Next.js 14.x
module.exports = (options = {}) => {
  const tailwindPlugin = require('@tailwindcss/postcss');
  
  // Intercept and patch the plugin to add missing `negated` field
  return {
    postcssPlugin: '@tailwindcss/postcss',
    Once(root, helpers) {
      // Patch the scanner options if they exist
      if (options.sources) {
        options.sources.negated = false;
      }
      
      // Call the original plugin
      const plugin = tailwindPlugin(options);
      if (plugin.Once) {
        return plugin.Once(root, helpers);
      }
    },
    plugins: tailwindPlugin(options).plugins || []
  };
};

module.exports.postcss = true;