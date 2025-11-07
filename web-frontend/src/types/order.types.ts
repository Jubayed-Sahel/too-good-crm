/**
 * Order Types
 * Matches backend API Order model
 */

export type OrderType = 'purchase' | 'service';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';

export interface OrderItem {
  id?: number;
  item_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price?: number;
  sku?: string;
  unit?: string;
}

export interface Order {
  id: number;
  code: string;
  order_number: string;
  title: string;
  description?: string;
  order_type: OrderType;
  vendor: number;
  vendor_name?: string;
  customer?: number | null;
  customer_name?: string;
  total_amount: number;
  currency: string;
  order_date: string;
  delivery_date?: string | null;
  status: OrderStatus;
  organization: number;
  assigned_to?: number | null;
  assigned_to_name?: string;
  items?: OrderItem[];
  items_count?: number;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderData {
  title: string;
  description?: string;
  order_type: OrderType;
  vendor: number;
  customer?: number | null;
  total_amount: number;
  currency?: string;
  order_date: string;
  delivery_date?: string | null;
  status: OrderStatus;
  assigned_to?: number | null;
  items: OrderItem[];
}

export interface UpdateOrderData extends Partial<CreateOrderData> {}

export interface OrderStats {
  total: number;
  total_revenue: number;
  by_status: Record<OrderStatus, number>;
  by_type: Record<OrderType, number>;
}

export interface OrderFilters {
  vendor?: number;
  customer?: number;
  order_type?: OrderType;
  status?: OrderStatus;
  assigned_to?: number;
  organization?: number;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}
