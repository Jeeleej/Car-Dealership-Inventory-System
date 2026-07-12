export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  category: string;
  price: number;
  quantity: number;
  description: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface VehicleFormData {
  make: string;
  model: string;
  year: number;
  category: string;
  price: number;
  quantity: number;
  description: string;
  imageUrl: string;
}

export interface SearchFilters {
  make: string;
  model: string;
  category: string;
  minPrice: string;
  maxPrice: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
