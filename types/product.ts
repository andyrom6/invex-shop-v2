export interface ProductMetadata {
  category?: string;
  type?: string;
  delivery?: string;
  isSubscription?: string;
  requires_shipping?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  metadata: {
    category: string;
    type: 'physical' | 'digital';
    delivery: 'shipping' | 'download';
  };
  stock: number;
  sku?: string;
  createdAt: string;
  tags?: string[];
  featured?: boolean;
  salePrice?: number;
  onSale?: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  quantity: number;
  metadata: Product['metadata'];
  onSale?: boolean;
  salePrice?: number;
  originalPrice?: number;
}