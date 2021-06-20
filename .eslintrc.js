module.exports = {
  env: {
    es6: true,
    node: true,
    browser: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  globals: {
    React: true,
    ReactDOM: true,
    ReactRouterDOM: true,
  },
  plugins: [
    'react',
    'only-warn', // for run build
  ],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    ecmaFeatures: {
      jsx: true,
      modules: true,
      legacyDecorators: true,
    },
    sourceType: 'module',
    useJSXTextNode: false,
  },
  rules: {
    indent: ['error', 2, { SwitchCase: 1 }],
    'no-console': 0,
    'prettier/prettier': 0,
    'react/prop-types': 0,
    'react-hooks/exhaustive-deps': 0,
    'react-native/no-inline-styles': 0,
    'arrow-parens': ['error', 'as-needed'],
    'brace-style': ['error', 'stroustrup'],
    'object-curly-spacing': ['error', 'always'],
    'linebreak-style': 0,
    'react/jsx-filename-extension': [0],
    'react/jsx-one-expression-per-line': ['error', { allow: 'single-child' }],
    'max-len': 0,
    'operator-linebreak': ['error', 'after', { overrides: { '?': 'before', ':': 'before' } }],
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-static-element-interactions': 0,
  },
  ignorePatterns: [
    '*.css',
  ],
};
