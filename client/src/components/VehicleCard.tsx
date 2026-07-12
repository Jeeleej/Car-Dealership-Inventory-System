import React, { useState, useCallback } from 'react';
import type { Vehicle } from '../types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPurchase: (vehicle: Vehicle) => void;
}

export default function VehicleCard({ vehicle, onPurchase }: VehicleCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { class: 'out-of-stock', label: 'Out of Stock', badge: 'badge-danger' };
    if (quantity <= 3) return { class: 'low-stock', label: `${quantity} left`, badge: 'badge-warning' };
    return { class: 'in-stock', label: `${quantity} in stock`, badge: 'badge-success' };
  };

  const stock = getStockStatus(vehicle.quantity);

  return (
    <div className="vehicle-card glass-card">
      {vehicle.imageUrl && !imageError ? (
        <div className="vehicle-card-image">
          <img
            src={vehicle.imageUrl}
            alt={`${vehicle.make} ${vehicle.model}`}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        </div>
      ) : (
        <div className="vehicle-card-placeholder">🚗</div>
      )}

      <div className="vehicle-card-body">
        <div className="vehicle-card-header">
          <div>
            <h3 className="vehicle-card-title">
              {vehicle.make} {vehicle.model}
              <span className="vehicle-card-year"> · {vehicle.year}</span>
            </h3>
            <span className="badge badge-category">{vehicle.category}</span>
          </div>
          <span className="vehicle-card-price">{formatPrice(vehicle.price)}</span>
        </div>

        {vehicle.description && (
          <p className="vehicle-card-description">{vehicle.description}</p>
        )}

        <div className="vehicle-card-footer">
          <div className="vehicle-card-stock">
            <span className={`stock-dot ${stock.class}`} />
            <span className={stock.badge.replace('badge-', '')} style={{ fontSize: '0.82rem' }}>
              {stock.label}
            </span>
          </div>

          <div className={vehicle.quantity === 0 ? 'btn-purchase-disabled' : ''}>
            <button
              className="btn btn-primary btn-sm"
              disabled={vehicle.quantity === 0}
              onClick={() => onPurchase(vehicle)}
            >
              {vehicle.quantity === 0 ? 'Sold Out' : 'Purchase'}
            </button>
            {vehicle.quantity === 0 && (
              <span className="tooltip">This vehicle is currently out of stock</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
