export interface Story {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  raw_content: string | null;
  thumbnail_url: string | null;
  category: string | null;
  tags: string[];
  regions: string[];
  meta_title: string | null;
  meta_description: string | null;
  author_id: string;
  status: "draft" | "published" | "archived";
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductOption {
  name: string;
  values: string[];
  extra_price: number;
}

export interface ShippingInfo {
  method?: string;
  cost?: number;
  free_threshold?: number;
  note?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  content: string | null;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  category: string | null;
  region: string | null;
  images: string[];
  thumbnail_url: string | null;
  options: ProductOption[];
  shipping_info: ShippingInfo;
  status: "draft" | "active" | "sold_out" | "archived";
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  order_type: "product" | "travel";
  total_amount: number;
  payment_status: "pending" | "paid" | "cancelled" | "refunded";
  payment_key: string | null;
  shipping_address: Record<string, unknown> | null;
  buyer_name: string;
  buyer_phone: string;
  buyer_email: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_type: "product" | "travel";
  item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  options: Record<string, unknown>;
  created_at: string;
}

export interface TravelProgram {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  price: number;
  max_participants: number;
  current_participants: number;
  region: string | null;
  duration: string | null;
  start_date: string | null;
  end_date: string | null;
  itinerary: Record<string, unknown>[];
  images: string[];
  thumbnail_url: string | null;
  status: "draft" | "active" | "closed" | "archived";
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}
