export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          google_id: string | null
          first_name: string
          last_name: string
          avatar: string | null
          role: "customer" | "admin"
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          google_id?: string | null
          first_name: string
          last_name: string
          avatar?: string | null
          role?: "customer" | "admin"
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          google_id?: string | null
          first_name?: string
          last_name?: string
          avatar?: string | null
          role?: "customer" | "admin"
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          token_hash: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token_hash: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token_hash?: string
          expires_at?: string
          created_at?: string
        }
      }
      collections: {
        Row: {
          id: string
          name: string
          description: string | null
          slug: string
          image: string | null
          product_count: number
          featured: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          slug: string
          image?: string | null
          product_count?: number
          featured?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          slug?: string
          image?: string | null
          product_count?: number
      featured?: boolean
        }
      }
      product_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          sort_order: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          sort_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          sort_order?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          compare_at_price: number | null
          images: Json
          category: string
          collection_slug: string | null
          in_stock: boolean
          stock_quantity: number
          sizes: Json
          features: Json
          application: string | null
          materials: Json
          slug: string
          created_at: string
          updated_at: string
          featured: boolean
          rating: number
          review_count: number
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          compare_at_price?: number | null
          images?: Json
          category: string
          collection_slug?: string | null
          in_stock?: boolean
          stock_quantity?: number
          sizes?: Json
          features?: Json
          application?: string | null
          materials?: Json
          slug: string
          created_at?: string
          updated_at?: string
          featured?: boolean
          rating?: number
          review_count?: number
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          compare_at_price?: number | null
          images?: Json
          category?: string
          collection_slug?: string | null
          in_stock?: boolean
          stock_quantity?: number
          sizes?: Json
          features?: Json
          application?: string | null
          materials?: Json
          slug?: string
          created_at?: string
          updated_at?: string
          featured?: boolean
          rating?: number
          review_count?: number
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string | null
          user_name: string
          rating: number
          title: string
          comment: string
          images: Json
          verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id?: string | null
          user_name: string
          rating: number
          title: string
          comment: string
          images?: Json
          verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string | null
          user_name?: string
          rating?: number
          title?: string
          comment?: string
          images?: Json
          verified?: boolean
          created_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string
          content: string
          cover_image: string | null
          author_name: string
          author_avatar: string | null
          category: string
          tags: Json
          published: boolean
          published_at: string | null
          created_at: string
          updated_at: string
          read_time: number
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt: string
          content: string
          cover_image?: string | null
          author_name: string
          author_avatar?: string | null
          category: string
          tags?: Json
          published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
          read_time?: number
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string
          content?: string
          cover_image?: string | null
          author_name?: string
          author_avatar?: string | null
          category?: string
          tags?: Json
          published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
          read_time?: number
        }
      }
      carts: {
        Row: {
          id: string
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          product_id: string
          size: string
          quantity: number
          added_at: string
        }
        Insert: {
          id?: string
          cart_id: string
          product_id: string
          size: string
          quantity: number
          added_at?: string
        }
        Update: {
          id?: string
          cart_id?: string
          product_id?: string
          size?: string
          quantity?: number
          added_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          order_number: string
          items: Json
          subtotal: number
          tax: number
          shipping: number
          total: number
          status: string
          shipping_address: Json
          billing_address: Json
          payment_method: string
          tracking_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          order_number: string
          items?: Json
          subtotal: number
          tax: number
          shipping: number
          total: number
          status: string
          shipping_address?: Json
          billing_address?: Json
          payment_method: string
          tracking_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          order_number?: string
          items?: Json
          subtotal?: number
          tax?: number
          shipping?: number
          total?: number
          status?: string
          shipping_address?: Json
          billing_address?: Json
          payment_method?: string
          tracking_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      inventory_events: {
        Row: {
          id: string
          product_id: string
          delta: number
          previous_quantity: number
          new_quantity: number
          reason: string
          reference_type: string | null
          reference_id: string | null
          context: Json
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          delta: number
          previous_quantity: number
          new_quantity: number
          reason: string
          reference_type?: string | null
          reference_id?: string | null
          context?: Json
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          delta?: number
          previous_quantity?: number
          new_quantity?: number
          reason?: string
          reference_type?: string | null
          reference_id?: string | null
          context?: Json
          created_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          address_line1: string
          address_line2: string | null
          city: string
          state: string
          postal_code: string
          country: string
          phone: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          address_line1: string
          address_line2?: string | null
          city: string
          state: string
          postal_code: string
          country: string
          phone: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          address_line1?: string
          address_line2?: string | null
          city?: string
          state?: string
          postal_code?: string
          country?: string
          phone?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      wishlist_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          added_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          added_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          added_at?: string
        }
      }
      support_tickets: {
        Row: {
          id: string
          name: string
          email: string
          topic: string
          order_number: string | null
          message: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          topic: string
          order_number?: string | null
          message: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          topic?: string
          order_number?: string | null
          message?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      return_requests: {
        Row: {
          id: string
          order_number: string
          email: string
          reason: string
          items: string
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_number: string
          email: string
          reason: string
          items: string
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          email?: string
          reason?: string
          items?: string
          status?: string
          notes?: string | null
          created_at?: string
        }
      }
      notification_preferences: {
        Row: {
          user_id: string
          marketing_emails: boolean
          product_alerts: boolean
          sms_updates: boolean
          updated_at: string
        }
        Insert: {
          user_id: string
          marketing_emails?: boolean
          product_alerts?: boolean
          sms_updates?: boolean
          updated_at?: string
        }
        Update: {
          user_id?: string
          marketing_emails?: boolean
          product_alerts?: boolean
          sms_updates?: boolean
          updated_at?: string
        }
      }
      password_reset_tokens: {
        Row: {
          id: string
          user_id: string
          token_hash: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token_hash: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token_hash?: string
          expires_at?: string
          created_at?: string
        }
      }
      hero_slides: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          image: string
          button_text: string | null
          button_link: string | null
          order_index: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          subtitle?: string | null
          image: string
          button_text?: string | null
          button_link?: string | null
          order_index?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string | null
          image?: string
          button_text?: string | null
          button_link?: string | null
          order_index?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      adjust_inventory: {
        Args: {
          p_product_id: string
          p_delta: number
          p_reason?: string | null
          p_reference_type?: string | null
          p_reference_id?: string | null
          p_context?: Json | null
        }
        Returns: {
          id: string
          product_id: string
          delta: number
          previous_quantity: number
          new_quantity: number
          reason: string
          reference_type: string | null
          reference_id: string | null
          context: Json
          created_at: string
        }
      }
    }
    Enums: Record<string, never>
  }
}
