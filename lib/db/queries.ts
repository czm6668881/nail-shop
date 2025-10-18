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
import * as sqlite from "./adapters/sqlite"
import * as supabase from "./adapters/supabase"

const providerEnv = process.env.DATABASE_PROVIDER
const provider = providerEnv && providerEnv.length > 0
  ? providerEnv
  : process.env.NEXT_PUBLIC_SUPABASE_URL
    ? "supabase"
    : "sqlite"
const useSupabase = provider.toLowerCase() === "supabase"

const wrap = <Args extends unknown[], Result>(
  sqliteFn: (...args: Args) => Result,
  supabaseFn: (...args: Args) => Promise<Result>,
) => {
  return async (...args: Args): Promise<Result> => {
    if (useSupabase) {
      return supabaseFn(...args)
    }
    return sqliteFn(...args)
  }
}

export const listProducts = wrap(sqlite.listProducts, supabase.listProducts)
export const findProductBySlug = wrap(sqlite.findProductBySlug, supabase.findProductBySlug)
export const findProductById = wrap(sqlite.findProductById, supabase.findProductById)
export const listFeaturedProducts = wrap(sqlite.listFeaturedProducts, supabase.listFeaturedProducts)
export const listProductsByCollection = wrap(sqlite.listProductsByCollection, supabase.listProductsByCollection)
export const listProductsByCategory = wrap(sqlite.listProductsByCategory, supabase.listProductsByCategory)
export const searchProductsByQuery = wrap(sqlite.searchProductsByQuery, supabase.searchProductsByQuery)
export const listCollections = wrap(sqlite.listCollections, supabase.listCollections)
export const listFeaturedCollections = wrap(sqlite.listFeaturedCollections, supabase.listFeaturedCollections)
export const findCollectionBySlug = wrap(sqlite.findCollectionBySlug, supabase.findCollectionBySlug)
export const toggleCollectionFeatured = wrap(sqlite.toggleCollectionFeatured, supabase.toggleCollectionFeatured)
export const removeCollection = wrap(sqlite.removeCollection, supabase.removeCollection)
export const listReviews = wrap(sqlite.listReviews, supabase.listReviews)
export const listReviewsByProductId = wrap(sqlite.listReviewsByProductId, supabase.listReviewsByProductId)
export const listFeaturedReviews = wrap(sqlite.listFeaturedReviews, supabase.listFeaturedReviews)
export const listBlogPosts = wrap(sqlite.listBlogPosts, supabase.listBlogPosts)
export const findBlogPostBySlug = wrap(sqlite.findBlogPostBySlug, supabase.findBlogPostBySlug)
export const listRelatedBlogPosts = wrap(sqlite.listRelatedBlogPosts, supabase.listRelatedBlogPosts)
export const upsertBlogPost = wrap(sqlite.upsertBlogPost, supabase.upsertBlogPost)
export const deleteBlogPost = wrap(sqlite.deleteBlogPost, supabase.deleteBlogPost)
export const toggleBlogPublish = wrap(sqlite.toggleBlogPublish, supabase.toggleBlogPublish)
export const listOrders = wrap(sqlite.listOrders, supabase.listOrders)
export const listOrdersByUser = wrap(sqlite.listOrdersByUser, supabase.listOrdersByUser)
export const insertOrder = wrap(sqlite.insertOrder, supabase.insertOrder)
export const ensureCart = wrap(sqlite.ensureCart, supabase.ensureCart)
export const fetchCart = wrap(sqlite.fetchCart, supabase.fetchCart)
export const upsertCartItem = wrap(sqlite.upsertCartItem, supabase.upsertCartItem)
export const updateCartItemQuantity = wrap(sqlite.updateCartItemQuantity, supabase.updateCartItemQuantity)
export const removeCartItem = wrap(sqlite.removeCartItem, supabase.removeCartItem)
export const clearCartItems = wrap(sqlite.clearCartItems, supabase.clearCartItems)
export const touchCart = wrap(sqlite.touchCart, supabase.touchCart)
export const listAddressesByUser = wrap(sqlite.listAddressesByUser, supabase.listAddressesByUser)
export const createAddressForUser = wrap(sqlite.createAddressForUser, supabase.createAddressForUser)
export const setDefaultAddressForUser = wrap(sqlite.setDefaultAddressForUser, supabase.setDefaultAddressForUser)
export const deleteAddressForUser = wrap(sqlite.deleteAddressForUser, supabase.deleteAddressForUser)
export const listWishlistItems = wrap(sqlite.listWishlistItems, supabase.listWishlistItems)
export const findWishlistItemByProduct = wrap(sqlite.findWishlistItemByProduct, supabase.findWishlistItemByProduct)
export const addWishlistItem = wrap(sqlite.addWishlistItem, supabase.addWishlistItem)
export const removeWishlistItem = wrap(sqlite.removeWishlistItem, supabase.removeWishlistItem)
export const createSupportTicket = wrap(sqlite.createSupportTicket, supabase.createSupportTicket)
export const createReturnRequest = wrap(sqlite.createReturnRequest, supabase.createReturnRequest)
export const getNotificationPreferences = wrap(sqlite.getNotificationPreferences, supabase.getNotificationPreferences)
export const upsertNotificationPreferences = wrap(sqlite.upsertNotificationPreferences, supabase.upsertNotificationPreferences)
export const createPasswordResetToken = wrap(sqlite.createPasswordResetToken, supabase.createPasswordResetToken)
export const findPasswordResetToken = wrap(sqlite.findPasswordResetToken, supabase.findPasswordResetToken)
export const deletePasswordResetToken = wrap(sqlite.deletePasswordResetToken, supabase.deletePasswordResetToken)
export const updateUserPasswordHash = wrap(sqlite.updateUserPasswordHash, supabase.updateUserPasswordHash)
export const createSession = wrap(sqlite.createSession, supabase.createSession)
export const findSession = wrap(sqlite.findSession, supabase.findSession)
export const deleteSessionByToken = wrap(sqlite.deleteSessionByToken, supabase.deleteSessionByToken)
export const findUserByEmail = wrap(sqlite.findUserByEmail, supabase.findUserByEmail)
export const findUserById = wrap(sqlite.findUserById, supabase.findUserById)
export const insertUser = wrap(sqlite.insertUser, supabase.insertUser)
export const updateUserProfile = wrap(sqlite.updateUserProfile, supabase.updateUserProfile)
export const listUsers = wrap(sqlite.listUsers, supabase.listUsers)

const hashTokenImpl = useSupabase ? supabase.hashToken : sqlite.hashToken
const toPublicUserImpl = useSupabase ? supabase.toPublicUser : sqlite.toPublicUser

export const hashToken = (...args: Parameters<typeof hashTokenImpl>): ReturnType<typeof hashTokenImpl> =>
  hashTokenImpl(...args)
export const toPublicUser = (...args: Parameters<typeof toPublicUserImpl>): ReturnType<typeof toPublicUserImpl> =>
  toPublicUserImpl(...args)

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
