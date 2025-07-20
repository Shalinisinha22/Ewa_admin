export interface ProductType {
  _id: string;
  value: string;
  label: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  slug: string;
  productType: string;
  parent?: string;
  image?: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  oldPrice?: number;
  category: Category;
  brand: string;
  countInStock: number;
  productType: string;
  images: string[];
  featured: boolean;
  description: string;
  attributes: Record<string, string>;
  color?: string;
  rating?: number;
  material?: string;
  size?: string[];
  careInstructions?: string;
  availability?: string;
  sku?: string;
  countryOfOrigin?: string;
  warranty?: string;
  deliveryInfo?: string;
  offers?: string[];
  features?: string[];
  status?: 'draft' | 'live';
}

export interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt: string | null;
  isDelivered: boolean;
  deliveredAt: string | null;
  status: string;
  createdAt: string;
}

export interface OrderItem {
  _id: string;
  name: string;
  qty: number;
  image: string;
  price: number;
  product: string;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
  createdAt: string;
  totalOrders?: number;
  totalSpent?: number;
}

export interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  expiryDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface Banner {
  _id: string;
  title: string;
  image: string;
  link?: string;
  position: 'hero' | 'sidebar' | 'popup';
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface Page {
  _id: string;
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingRate {
  _id: string;
  region: string;
  minWeight: number;
  maxWeight: number;
  rate: number;
  estimatedDays: string;
  codAvailable: boolean;
  codCharges?: number;
}

export interface TaxSetting {
  _id: string;
  name: string;
  rate: number;
  isActive: boolean;
}

export interface PaymentGateway {
  _id: string;
  name: string;
  isActive: boolean;
  credentials: Record<string, string>;
}

export interface StoreSettings {
  _id: string;
  storeName: string;
  storeDescription: string;
  logo?: string;
  favicon?: string;
  address: string;
  phone: string;
  email: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
}

export interface DashboardStats {
  todayOrders: number;
  weekOrders: number;
  monthOrders: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  lowStockProducts: Product[];
  totalCustomers: number;
  totalProducts: number;
}