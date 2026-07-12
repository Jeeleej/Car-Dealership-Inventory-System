import React, { useState, useEffect } from 'react';
import type { VehicleFormData, Vehicle } from '../types';

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  onSubmit: (data: VehicleFormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const CATEGORIES = [
  'Sedan',
  'SUV',
  'Truck',
  'Coupe',
  'Convertible',
  'Van',
  'Wagon',
  'Hatchback',
  'Sports',
  'Luxury',
  'Electric',
  'Hybrid',
];

const defaultFormData: VehicleFormData = {
  make: '',
  model: '',
  year: new Date().getFullYear(),
  category: 'Sedan',
  price: 0,
  quantity: 1,
  description: '',
  imageUrl: '',
};

export default function VehicleForm({ vehicle, onSubmit, onCancel, loading }: VehicleFormProps) {
  const [formData, setFormData] = useState<VehicleFormData>(defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof VehicleFormData, string>>>({});

  const isEditMode = !!vehicle;

  useEffect(() => {
    if (vehicle) {
      setFormData({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        category: vehicle.category,
        price: vehicle.price,
        quantity: vehicle.quantity,
        description: vehicle.description || '',
        imageUrl: vehicle.imageUrl || '',
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [vehicle]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof VehicleFormData, string>> = {};

    if (!formData.make.trim()) newErrors.make = 'Make is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (formData.year < 1900 || formData.year > new Date().getFullYear() + 2) {
      newErrors.year = 'Enter a valid year';
    }
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (formData.quantity < 0) newErrors.quantity = 'Quantity cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));

    if (errors[name as keyof VehicleFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  return (
    <form className="vehicle-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="form-make">Make *</label>
          <input
            id="form-make"
            name="make"
            type="text"
            placeholder="e.g. Toyota"
            value={formData.make}
            onChange={handleChange}
          />
          {errors.make && <span className="form-error">{errors.make}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="form-model">Model *</label>
          <input
            id="form-model"
            name="model"
            type="text"
            placeholder="e.g. Camry"
            value={formData.model}
            onChange={handleChange}
          />
          {errors.model && <span className="form-error">{errors.model}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="form-year">Year *</label>
          <input
            id="form-year"
            name="year"
            type="number"
            min="1900"
            max={new Date().getFullYear() + 2}
            value={formData.year}
            onChange={handleChange}
          />
          {errors.year && <span className="form-error">{errors.year}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="form-category">Category</label>
          <select
            id="form-category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="form-price">Price ($) *</label>
          <input
            id="form-price"
            name="price"
            type="number"
            min="0"
            step="100"
            value={formData.price}
            onChange={handleChange}
          />
          {errors.price && <span className="form-error">{errors.price}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="form-quantity">Quantity *</label>
          <input
            id="form-quantity"
            name="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={handleChange}
          />
          {errors.quantity && <span className="form-error">{errors.quantity}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="form-imageUrl">Image URL</label>
        <input
          id="form-imageUrl"
          name="imageUrl"
          type="url"
          placeholder="https://example.com/car-image.jpg"
          value={formData.imageUrl}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="form-description">Description</label>
        <textarea
          id="form-description"
          name="description"
          rows={3}
          placeholder="Enter vehicle description..."
          value={formData.description}
          onChange={handleChange}
          style={{ resize: 'vertical' }}
        />
      </div>

      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" />
              {isEditMode ? 'Updating...' : 'Adding...'}
            </>
          ) : isEditMode ? (
            'Update Vehicle'
          ) : (
            'Add Vehicle'
          )}
        </button>
      </div>
    </form>
  );
}
