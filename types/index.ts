// Core data types for the press-on nails e-commerce platform

export interface Product {
  id: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  images: string[]
  category: ProductCategory
  collection?: string
  inStock: boolean
  stockQuantity: number
  sizes: NailSize[]
  features: string[]
  application: string
  materials: string[]
  slug: string
  createdAt: string
  updatedAt: string
  featured: boolean
  rating: number
  reviewCount: number
}

export type ProductCategory =
  | "classic"
  | "french"
  | "glitter"
  | "ombre"
  | "chrome"
  | "matte"
  | "stiletto"
  | "almond"
  | "coffin"
  | "square"

export type NailSize = "XS" | "S" | "M" | "L" | "XL"

export interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
  size: NailSize
  addedAt: string
}

export interface Cart {
  id: string
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  updatedAt: string
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  createdAt: string
  role: "customer" | "admin"
}

export interface Address {
  id: string
  userId: string
  firstName: string
  lastName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
  isDefault: boolean
}

export interface Order {
  id: string
  userId: string
  orderNumber: string
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: OrderStatus
  shippingAddress: Address
  billingAddress: Address
  paymentMethod: string
  trackingNumber?: string
  createdAt: string
  updatedAt: string
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled"

export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  title: string
  comment: string
  images?: string[]
  verified: boolean
  createdAt: string
}

export interface Collection {
  id: string
  name: string
  description: string
  slug: string
  image: string
  productCount: number
  featured: boolean
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  author: {
    name: string
    avatar: string
  }
  category: BlogCategory
  tags: string[]
  published: boolean
  publishedAt: string
  createdAt: string
  updatedAt: string
  readTime: number
}

export type BlogCategory = "tutorial" | "tips" | "trends" | "care" | "inspiration"

export interface WishlistItem {
  id: string
  userId: string
  productId: string
  product: Product
  addedAt: string
}

export interface SupportTicket {
  id: string
  name: string
  email: string
  topic: string
  orderNumber?: string
  message: string
  status: "open" | "pending" | "resolved"
  createdAt: string
  updatedAt: string
}

export interface ReturnRequest {
  id: string
  orderNumber: string
  email: string
  reason: string
  items: string
  status: "pending" | "approved" | "denied" | "received"
  notes?: string
  createdAt: string
}

export interface NotificationPreferences {
  marketingEmails: boolean
  productAlerts: boolean
  smsUpdates: boolean
}

export interface InventoryEvent {
  id: string
  productId: string
  delta: number
  previousQuantity: number
  newQuantity: number
  reason: string
  referenceType?: string
  referenceId?: string
  context: Record<string, unknown>
  createdAt: string
}
