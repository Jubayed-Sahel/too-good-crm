/**
 * Payment Types
 * Matches backend API Payment model
 */

export type PaymentType = 'incoming' | 'outgoing';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'online';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: number;
  code: string;
  payment_number: string;
  invoice_number?: string;
  reference_number?: string;
  vendor?: number | null;
  vendor_name?: string;
  customer?: number | null;
  customer_name?: string;
  order?: number | null;
  order_number?: string;
  payment_type: PaymentType;
  payment_method: PaymentMethod;
  amount: number;
  currency: string;
  payment_date: string;
  due_date?: string | null;
  status: PaymentStatus;
  transaction_id?: string;
  processed_at?: string | null;
  processed_by?: number | null;
  notes?: string;
  organization: number;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentData {
  invoice_number?: string;
  reference_number?: string;
  vendor?: number | null;
  customer?: number | null;
  order?: number | null;
  payment_type: PaymentType;
  payment_method: PaymentMethod;
  amount: number;
  currency?: string;
  payment_date: string;
  due_date?: string | null;
  status: PaymentStatus;
  transaction_id?: string;
  notes?: string;
}

export interface UpdatePaymentData extends Partial<CreatePaymentData> {}

export interface PaymentStats {
  total: number;
  total_amount: number;
  by_status: Record<PaymentStatus, number>;
  by_payment_type: Record<PaymentType, number>;
  by_payment_method: Record<PaymentMethod, number>;
}

export interface PaymentFilters {
  vendor?: number;
  customer?: number;
  order?: number;
  payment_type?: PaymentType;
  payment_method?: PaymentMethod;
  status?: PaymentStatus;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}
