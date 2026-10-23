export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tradingview_username?: string;
  created_at: string;
}

export type ProductType = 'open_source' | 'private_protected' | 'bundle';
export type ProductCategory = 'trend' | 'liquidity' | 'volume' | 'reversal' | 'bundle' | 'momentum';

export interface ProductVersion {
  id: string;
  product_id: string;
  version_number: string;
  changelog: string;
  created_at: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  title_id?: string;
  title_en?: string;
  short_desc: string;
  short_desc_id?: string;
  short_desc_en?: string;
  long_desc: string;
  long_desc_id?: string;
  long_desc_en?: string;
  type: ProductType;
  category: ProductCategory;
  price_cents: number;
  price_idr?: number;
  discount_cents?: number;
  discount_idr?: number;
  version: string;
  pine_version?: 'v5' | 'v6';
  release_date?: string;
  changelog?: string[];
  changelog_id?: string[];
  changelog_en?: string[];
  compatibility?: string;
  compatibility_id?: string;
  compatibility_en?: string;
  features: string[];
  features_id?: string[];
  features_en?: string[];
  technical_specs?: { label: string; value: string }[];
  technical_specs_id?: { label: string; value: string }[];
  technical_specs_en?: { label: string; value: string }[];
  package_includes?: string[];
  package_includes_id?: string[];
  package_includes_en?: string[];
  tradingview_script_id?: string;
  is_published: boolean;
  thumbnail_url: string;
  preview_images?: string[];
  included_product_ids?: string[]; // for bundles
  created_at: string;
}

export type OrderStatus = 'pending' | 'verifying' | 'paid' | 'cancelled' | 'refunded';
export type PaymentMethod = 'bank_transfer' | 'paypal' | 'crypto' | 'p2p';
export type PaymentStatus = 'awaiting_payment' | 'under_review' | 'completed' | 'rejected';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  product_type: ProductType;
  unit_price_cents: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  access_token?: string;
  total_cents: number;
  currency: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  customer_email: string;
  customer_tv_username?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  payment?: Payment;
}

export interface Payment {
  id: string;
  order_id: string;
  method: PaymentMethod;
  amount_cents: number;
  currency: string;
  status: PaymentStatus;
  provider_ref?: string;
  proof_data?: string; // Receipt URL, TXID, or PayPal Order ID
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export type DeliveryType = 'source_download' | 'tradingview_access';
export type DeliveryStatus = 'ready' | 'awaiting_tv_username' | 'access_requested' | 'access_granted' | 'access_rejected';

export interface Delivery {
  id: string;
  order_id: string;
  product_id: string;
  user_id: string;
  delivery_type: DeliveryType;
  status: DeliveryStatus;
  tv_username?: string;
  access_granted_at?: string;
  product_title?: string;
  product_type?: ProductType;
  product_slug?: string;
  version?: string;
  product_version?: string;
  tradingview_script_id?: string;
  has_source_code?: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_user_id: string;
  admin_name?: string;
  action: string;
  target_entity: string;
  target_id: string;
  details: any;
  created_at: string;
}

export interface SiteSettings {
  bank_bca_account: string;
  bank_bca_holder: string;
  bank_mandiri_account: string;
  bank_mandiri_holder: string;
  bank_wire_details: string;
  crypto_usdt_trc20: string;
  crypto_usdt_erc20: string;
  crypto_btc: string;
  paypal_client_id: string;
  paypal_sandbox_mode: boolean;
  tradingview_publisher_username: string;
}
