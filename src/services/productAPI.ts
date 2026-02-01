import { toast } from 'sonner';

// Use Vite's environment variable system
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Get auth token from localStorage
const getAuthToken = (): string => {
  return localStorage.getItem('authToken') || '';
};

// Common headers for API requests (excluding Content-Type for multipart/form-data)
const getHeaders = (isMultipart: boolean = false): HeadersInit => {
  const headers: HeadersInit = {
    Accept: 'application/json',
    Authorization: `Bearer ${getAuthToken()}`,
  };
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

// API Response Type
export interface ApiResponse<T = unknown> {
  success: boolean;
  successMessage: string | null;
  errorMessage: string | null;
  data: T | null;
}

// Types
export interface ProductAttribute {
  productAttributeId: string;
  categoryAttributeId: string;
  attributeName: string;
  attributeValue: string;
  productAttributeType: 'dropdown' | 'string' | 'checkbox';
}

export interface Product {
  productId: string;
  categoryId: string;
  categoryName: string;
  productName: string;
  productDescription: string;
  productImageUrl: string;
  productQuantity: number; 
  productUnitPrice: number | null;
  hotDeals: boolean;
  productAttributes: ProductAttribute[];
}

// Paginated response for product view API
export interface PaginatedProductResponse {
  items: Product[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

// Product attribute input for form (simplified)
export interface ProductAttributeInput {
  categoryAttributeId: string;
  attributeValue: string;
}

// Product form data (for creating/updating)
export interface ProductFormData {
  categoryId: string;
  productName: string;
  productDescription: string;
  productImage: File | null;
  productQuantity: number;
  productUnitPrice: number;
  hotDeals: boolean;
  productAttributes: ProductAttributeInput[];
}

// Filter parameters for product view API
export interface ProductFilter {
  pageNumber: number;
  pageSize: number;
  categoryId?: string;
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

// Product API functions
export const productApi = {
  getAllProducts: async (filter: ProductFilter): Promise<PaginatedProductResponse> => {
    try {
      const queryParams = new URLSearchParams({
        pageNumber: filter.pageNumber.toString(),
        pageSize: filter.pageSize.toString(),
        ...(filter.categoryId !== undefined ? { categoryId: filter.categoryId.toString() } : {}),
      });

      const response = await fetch(`${API_BASE_URL}/product/view?${queryParams.toString()}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      const data = await handleResponse<PaginatedProductResponse>(response);
      return data.data || { items: [], totalCount: 0, pageNumber: 1, pageSize: 10 };
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
      throw error;
    }
  },

  getProduct: async (productId: string): Promise<Product> => {
    try {
      const response = await fetch(`${API_BASE_URL}/product/${productId}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      const data = await handleResponse<Product>(response);
      console.log(data);
      return data.data as Product;
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to fetch product');
      throw error;
    }
  },

  createProduct: async (productData: ProductFormData): Promise<ApiResponse<null>> => {
    try {
      const formData = new FormData();
      formData.append('CategoryId', productData.categoryId);
      formData.append('ProductName', productData.productName);
      formData.append('ProductDescription', productData.productDescription);
      if (productData.productImage) {
        formData.append('ProductImage', productData.productImage);
      }
      formData.append('ProductQuantity', productData.productQuantity.toString());
      formData.append('ProductUnitPrice', productData.productUnitPrice.toString());
      formData.append('HotDeals', productData.hotDeals.toString());
      formData.append('ProductAttributes', JSON.stringify(productData.productAttributes));

      const response = await fetch(`${API_BASE_URL}/product`, {
        method: 'POST',
        headers: getHeaders(true),
        body: formData,
      });

      const data = await handleResponse<null>(response);
      toast.success(data.successMessage || 'Product created successfully');
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
      throw error;
    }
  },

  updateProduct: async (productId: string, productData: ProductFormData): Promise<ApiResponse<null>> => {
    try {
      const formData = new FormData();
      formData.append('CategoryId', productData.categoryId);
      formData.append('ProductName', productData.productName);
      formData.append('ProductDescription', productData.productDescription);
      if (productData.productImage) {
        formData.append('ProductImage', productData.productImage);
      }
      formData.append('ProductQuantity', productData.productQuantity.toString());
      formData.append('ProductUnitPrice', productData.productUnitPrice.toString());
      formData.append('HotDeals', productData.hotDeals.toString());
      formData.append('ProductAttributes', JSON.stringify(productData.productAttributes));

      const response = await fetch(`${API_BASE_URL}/product/${productId}`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: formData,
      });

      const data = await handleResponse<null>(response);
      toast.success(data.successMessage || 'Product updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
      throw error;
    }
  },

  deleteProduct: async (productId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/product/${productId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      const data = await handleResponse<null>(response);
      toast.success(data.successMessage || 'Product deleted successfully');
      return data;
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
      throw error;
    }
  },
};
