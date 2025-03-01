import path from "path";

export const getConfig = () => ({
  projectRoot: process.cwd(),
  fileStoragePath: path.join(process.cwd(), 'storage'),
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || "3000"),
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || '',
  },
});
