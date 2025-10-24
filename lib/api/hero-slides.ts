import type { HeroSlide } from "@/types"

type HeroSlideAdapter = {
  getActiveHeroSlides: () => Promise<HeroSlide[]>
  getAllHeroSlides: () => Promise<HeroSlide[]>
  getHeroSlideById: (id: string) => Promise<HeroSlide | null>
  createHeroSlide: (data: {
    title: string
    subtitle?: string
    image: string
    buttonText?: string
    buttonLink?: string
    orderIndex?: number
    active?: boolean
  }) => Promise<HeroSlide>
  updateHeroSlide: (
    id: string,
    data: Partial<{
      title: string
      subtitle: string | null
      image: string
      buttonText: string | null
      buttonLink: string | null
      orderIndex: number
      active: boolean
    }>
  ) => Promise<HeroSlide | null>
  deleteHeroSlide: (id: string) => Promise<boolean>
  reorderHeroSlides: (slideIds: string[]) => Promise<void>
}

const providerEnv = process.env.DATABASE_PROVIDER
const provider = providerEnv && providerEnv.length > 0
  ? providerEnv
  : process.env.NEXT_PUBLIC_SUPABASE_URL
    ? "supabase"
    : "sqlite"

const useSupabase = provider.toLowerCase() === "supabase"

const supabaseModulePromise = useSupabase
  ? import("./hero-slides/supabase")
  : Promise.resolve(undefined)

const sqliteModulePromise = useSupabase
  ? Promise.resolve(undefined)
  : import("./hero-slides/sqlite")

let cachedSupabaseModule: HeroSlideAdapter | undefined
let cachedSqliteModule: HeroSlideAdapter | undefined

const loadSupabase = async (): Promise<HeroSlideAdapter> => {
  if (!useSupabase) {
    throw new Error("Supabase hero slide adapter is unavailable in the current environment.")
  }
  if (!cachedSupabaseModule) {
    const mod = await supabaseModulePromise
    if (!mod) {
      throw new Error("Failed to load Supabase hero slide adapter.")
    }
    cachedSupabaseModule = mod as HeroSlideAdapter
  }
  if (!cachedSupabaseModule) {
    throw new Error("Failed to load Supabase hero slide adapter.")
  }
  return cachedSupabaseModule
}

const loadSqlite = async (): Promise<HeroSlideAdapter> => {
  if (useSupabase) {
    throw new Error("SQLite hero slide adapter is unavailable when using Supabase.")
  }
  if (!cachedSqliteModule) {
    const mod = await sqliteModulePromise
    if (!mod) {
      throw new Error("Failed to load SQLite hero slide adapter.")
    }
    cachedSqliteModule = mod as HeroSlideAdapter
  }
  if (!cachedSqliteModule) {
    throw new Error("Failed to load SQLite hero slide adapter.")
  }
  return cachedSqliteModule
}

const wrap = <K extends keyof HeroSlideAdapter>(key: K): HeroSlideAdapter[K] => {
  const invoke = async (loader: () => Promise<HeroSlideAdapter>, args: unknown[]) => {
    const mod = await loader()
    const fn = mod[key] as (...fnArgs: unknown[]) => unknown
    return fn(...args)
  }

  if (useSupabase) {
    return ((...args: unknown[]) => invoke(loadSupabase, args)) as HeroSlideAdapter[K]
  }

  return ((...args: unknown[]) => invoke(loadSqlite, args)) as HeroSlideAdapter[K]
}

export const getActiveHeroSlides = wrap("getActiveHeroSlides")
export const getAllHeroSlides = wrap("getAllHeroSlides")
export const getHeroSlideById = wrap("getHeroSlideById")
export const createHeroSlide = wrap("createHeroSlide")
export const updateHeroSlide = wrap("updateHeroSlide")
export const deleteHeroSlide = wrap("deleteHeroSlide")
export const reorderHeroSlides = wrap("reorderHeroSlides")

