import dotenv from 'dotenv';
import path from 'path';

// Load env before anything else
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Override to use test database
process.env.NODE_ENV = 'test';

import sequelize from '../config/database';

/**
 * Test setup — initializes and tears down the test database
 * for each test suite run.
 */
beforeAll(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  } catch (error) {
    console.error('Test DB setup failed:', error);
    throw error;
  }
});

afterAll(async () => {
  await sequelize.close();
});
