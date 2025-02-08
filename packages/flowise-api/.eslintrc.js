/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['@nova/eslint-config/base.js'],
  parser: '@typescript-eslint/parser',
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
