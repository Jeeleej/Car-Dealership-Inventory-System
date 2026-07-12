import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import sequelize from './config/database';
import { User, Vehicle } from './models';
import bcrypt from 'bcryptjs';

/**
 * Seeds the database with an admin user and sample vehicles.
 * Run with: npm run seed
 */
async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('🗑️  Database cleared and re-synced.');

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    await User.create({
      username: 'admin',
      email: 'admin@dealership.com',
      password: hashedPassword,
      role: 'admin',
    }, { hooks: false }); // Skip the beforeCreate hook since we already hashed

    console.log('👤 Admin user created (admin@dealership.com / admin123)');

    // Create sample vehicles
    const vehicles = [
      { make: 'Toyota', model: 'Camry', year: 2025, category: 'Sedan', price: 28000, quantity: 5, description: 'Reliable mid-size sedan with excellent fuel economy.', imageUrl: '' },
      { make: 'Honda', model: 'CR-V', year: 2025, category: 'SUV', price: 35000, quantity: 3, description: 'Spacious compact SUV perfect for families.', imageUrl: '' },
      { make: 'Ford', model: 'Mustang', year: 2024, category: 'Sports', price: 45000, quantity: 2, description: 'Iconic American muscle car with thrilling performance.', imageUrl: '' },
      { make: 'Tesla', model: 'Model 3', year: 2025, category: 'Electric', price: 42000, quantity: 4, description: 'Premium electric sedan with autopilot technology.', imageUrl: '' },
      { make: 'BMW', model: 'X5', year: 2025, category: 'SUV', price: 65000, quantity: 2, description: 'Luxury midsize SUV with powerful performance.', imageUrl: '' },
      { make: 'Mercedes-Benz', model: 'C-Class', year: 2025, category: 'Sedan', price: 55000, quantity: 3, description: 'Elegant luxury sedan with cutting-edge technology.', imageUrl: '' },
      { make: 'Chevrolet', model: 'Silverado', year: 2025, category: 'Truck', price: 48000, quantity: 6, description: 'Full-size pickup truck built for work and adventure.', imageUrl: '' },
      { make: 'Audi', model: 'e-tron GT', year: 2025, category: 'Electric', price: 106000, quantity: 1, description: 'High-performance electric grand tourer.', imageUrl: '' },
      { make: 'Porsche', model: '911 Carrera', year: 2025, category: 'Sports', price: 115000, quantity: 1, description: 'The definitive sports car, a legend in every detail.', imageUrl: '' },
      { make: 'Hyundai', model: 'Tucson', year: 2025, category: 'SUV', price: 30000, quantity: 4, description: 'Modern SUV with bold design and advanced features.', imageUrl: '' },
    ];

    await Vehicle.bulkCreate(vehicles);
    console.log(`🚗 ${vehicles.length} sample vehicles created.`);

    console.log('\n✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
