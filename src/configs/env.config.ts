import dotenv from "dotenv";

const envFile = process.env.NODE_ENV === "production" ? ".env" : ".env.dev";
dotenv.config({ path: envFile });

export const envs = {
  NODE_ENV: process.env.NODE_ENV || "", // development | production, create in Dockerfile

  //
  DB_USERNAME: process.env.DB_USERNAME || "Error",
  DB_PASSWORD: process.env.DB_PASSWORD || "Error",
  DB_NAME: process.env.DB_NAME || "Error",
  DB_CONNECT_STRING: process.env.DB_CONNECT_STRING || "Error",

  REDIS_HOST: process.env.REDIS_HOST || "127.0.0.1",
  REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,

  SERVER_PORT: Number(process.env.SERVER_PORT) || 9000,
  SERVER_HOST: process.env.SERVER_HOST || "Error",

  CLIENT_DOMAIN: process.env.CLIENT_DOMAIN || "Error",
  CLIENT_DOMAIN_ADMIN: process.env.CLIENT_DOMAIN_ADMIN || "Error",
  SERVER_DOMAIN: process.env.SERVER_DOMAIN || "Error",

  PASSWORD_SALT: process.env.PASSWORD_SALT || "Error",

  //
  JWT_SECRET: process.env.JWT_SECRET || "Error",
  JWT_SECRET_TEMP: process.env.JWT_SECRET_TEMP || "Error",
  JWT_TEMP_EXPIRES_IN: process.env.JWT_TEMP_EXPIRES_IN || "5m",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",

  MAIL_SERVICE_USER: process.env.MAIL_SERVICE_USER || "Error",
  MAIL_SERVICE_PASS: process.env.MAIL_SERVICE_PASS || "Error",
  MAIL_SERVICE_ROOT: process.env.MAIL_SERVICE_ROOT || "Error",

  // Admin
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "Error",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "Error",

  // AWS (only for local development, production dùng IAM Role)
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "Error",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "Error",
  AWS_REGION: process.env.AWS_REGION || "Error",

  AWS_CLOUDFRONT_DOMAIN: process.env.AWS_CLOUDFRONT_DOMAIN || "Error",
  AWS_CLOUDFRONT_KEY_PAIR_ID: process.env.AWS_CLOUDFRONT_KEY_PAIR_ID || "Error",
  AWS_CLOUDFRONT_PRIVATE_KEY: process.env.AWS_CLOUDFRONT_PRIVATE_KEY || "Error",
  AWS_SIGNED_URL_EXPIRES_IN: process.env.AWS_SIGNED_URL_EXPIRES_IN || "0",

  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME || "Error",
  AWS_PRESIGNED_URL_EXPIRES_IN: process.env.AWS_PRESIGNED_URL_EXPIRES_IN || "0",
};
