const path = require('path');

/** @type {import('next').NextConfig} */

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
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  webpack(config) {
    const sassRules = config.module.rules
      .find(rule => typeof rule.oneOf === 'object')
      .oneOf.find(
        rule =>
          rule.sideEffects === false &&
          regexEqual(rule.test, /\.module\.(scss|sass)$/)
      );

    sassRules.use = sassRules.use.map(rule =>
      rule.loader.includes('css-loader/dist')
        ? {
            ...rule,
            options: {
              ...rule.options,
              modules: {
                ...rule.modules,
                localIdentName: '[hash:base64:5]',
              },
            },
          }
        : rule
    );

    return config;
  },
};
