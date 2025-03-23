/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@nova/eslint-config/base.js'],
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  ignorePatterns: ['**/*spec.ts'],
};
