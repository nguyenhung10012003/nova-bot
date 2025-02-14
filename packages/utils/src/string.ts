import * as bcrypt from 'bcrypt';

export const hash = async (password: string) => {
  return bcrypt.hash(password, 10);
};

export const compare = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const randomString = (length: number, prefix?: string) => {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+[]{}|;:,.<>?';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix ? prefix + result : result;
};
