import {
  findProductBySlug,
  listCollections,
  listFeaturedCollections,
  listFeaturedProducts,
  listProducts,
  listProductsByCategory,
  listProductsByCollection,
  searchProductsByQuery,
} from "@/lib/db/queries"
import type { Product, Collection } from "@/types"

export async function getProducts(): Promise<Product[]> {
  return listProducts()
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return listFeaturedProducts()
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return findProductBySlug(slug)
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  return listProductsByCategory(category)
}

export async function getProductsByCollection(collection: string): Promise<Product[]> {
  return listProductsByCollection(collection)
}

export async function getCollections(): Promise<Collection[]> {
  return listCollections()
}

export async function getFeaturedCollections(): Promise<Collection[]> {
  return listFeaturedCollections()
}

export async function searchProducts(query: string): Promise<Product[]> {
  if (!query) {
    return listProducts()
  }
  return searchProductsByQuery(query)
}
