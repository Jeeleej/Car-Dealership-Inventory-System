import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/** Attributes for the Vehicle model */
export interface VehicleAttributes {
  id: number;
  make: string;
  model: string;
  year: number;
  category: string;
  price: number;
  quantity: number;
  description: string;
  imageUrl: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Attributes required when creating a new Vehicle (id is auto-generated) */
export interface VehicleCreationAttributes extends Optional<VehicleAttributes, 'id' | 'description' | 'imageUrl' | 'createdAt' | 'updatedAt'> {}

/**
 * Vehicle model — represents a car in the dealership inventory.
 * Tracks make, model, year, category, pricing, and stock quantity.
 * 
 * NOTE: Uses `declare` instead of `!` to avoid shadowing Sequelize's
 * attribute getters/setters with public class fields.
 */
class Vehicle extends Model<VehicleAttributes, VehicleCreationAttributes> implements VehicleAttributes {
  declare id: number;
  declare make: string;
  declare model: string;
  declare year: number;
  declare category: string;
  declare price: number;
  declare quantity: number;
  declare description: string;
  declare imageUrl: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Vehicle.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    make: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1900,
        max: new Date().getFullYear() + 2,
      },
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '',
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: '',
    },
  },
  {
    sequelize,
    tableName: 'vehicles',
  }
);

export default Vehicle;
