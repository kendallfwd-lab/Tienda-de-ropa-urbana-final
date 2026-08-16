export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string; // Dynamic category id: 'camisetas' | 'conjuntos' | 'jeans' | 'gorras' | 'calzado' | 'combos' | 'vestidos' | 'accesorios' | 'ofertas' etc.
  priceCRC: number;
  priceUSD: number;
  originalPriceCRC?: number;
  image: string;
  galleryImages: string[];
  sizes: string[]; // Supports both letter sizes (XS, S, M, L, XL, XXL) and shoe numbers (37, 38, 39, 40, 41, 42, 43, 44 or US 7, 7.5, 8, etc.)
  sizeInventory?: { [size: string]: number }; // Detailed stock count per size
  colors?: string[];
  description: string;
  features: string[];
  tag?: string;
  inStock: boolean;
  stockCount?: number;
  rating: number;
  reviewsCount: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isViral?: boolean;
  deletedAt?: string; // ISO date string when moved to trash
  isTrashed?: boolean; // True if product is currently in the recycle bin
  trashReason?: string; // Optional note (e.g., 'Agotado temporalmente')
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  isActive: boolean;
  deletedAt?: string;
  isTrashed?: boolean;
  trashReason?: string;
}

export interface CartItem {
  id: string; // unique cart item id (productId + size + color)
  product: Product;
  selectedSize: string;
  selectedColor?: string;
  quantity: number;
}

export type OrderStatus = 'Pendiente' | 'Confirmado' | 'Preparando' | 'Enviado' | 'Completado' | 'Cancelado';

export interface OrderItem {
  productId: string;
  productName: string;
  size: string;
  color?: string;
  priceCRC: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string; // e.g. LSL-1042
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  province: string;
  canton: string;
  exactAddress: string;
  shippingType: 'tienda' | 'express_ptas' | 'correos_cr' | 'encomienda';
  shippingCostCRC: number;
  paymentMethod: 'sinpe' | 'efectivo' | 'transferencia';
  items: OrderItem[];
  subtotalCRC: number;
  totalCRC: number;
  status: OrderStatus;
  notes?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  isTrashed?: boolean;
  trashReason?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  province?: string;
  canton?: string;
  ordersCount: number;
  totalSpentCRC: number;
  firstOrderDate: string;
  lastOrderDate: string;
  notes?: string;
  deletedAt?: string;
  isTrashed?: boolean;
  trashReason?: string;
}

export interface OrderFormState {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  province: string;
  canton: string;
  exactAddress: string;
  shippingType: 'tienda' | 'express_ptas' | 'correos_cr' | 'encomienda';
  paymentMethod: 'sinpe' | 'efectivo' | 'transferencia';
  notes: string;
}

export interface StoreSettings {
  name: string;
  tagline: string;
  subtitle: string;
  phone: string;
  phoneFormatted: string;
  whatsappUrl: string;
  sinpePhone: string;
  sinpeHolder: string;
  instagramHandle: string;
  instagramUrl: string;
  tiktokHandle: string;
  tiktokUrl: string;
  facebookUrl?: string;
  email: string;
  address: string;
  shortAddress: string;
  plusCode: string;
  mapsUrl: string;
  wazeUrl: string;
  scheduleWeekdays: string;
  scheduleSunday: string;
  shippingExpressCostCRC: number;
  shippingCorreosCostCRC: number;
  shippingEncomiendaCostCRC: number;
  freeShippingMinCRC: number;
  bannerNotice?: string;
}

export interface StoreReview {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  source: 'Google Maps' | 'TikTok' | 'Instagram';
  photosCount?: number;
}

export interface TikTokVideo {
  id: string;
  title: string;
  views: string;
  likes: string;
  thumbnail: string;
  url: string;
  tag: string;
  duration: string;
  deletedAt?: string;
  isTrashed?: boolean;
  trashReason?: string;
}
