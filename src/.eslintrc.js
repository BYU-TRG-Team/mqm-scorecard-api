module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'no-plusplus': 'off',
    'no-continue': 'off',
    'max-len': 'off',
    'no-await-in-loop': 'off',
    'class-methods-use-this': 'off',
  },
};
