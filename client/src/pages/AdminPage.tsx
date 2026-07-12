import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import type { Vehicle, VehicleFormData } from '../types';
import VehicleForm from '../components/VehicleForm';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

type ModalState =
  | { type: 'none' }
  | { type: 'add' }
  | { type: 'edit'; vehicle: Vehicle }
  | { type: 'delete'; vehicle: Vehicle }
  | { type: 'restock'; vehicle: Vehicle };

export default function AdminPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [restockQuantity, setRestockQuantity] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [restockLoading, setRestockLoading] = useState(false);

  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
  }, [isAdmin, navigate]);

  const fetchVehicles = useCallback(async () => {
    try {
      const response = await apiClient.get<Vehicle[]>('/vehicles');
      setVehicles(response.data);
    } catch {
      showToast('error', 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleAddVehicle = async (data: VehicleFormData) => {
    setFormLoading(true);
    try {
      await apiClient.post('/vehicles', data);
      showToast('success', `${data.make} ${data.model} added successfully!`);
      setModal({ type: 'none' });
      fetchVehicles();
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Failed to add vehicle';
      showToast('error', message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditVehicle = async (data: VehicleFormData) => {
    if (modal.type !== 'edit') return;
    setFormLoading(true);
    try {
      await apiClient.put(`/vehicles/${modal.vehicle.id}`, data);
      showToast('success', `${data.make} ${data.model} updated successfully!`);
      setModal({ type: 'none' });
      fetchVehicles();
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Failed to update vehicle';
      showToast('error', message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (modal.type !== 'delete') return;
    setDeleteLoading(true);
    try {
      await apiClient.delete(`/vehicles/${modal.vehicle.id}`);
      showToast('success', `${modal.vehicle.make} ${modal.vehicle.model} deleted.`);
      setModal({ type: 'none' });
      fetchVehicles();
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Failed to delete vehicle';
      showToast('error', message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRestock = async () => {
    if (modal.type !== 'restock') return;
    setRestockLoading(true);
    try {
      await apiClient.post(`/vehicles/${modal.vehicle.id}/restock`, {
        quantity: restockQuantity,
      });
      showToast('success', `Restocked ${restockQuantity} units of ${modal.vehicle.make} ${modal.vehicle.model}.`);
      setModal({ type: 'none' });
      fetchVehicles();
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Failed to restock';
      showToast('error', message);
    } finally {
      setRestockLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) return <span className="badge badge-danger">Out of Stock</span>;
    if (quantity <= 3) return <span className="badge badge-warning">{quantity} left</span>;
    return <span className="badge badge-success">{quantity} in stock</span>;
  };

  if (!isAdmin) return null;

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>
            <span className="gradient-text">Admin</span> Panel
          </h1>
          <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>
            + Add Vehicle
          </button>
        </div>

        {loading ? (
          <div className="page-loading">
            <div className="spinner spinner-lg" />
            <p>Loading inventory...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No Vehicles in Inventory</h3>
            <p>Add your first vehicle to get started.</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: 20 }}
              onClick={() => setModal({ type: 'add' })}
            >
              + Add Vehicle
            </button>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Category</th>
                  <th>Year</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>
                      <div className="admin-table-vehicle">
                        {vehicle.imageUrl ? (
                          <img
                            className="admin-table-thumb"
                            src={vehicle.imageUrl}
                            alt={`${vehicle.make} ${vehicle.model}`}
                          />
                        ) : (
                          <div
                            className="admin-table-thumb"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.2rem',
                            }}
                          >
                            🚗
                          </div>
                        )}
                        <span className="admin-table-name">
                          {vehicle.make} {vehicle.model}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-category">{vehicle.category}</span>
                    </td>
                    <td>{vehicle.year}</td>
                    <td style={{ fontWeight: 600 }}>{formatPrice(vehicle.price)}</td>
                    <td>{getStockBadge(vehicle.quantity)}</td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setModal({ type: 'edit', vehicle })}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            setRestockQuantity(1);
                            setModal({ type: 'restock', vehicle });
                          }}
                          title="Restock"
                        >
                          📦
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setModal({ type: 'delete', vehicle })}
                          title="Delete"
                          style={{ color: 'var(--danger)' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Vehicle Modal */}
        {modal.type === 'add' && (
          <div className="modal-overlay" onClick={() => setModal({ type: 'none' })}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add New Vehicle</h2>
                <button className="modal-close" onClick={() => setModal({ type: 'none' })}>
                  ×
                </button>
              </div>
              <VehicleForm
                onSubmit={handleAddVehicle}
                onCancel={() => setModal({ type: 'none' })}
                loading={formLoading}
              />
            </div>
          </div>
        )}

        {/* Edit Vehicle Modal */}
        {modal.type === 'edit' && (
          <div className="modal-overlay" onClick={() => setModal({ type: 'none' })}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Vehicle</h2>
                <button className="modal-close" onClick={() => setModal({ type: 'none' })}>
                  ×
                </button>
              </div>
              <VehicleForm
                vehicle={modal.vehicle}
                onSubmit={handleEditVehicle}
                onCancel={() => setModal({ type: 'none' })}
                loading={formLoading}
              />
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {modal.type === 'delete' && (
          <div className="modal-overlay" onClick={() => setModal({ type: 'none' })}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
              <div className="modal-header">
                <h2>Confirm Deletion</h2>
                <button className="modal-close" onClick={() => setModal({ type: 'none' })}>
                  ×
                </button>
              </div>
              <div className="confirm-dialog">
                <p>Are you sure you want to delete</p>
                <p className="vehicle-name">
                  {modal.vehicle.make} {modal.vehicle.model} ({modal.vehicle.year})
                </p>
                <p style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setModal({ type: 'none' })}>
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <>
                      <span className="spinner" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Vehicle'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Restock Modal */}
        {modal.type === 'restock' && (
          <div className="modal-overlay" onClick={() => setModal({ type: 'none' })}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
              <div className="modal-header">
                <h2>Restock Vehicle</h2>
                <button className="modal-close" onClick={() => setModal({ type: 'none' })}>
                  ×
                </button>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
                Add stock for <strong>{modal.vehicle.make} {modal.vehicle.model}</strong>
                <br />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Current stock: {modal.vehicle.quantity} units
                </span>
              </p>
              <div className="form-group">
                <label>Quantity to Add</label>
                <div className="restock-input-group">
                  <input
                    type="number"
                    min={1}
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(Math.max(1, Number(e.target.value)))}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setModal({ type: 'none' })}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleRestock}
                  disabled={restockLoading}
                >
                  {restockLoading ? (
                    <>
                      <span className="spinner" />
                      Restocking...
                    </>
                  ) : (
                    `Add ${restockQuantity} Units`
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
