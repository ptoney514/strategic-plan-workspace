// Tailwind CSS v4 compatibility plugin for Next.js 14.x
// This plugin patches the scanner options to include the missing 'negated' field

const tailwindcss = require('@tailwindcss/postcss');

module.exports = function tailwindV4CompatPlugin(options = {}) {
  // Get the original Tailwind plugin
  const originalPlugin = tailwindcss(options);
  
  // Create a wrapper that patches the scanner
  const plugin = {
    postcssPlugin: '@tailwindcss/postcss-compat',
    prepare(result) {
      // Patch the global scanner if it exists
      if (global.__tailwind_scanner) {
        if (global.__tailwind_scanner.sources && !('negated' in global.__tailwind_scanner.sources)) {
          global.__tailwind_scanner.sources.negated = false;
        }
      }
      
      // Call the original plugin's prepare if it exists
      if (originalPlugin.prepare) {
        return originalPlugin.prepare(result);
      }
      
      return {};
    }
  };
  
  // Copy over other plugin methods
  if (originalPlugin.Once) {
    plugin.Once = function(root, helpers) {
      // Patch scanner options before processing
      const patchScanner = () => {
        if (helpers && helpers.result && helpers.result.opts) {
          const opts = helpers.result.opts;
          if (opts.sources && !('negated' in opts.sources)) {
            opts.sources.negated = false;
          }
        }
      };
      
      patchScanner();
      return originalPlugin.Once(root, helpers);
    };
  }
  
  // Copy postcss flag
  plugin.postcss = true;
  
  return plugin;
};

module.exports.postcss = true;