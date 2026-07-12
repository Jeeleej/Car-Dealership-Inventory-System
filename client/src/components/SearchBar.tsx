import React, { useState } from 'react';
import type { SearchFilters } from '../types';

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  loading: boolean;
}

const CATEGORIES = [
  'All Categories',
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

const defaultFilters: SearchFilters = {
  make: '',
  model: '',
  category: '',
  minPrice: '',
  maxPrice: '',
};

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);

  const handleChange = (field: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters(defaultFilters);
    onSearch(defaultFilters);
  };

  const hasFilters = Object.values(filters).some((v) => v !== '');

  return (
    <form className="search-bar glass-card" onSubmit={handleSubmit}>
      <div className="search-bar-grid">
        <div className="search-bar-field">
          <label htmlFor="search-make">Make</label>
          <input
            id="search-make"
            type="text"
            placeholder="e.g. Toyota, BMW..."
            value={filters.make}
            onChange={(e) => handleChange('make', e.target.value)}
          />
        </div>

        <div className="search-bar-field">
          <label htmlFor="search-model">Model</label>
          <input
            id="search-model"
            type="text"
            placeholder="e.g. Camry, X5..."
            value={filters.model}
            onChange={(e) => handleChange('model', e.target.value)}
          />
        </div>

        <div className="search-bar-field">
          <label htmlFor="search-category">Category</label>
          <select
            id="search-category"
            value={filters.category}
            onChange={(e) => handleChange('category', e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat === 'All Categories' ? '' : cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="search-bar-field">
          <label>Price Range</label>
          <div className="search-bar-price-range">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handleChange('minPrice', e.target.value)}
              min="0"
              style={{ width: '100px' }}
            />
            <span>—</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              min="0"
              style={{ width: '100px' }}
            />
          </div>
        </div>

        <div className="search-bar-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" />
                Searching
              </>
            ) : (
              '🔍 Search'
            )}
          </button>
          {hasFilters && (
            <button type="button" className="btn btn-ghost" onClick={handleClear}>
              Clear
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
