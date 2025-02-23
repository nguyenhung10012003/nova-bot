import path from "path";

const projectRoot = process.cwd();

export const config = {
  projectRoot,
  fileStoragePath: path.join(projectRoot, 'storage'),
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || '',
  },
};
