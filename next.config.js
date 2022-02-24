const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

/**
 * Stolen from https://stackoverflow.com/questions/10776600/testing-for-equality-of-regular-expressions
 */
const regexEqual = (x, y) => {
  return (
    x instanceof RegExp &&
    y instanceof RegExp &&
    x.source === y.source &&
    x.global === y.global &&
    x.ignoreCase === y.ignoreCase &&
    x.multiline === y.multiline
  );
};

module.exports = {
  webpack: config => {
    const oneOf = config.module.rules.find(
      rule => typeof rule.oneOf === 'object'
    );

    if (oneOf) {
      const moduleCssRule = oneOf.oneOf.find(rule =>
        regexEqual(rule.test, /\.module\.scss$/)
      );

      if (moduleCssRule) {
        const cssLoader = moduleCssRule.use.find(({ loader }) =>
          loader.includes('css-loader')
        );
        if (cssLoader) {
          cssLoader.options.modules.mode = 'local';
        }
      }
    }

    return config;
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
};
