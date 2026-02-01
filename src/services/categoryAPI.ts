import { toast } from 'sonner';

// Use Vite's environment variable system
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Get auth token from localStorage or wherever you store it
const getAuthToken = (): string => {
  return localStorage.getItem('authToken') || '';
};

// Common headers for API requests
const getHeaders = (): HeadersInit => {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAuthToken()}`,
  };
};

// API Response Type
export interface ApiResponse<T = unknown> {
  success: boolean;
  successMessage: string | null;
  errorMessage: string | null;
  data: T | null;
}

// Types
export interface CategoryAttribute {
  attributeId?: string;
  attributeName: string;
  possibleValuesJson: string[];
  type: 'dropdown' | 'string';
  isRequired: boolean;
}

export interface Category {
  categoryId?: string;
  categoryName: string;
  categoryAttributes: CategoryAttribute[];
}

// Category form data (for creating/updating)
export interface CategoryFormData {
  categoryName: string;
  categoryAttributes: CategoryAttribute[];
}

// Handle API response
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }

  const data: ApiResponse<T> = await response.json();

  if (!data.success) {
    throw new Error(data.errorMessage || 'Request failed');
  }

  return data;
};

// Category API functions
export const categoryApi = {
  // Get all categories
  getAllCategories: async (): Promise<Category[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/category/all`, {
        method: 'GET',
        headers: getHeaders(),
      });

      const data = await handleResponse<Category[]>(response);
      return data.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
      throw error;
    }
  },

  // Get single category by ID
  getCategory: async (categoryId: string): Promise<Category> => {
    try {
      const response = await fetch(`${API_BASE_URL}/category/${categoryId}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      const data = await handleResponse<Category>(response);
      return data.data as Category;
    } catch (error) {
      console.error('Error fetching category:', error);
      toast.error('Failed to fetch category');
      throw error;
    }
  },

  // Create new category
  createCategory: async (categoryData: CategoryFormData): Promise<ApiResponse<null>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/category`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(categoryData),
      });

      const data = await handleResponse<null>(response);
      toast.success(data.successMessage || 'Category created successfully');
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
      throw error;
    }
  },

  // Update category
  updateCategory: async (categoryId: string, categoryData: CategoryFormData): Promise<ApiResponse<null>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/category/${categoryId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(categoryData),
      });

      const data = await handleResponse<null>(response);
      toast.success(data.successMessage || 'Category updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
      throw error;
    }
  },

  // Delete category
  deleteCategory: async (categoryId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/category/${categoryId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      const data = await handleResponse<null>(response);
      toast.success(data.successMessage || 'Category deleted successfully');
      return data;
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
      throw error;
    }
  },
};
