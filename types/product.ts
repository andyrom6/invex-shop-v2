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
  metadata: ProductMetadata;
}

export interface CartItem extends Omit<Product, 'images' | 'description'> {
  image: string;
  quantity: number;
}