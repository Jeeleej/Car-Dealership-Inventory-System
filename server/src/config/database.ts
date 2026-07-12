import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { Sequelize } from 'sequelize';

const isTest = process.env.NODE_ENV === 'test';

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  database: isTest ? 'car_dealership_test' : (process.env.DB_NAME || 'car_dealership'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

export default sequelize;
