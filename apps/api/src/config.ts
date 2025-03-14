import path from 'path';

export const getConfig = () => ({
  projectRoot: process.cwd(),
  fileStoragePath: path.join(process.cwd(), 'storage'),
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || "3000"),
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || '',
  },
  facebook: {
    appId: process.env.FACEBOOK_APP_ID || '',
    appSecret: process.env.FACEBOOK_APP_SECRET || '',
    verifyToken: process.env.FACEBOOK_WEBHOOK__VERIFY_TOKEN || '',
  },
});
