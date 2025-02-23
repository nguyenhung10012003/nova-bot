const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
module.exports = withNextIntl({
  transpilePackages: ['@nova/ui'],
  output: 'standalone',
  reactStrictMode: false,
});
