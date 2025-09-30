export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_usage_stats: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          error_message: string | null
          id: string
          input_length: number | null
          input_type: string
          parsing_time_ms: number | null
          provider: string | null
          success: boolean | null
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_length?: number | null
          input_type: string
          parsing_time_ms?: number | null
          provider?: string | null
          success?: boolean | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_length?: number | null
          input_type?: string
          parsing_time_ms?: number | null
          provider?: string | null
          success?: boolean | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      collection_recipes: {
        Row: {
          added_at: string | null
          collection_id: string
          recipe_id: string
        }
        Insert: {
          added_at?: string | null
          collection_id: string
          recipe_id: string
        }
        Update: {
          added_at?: string | null
          collection_id?: string
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_recipes_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes_with_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "simplified_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          color: string | null
          cover_image: string | null
          created_at: string | null
          description: string | null
          emoji: string | null
          id: string
          is_public: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          emoji?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          emoji?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ingredient_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          order_index: number | null
          recipe_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          order_index?: number | null
          recipe_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          order_index?: number | null
          recipe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_categories_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_categories_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes_with_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_categories_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "simplified_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          amount: string | null
          category_id: string | null
          created_at: string | null
          id: string
          name: string
          notes: string | null
          order_index: number | null
          recipe_id: string
          unit: string | null
        }
        Insert: {
          amount?: string | null
          category_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          order_index?: number | null
          recipe_id: string
          unit?: string | null
        }
        Update: {
          amount?: string | null
          category_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          order_index?: number | null
          recipe_id?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ingredient_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes_with_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "simplified_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      instructions: {
        Row: {
          created_at: string | null
          id: string
          image: string | null
          order_index: number | null
          recipe_id: string
          step: number
          text: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image?: string | null
          order_index?: number | null
          recipe_id: string
          step: number
          text: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image?: string | null
          order_index?: number | null
          recipe_id?: string
          step?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "instructions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instructions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes_with_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instructions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "simplified_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      kv_store_42fdd765: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
      }
      nutrition: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string | null
          fat: number | null
          fiber: number | null
          id: string
          protein: number | null
          recipe_id: string
          sodium: number | null
          sugar: number | null
          updated_at: string | null
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          fat?: number | null
          fiber?: number | null
          id?: string
          protein?: number | null
          recipe_id: string
          sodium?: number | null
          sugar?: number | null
          updated_at?: string | null
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          fat?: number | null
          fiber?: number | null
          id?: string
          protein?: number | null
          recipe_id?: string
          sodium?: number | null
          sugar?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: true
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: true
            referencedRelation: "recipes_with_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: true
            referencedRelation: "simplified_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cooking_style: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          cooking_style?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          cooking_style?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      recipe_content_blocks: {
        Row: {
          block_data: Json
          block_type: string
          created_at: string | null
          id: string
          order_index: number
          recipe_id: string | null
        }
        Insert: {
          block_data: Json
          block_type: string
          created_at?: string | null
          id?: string
          order_index: number
          recipe_id?: string | null
        }
        Update: {
          block_data?: Json
          block_type?: string
          created_at?: string | null
          id?: string
          order_index?: number
          recipe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_content_blocks_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_content_blocks_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes_with_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_content_blocks_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "simplified_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_image_library: {
        Row: {
          category: string | null
          created_at: string | null
          cuisine: string | null
          height: number | null
          id: string
          image_url: string
          keywords: string[] | null
          photographer_name: string | null
          photographer_url: string | null
          source_id: string | null
          source_type: string
          updated_at: string | null
          width: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          cuisine?: string | null
          height?: number | null
          id?: string
          image_url: string
          keywords?: string[] | null
          photographer_name?: string | null
          photographer_url?: string | null
          source_id?: string | null
          source_type: string
          updated_at?: string | null
          width?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          cuisine?: string | null
          height?: number | null
          id?: string
          image_url?: string
          keywords?: string[] | null
          photographer_name?: string | null
          photographer_url?: string | null
          source_id?: string | null
          source_type?: string
          updated_at?: string | null
          width?: number | null
        }
        Relationships: []
      }
      recipe_image_matches: {
        Row: {
          created_at: string | null
          id: string
          is_placeholder: boolean | null
          library_image_id: string | null
          match_score: number | null
          recipe_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_placeholder?: boolean | null
          library_image_id?: string | null
          match_score?: number | null
          recipe_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_placeholder?: boolean | null
          library_image_id?: string | null
          match_score?: number | null
          recipe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_image_matches_library_image_id_fkey"
            columns: ["library_image_id"]
            isOneToOne: false
            referencedRelation: "recipe_image_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_image_matches_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_image_matches_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes_with_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_image_matches_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "simplified_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          ai_confidence: number | null
          ai_metadata: Json | null
          ai_parse_id: string | null
          ai_parse_metadata: Json | null
          author: string | null
          content_blocks: Json | null
          content_type: string | null
          cook_time: number | null
          created_at: string | null
          creation_method: string | null
          description: string | null
          difficulty: string | null
          id: string
          images: string[] | null
          instructions_text: string | null
          is_public: boolean | null
          prep_time: number | null
          rating: number | null
          recipe_style: string | null
          recipe_tips: string[] | null
          servings: number | null
          tags: string[] | null
          title: string
          total_ratings: number | null
          updated_at: string | null
          use_rich_content: boolean | null
          user_id: string
        }
        Insert: {
          ai_confidence?: number | null
          ai_metadata?: Json | null
          ai_parse_id?: string | null
          ai_parse_metadata?: Json | null
          author?: string | null
          content_blocks?: Json | null
          content_type?: string | null
          cook_time?: number | null
          created_at?: string | null
          creation_method?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          images?: string[] | null
          instructions_text?: string | null
          is_public?: boolean | null
          prep_time?: number | null
          rating?: number | null
          recipe_style?: string | null
          recipe_tips?: string[] | null
          servings?: number | null
          tags?: string[] | null
          title: string
          total_ratings?: number | null
          updated_at?: string | null
          use_rich_content?: boolean | null
          user_id: string
        }
        Update: {
          ai_confidence?: number | null
          ai_metadata?: Json | null
          ai_parse_id?: string | null
          ai_parse_metadata?: Json | null
          author?: string | null
          content_blocks?: Json | null
          content_type?: string | null
          cook_time?: number | null
          created_at?: string | null
          creation_method?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          images?: string[] | null
          instructions_text?: string | null
          is_public?: boolean | null
          prep_time?: number | null
          rating?: number | null
          recipe_style?: string | null
          recipe_tips?: string[] | null
          servings?: number | null
          tags?: string[] | null
          title?: string
          total_ratings?: number | null
          updated_at?: string | null
          use_rich_content?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      sp_users: {
        Row: {
          created_at: string | null
          district_id: string | null
          email: string
          id: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          district_id?: string | null
          email: string
          id: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          district_id?: string | null
          email?: string
          id?: string
          role?: string | null
        }
        Relationships: []
      }
      spb_districts: {
        Row: {
          admin_email: string | null
          created_at: string | null
          id: string
          is_public: boolean | null
          logo_url: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          admin_email?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          logo_url?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          admin_email?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      spb_goals: {
        Row: {
          created_at: string | null
          description: string | null
          district_id: string
          goal_number: string
          id: string
          level: number | null
          order_position: number | null
          parent_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          district_id: string
          goal_number: string
          id?: string
          level?: number | null
          order_position?: number | null
          parent_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          district_id?: string
          goal_number?: string
          id?: string
          level?: number | null
          order_position?: number | null
          parent_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spb_goals_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "spb_districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spb_goals_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "spb_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      spb_metrics: {
        Row: {
          created_at: string | null
          current_value: number | null
          data_points: Json | null
          data_source: string | null
          display_order: number | null
          goal_id: string
          id: string
          is_primary: boolean | null
          metric_type: string | null
          name: string
          target_value: number | null
          timeframe_end: number | null
          timeframe_start: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          data_points?: Json | null
          data_source?: string | null
          display_order?: number | null
          goal_id: string
          id?: string
          is_primary?: boolean | null
          metric_type?: string | null
          name: string
          target_value?: number | null
          timeframe_end?: number | null
          timeframe_start?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          data_points?: Json | null
          data_source?: string | null
          display_order?: number | null
          goal_id?: string
          id?: string
          is_primary?: boolean | null
          metric_type?: string | null
          name?: string
          target_value?: number | null
          timeframe_end?: number | null
          timeframe_start?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spb_metrics_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "spb_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_photo_api_calls: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          provider: string
          query: string
          response_time_ms: number | null
          result_count: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          provider: string
          query: string
          response_time_ms?: number | null
          result_count?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          provider?: string
          query?: string
          response_time_ms?: number | null
          result_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      stock_photo_daily_stats: {
        Row: {
          api_calls: number | null
          cache_hits: number | null
          created_at: string | null
          date: string
          new_photos_added: number | null
          total_searches: number | null
          unique_users: number | null
          updated_at: string | null
        }
        Insert: {
          api_calls?: number | null
          cache_hits?: number | null
          created_at?: string | null
          date: string
          new_photos_added?: number | null
          total_searches?: number | null
          unique_users?: number | null
          updated_at?: string | null
        }
        Update: {
          api_calls?: number | null
          cache_hits?: number | null
          created_at?: string | null
          date?: string
          new_photos_added?: number | null
          total_searches?: number | null
          unique_users?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stock_photo_searches: {
        Row: {
          created_at: string | null
          id: string
          query: string
          result_count: number | null
          selected_photo_id: string | null
          source: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          query: string
          result_count?: number | null
          selected_photo_id?: string | null
          source: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          query?: string
          result_count?: number | null
          selected_photo_id?: string | null
          source?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_photo_searches_selected_photo_id_fkey"
            columns: ["selected_photo_id"]
            isOneToOne: false
            referencedRelation: "recipe_image_library"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      cache_effectiveness: {
        Row: {
          cache_hit_rate: number | null
          date: string | null
          total_searches: number | null
        }
        Relationships: []
      }
      popular_search_queries: {
        Row: {
          avg_results: number | null
          last_searched: string | null
          query: string | null
          search_count: number | null
        }
        Relationships: []
      }
      recipes_with_content: {
        Row: {
          author: string | null
          content_blocks: Json | null
          cook_time: number | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          display_blocks: Json | null
          id: string | null
          images: string[] | null
          is_public: boolean | null
          prep_time: number | null
          rating: number | null
          recipe_style: string | null
          recipe_tips: string[] | null
          servings: number | null
          tags: string[] | null
          title: string | null
          total_ratings: number | null
          updated_at: string | null
          use_rich_content: boolean | null
          user_id: string | null
        }
        Insert: {
          author?: string | null
          content_blocks?: Json | null
          cook_time?: number | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          display_blocks?: never
          id?: string | null
          images?: string[] | null
          is_public?: boolean | null
          prep_time?: number | null
          rating?: number | null
          recipe_style?: string | null
          recipe_tips?: string[] | null
          servings?: number | null
          tags?: string[] | null
          title?: string | null
          total_ratings?: number | null
          updated_at?: string | null
          use_rich_content?: boolean | null
          user_id?: string | null
        }
        Update: {
          author?: string | null
          content_blocks?: Json | null
          cook_time?: number | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          display_blocks?: never
          id?: string | null
          images?: string[] | null
          is_public?: boolean | null
          prep_time?: number | null
          rating?: number | null
          recipe_style?: string | null
          recipe_tips?: string[] | null
          servings?: number | null
          tags?: string[] | null
          title?: string | null
          total_ratings?: number | null
          updated_at?: string | null
          use_rich_content?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      simplified_recipes: {
        Row: {
          cook_time: number | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          id: string | null
          images: string[] | null
          ingredients: Json | null
          is_public: boolean | null
          prep_time: number | null
          rating: number | null
          servings: number | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      find_similar_stock_images: {
        Args: { limit_count?: number; search_keywords: string[] }
        Returns: {
          id: string
          image_url: string
          match_count: number
          photographer_name: string
        }[]
      }
      get_provider_stats_today: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg_response_time: number
          call_count: number
          error_count: number
          provider: string
        }[]
      }
      migrate_recipe_to_blocks: {
        Args: { recipe_id: string }
        Returns: Json
      }
      track_stock_photo_api_call: {
        Args: {
          p_error_message?: string
          p_provider: string
          p_query: string
          p_response_time_ms?: number
          p_result_count: number
          p_user_id: string
        }
        Returns: string
      }
      track_stock_photo_search: {
        Args: {
          p_query: string
          p_result_count: number
          p_selected_photo_id?: string
          p_source: string
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
