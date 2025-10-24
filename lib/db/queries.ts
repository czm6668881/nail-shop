import type {
  Product,
  Collection,
  Review,
  BlogPost,
  Order,
  Cart,
  Address,
  WishlistItem,
  SupportTicket,
  ReturnRequest,
  NotificationPreferences,
  User,
} from "@/types"

import { createHash } from "crypto"
import type * as SqliteModuleType from "./adapters/sqlite"
import type * as SupabaseModuleType from "./adapters/supabase"

type SqliteModule = typeof SqliteModuleType
type SupabaseModule = typeof SupabaseModuleType

const providerEnv = process.env.DATABASE_PROVIDER
const provider = providerEnv && providerEnv.length > 0
  ? providerEnv
  : process.env.NEXT_PUBLIC_SUPABASE_URL
    ? "supabase"
    : "sqlite"
const useSupabase = provider.toLowerCase() === "supabase"

const supabaseModulePromise: Promise<SupabaseModule | undefined> = useSupabase
  ? import("./adapters/supabase")
  : Promise.resolve(undefined)
const sqliteModulePromise: Promise<SqliteModule | undefined> = useSupabase
  ? Promise.resolve(undefined)
  : import("./adapters/sqlite")

let cachedSupabaseModule: SupabaseModule | undefined
let cachedSqliteModule: SqliteModule | undefined

const loadSupabase = async () => {
  if (!useSupabase) {
    throw new Error("Supabase adapter is not available in the current environment.")
  }
  if (!cachedSupabaseModule) {
    cachedSupabaseModule = await supabaseModulePromise
  }
  if (!cachedSupabaseModule) {
    throw new Error("Failed to load Supabase adapter.")
  }
  return cachedSupabaseModule
}

const loadSqlite = async () => {
  if (useSupabase) {
    throw new Error("SQLite adapter is not available when DATABASE_PROVIDER is set to Supabase.")
  }
  if (!cachedSqliteModule) {
    cachedSqliteModule = await sqliteModulePromise
  }
  if (!cachedSqliteModule) {
    throw new Error("Failed to load SQLite adapter.")
  }
  return cachedSqliteModule
}

const wrap = <K extends keyof SupabaseModule & keyof SqliteModule>(key: K): SupabaseModule[K] => {
  if (useSupabase) {
    return (async (...args: unknown[]) => {
      const mod = await loadSupabase()
      const fn = mod[key] as (...fnArgs: unknown[]) => unknown
      return fn(...args)
    }) as SupabaseModule[K]
  }

  return (async (...args: unknown[]) => {
    const mod = await loadSqlite()
    const fn = mod[key] as (...fnArgs: unknown[]) => unknown
    return fn(...args)
  }) as SupabaseModule[K]
}

export const listProducts = wrap("listProducts")
export const findProductBySlug = wrap("findProductBySlug")
export const findProductById = wrap("findProductById")
export const listFeaturedProducts = wrap("listFeaturedProducts")
export const listProductsByCollection = wrap("listProductsByCollection")
export const listProductsByCategory = wrap("listProductsByCategory")
export const searchProductsByQuery = wrap("searchProductsByQuery")
export const upsertProduct = wrap("upsertProduct")
export const deleteProduct = wrap("deleteProduct")
export const toggleProductFeatured = wrap("toggleProductFeatured")
export const listProductCategories = wrap("listProductCategories")
export const findProductCategoryById = wrap("findProductCategoryById")
export const findProductCategoryBySlug = wrap("findProductCategoryBySlug")
export const createProductCategory = wrap("createProductCategory")
export const updateProductCategory = wrap("updateProductCategory")
export const deleteProductCategory = wrap("deleteProductCategory")
export const listCollections = wrap("listCollections")
export const listFeaturedCollections = wrap("listFeaturedCollections")
export const findCollectionBySlug = wrap("findCollectionBySlug")
export const toggleCollectionFeatured = wrap("toggleCollectionFeatured")
export const removeCollection = wrap("removeCollection")
export const listReviews = wrap("listReviews")
export const listReviewsByProductId = wrap("listReviewsByProductId")
export const listFeaturedReviews = wrap("listFeaturedReviews")
export const listBlogPosts = wrap("listBlogPosts")
export const findBlogPostBySlug = wrap("findBlogPostBySlug")
export const listRelatedBlogPosts = wrap("listRelatedBlogPosts")
export const upsertBlogPost = wrap("upsertBlogPost")
export const deleteBlogPost = wrap("deleteBlogPost")
export const toggleBlogPublish = wrap("toggleBlogPublish")
export const listOrders = wrap("listOrders")
export const listOrdersByUser = wrap("listOrdersByUser")
export const insertOrder = wrap("insertOrder")
export const ensureCart = wrap("ensureCart")
export const fetchCart = wrap("fetchCart")
export const upsertCartItem = wrap("upsertCartItem")
export const updateCartItemQuantity = wrap("updateCartItemQuantity")
export const removeCartItem = wrap("removeCartItem")
export const clearCartItems = wrap("clearCartItems")
export const touchCart = wrap("touchCart")
export const listAddressesByUser = wrap("listAddressesByUser")
export const createAddressForUser = wrap("createAddressForUser")
export const setDefaultAddressForUser = wrap("setDefaultAddressForUser")
export const deleteAddressForUser = wrap("deleteAddressForUser")
export const listWishlistItems = wrap("listWishlistItems")
export const findWishlistItemByProduct = wrap("findWishlistItemByProduct")
export const addWishlistItem = wrap("addWishlistItem")
export const removeWishlistItem = wrap("removeWishlistItem")
export const createSupportTicket = wrap("createSupportTicket")
export const createReturnRequest = wrap("createReturnRequest")
export const getNotificationPreferences = wrap("getNotificationPreferences")
export const upsertNotificationPreferences = wrap("upsertNotificationPreferences")
export const createPasswordResetToken = wrap("createPasswordResetToken")
export const findPasswordResetToken = wrap("findPasswordResetToken")
export const deletePasswordResetToken = wrap("deletePasswordResetToken")
export const updateUserPasswordHash = wrap("updateUserPasswordHash")
export const createSession = wrap("createSession")
export const findSession = wrap("findSession")
export const deleteSessionByToken = wrap("deleteSessionByToken")
export const findUserByEmail = wrap("findUserByEmail")
export const findUserById = wrap("findUserById")
export const findUserByGoogleId = wrap("findUserByGoogleId")
export const insertUser = wrap("insertUser")
export const updateUserProfile = wrap("updateUserProfile")
export const linkGoogleAccount = wrap("linkGoogleAccount")
export const listUsers = wrap("listUsers")

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex")

export type AuthUser = User & { passwordHash: string; googleId: string | null }

export const toPublicUser = (user: AuthUser): User => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  avatar: user.avatar,
  createdAt: user.createdAt,
  role: user.role,
})

export type {
  Product,
  Collection,
  Review,
  BlogPost,
  Order,
  Cart,
  Address,
  WishlistItem,
  SupportTicket,
  ReturnRequest,
  NotificationPreferences,
  User,
}
