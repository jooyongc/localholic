export interface Story {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  raw_content: string | null;
  thumbnail_url: string | null;
  category: string | null;
  tags: string[];
  meta_title: string | null;
  meta_description: string | null;
  author_id: string;
  status: "draft" | "published" | "archived";
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
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
  status: "draft" | "active" | "sold_out" | "archived";
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
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
