import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import type { Vehicle, SearchFilters } from '../types';
import SearchBar from '../components/SearchBar';
import VehicleCard from '../components/VehicleCard';
import { useToast } from '../context/ToastContext';

export default function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [purchaseVehicle, setPurchaseVehicle] = useState<Vehicle | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const { showToast } = useToast();

  const fetchVehicles = useCallback(async () => {
    try {
      const response = await apiClient.get<Vehicle[]>('/vehicles');
      setVehicles(response.data);
    } catch (err: any) {
      showToast('error', 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleSearch = async (filters: SearchFilters) => {
    setSearchLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.make) params.set('make', filters.make);
      if (filters.model) params.set('model', filters.model);
      if (filters.category) params.set('category', filters.category);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);

      const hasFilters = Array.from(params.entries()).length > 0;
      const url = hasFilters ? `/vehicles/search?${params.toString()}` : '/vehicles';
      const response = await apiClient.get<Vehicle[]>(url);
      setVehicles(response.data);
    } catch (err: any) {
      showToast('error', 'Search failed. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handlePurchaseOpen = (vehicle: Vehicle) => {
    setPurchaseVehicle(vehicle);
    setPurchaseQuantity(1);
  };

  const handlePurchase = async () => {
    if (!purchaseVehicle) return;
    setPurchaseLoading(true);
    try {
      await apiClient.post(`/vehicles/${purchaseVehicle.id}/purchase`, {
        quantity: purchaseQuantity,
      });
      showToast('success', `Successfully purchased ${purchaseQuantity}× ${purchaseVehicle.make} ${purchaseVehicle.model}!`);
      setPurchaseVehicle(null);
      fetchVehicles();
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Purchase failed';
      showToast('error', message);
    } finally {
      setPurchaseLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);

  const totalVehicles = vehicles.length;
  const totalStock = vehicles.reduce((sum, v) => sum + v.quantity, 0);
  const categories = [...new Set(vehicles.map((v) => v.category))];
  const avgPrice = vehicles.length
    ? vehicles.reduce((sum, v) => sum + v.price, 0) / vehicles.length
    : 0;

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>
            <span className="gradient-text">Inventory</span> Dashboard
          </h1>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card glass-card">
            <div className="stat-card-label">Total Models</div>
            <div className="stat-card-value gradient">{totalVehicles}</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-card-label">Total Stock</div>
            <div className="stat-card-value gradient">{totalStock}</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-card-label">Categories</div>
            <div className="stat-card-value gradient">{categories.length}</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-card-label">Avg. Price</div>
            <div className="stat-card-value gradient">{formatPrice(avgPrice)}</div>
          </div>
        </div>

        <SearchBar onSearch={handleSearch} loading={searchLoading} />

        {loading ? (
          <div className="vehicle-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏎️</div>
            <h3>No Vehicles Found</h3>
            <p>Try adjusting your search filters or check back later for new arrivals.</p>
          </div>
        ) : (
          <div className="vehicle-grid">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onPurchase={handlePurchaseOpen}
              />
            ))}
          </div>
        )}

        {purchaseVehicle && (
          <div className="modal-overlay" onClick={() => setPurchaseVehicle(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Purchase Vehicle</h2>
                <button className="modal-close" onClick={() => setPurchaseVehicle(null)}>
                  ×
                </button>
              </div>

              <div className="purchase-modal-vehicle">
                {purchaseVehicle.imageUrl ? (
                  <img src={purchaseVehicle.imageUrl} alt={`${purchaseVehicle.make} ${purchaseVehicle.model}`} />
                ) : (
                  <div style={{ width: 80, height: 60, background: 'var(--bg-tertiary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                    🚗
                  </div>
                )}
                <div className="purchase-modal-info">
                  <h3>{purchaseVehicle.make} {purchaseVehicle.model} ({purchaseVehicle.year})</h3>
                  <span className="price">{formatPrice(purchaseVehicle.price)} each</span>
                </div>
              </div>

              <div className="form-group">
                <label>Quantity ({purchaseVehicle.quantity} available)</label>
                <div className="purchase-quantity-control">
                  <button
                    type="button"
                    onClick={() => setPurchaseQuantity((q) => Math.max(1, q - 1))}
                    disabled={purchaseQuantity <= 1}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={purchaseQuantity}
                    onChange={(e) => {
                      const val = Math.max(1, Math.min(purchaseVehicle.quantity, Number(e.target.value)));
                      setPurchaseQuantity(val);
                    }}
                    min={1}
                    max={purchaseVehicle.quantity}
                  />
                  <button
                    type="button"
                    onClick={() => setPurchaseQuantity((q) => Math.min(purchaseVehicle.quantity, q + 1))}
                    disabled={purchaseQuantity >= purchaseVehicle.quantity}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="purchase-total">
                <span className="purchase-total-label">Total Amount</span>
                <span className="purchase-total-value gradient-text">
                  {formatPrice(purchaseVehicle.price * purchaseQuantity)}
                </span>
              </div>

              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setPurchaseVehicle(null)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handlePurchase}
                  disabled={purchaseLoading}
                >
                  {purchaseLoading ? (
                    <>
                      <span className="spinner" />
                      Processing...
                    </>
                  ) : (
                    `Purchase — ${formatPrice(purchaseVehicle.price * purchaseQuantity)}`
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
