// ─── Marketplace ───────────────────────────────────────────────────────────

/** status codes returned by the API */
export type MarketStatus = 1 | 2 | 3 | 4 | 5|6|7|8|9|10|11|12|13|14|15;

export interface MarketCategory {
  id: string;
  name: string;
}

/** Shape returned in the list endpoint GET /v1/admin/marketplace */
export interface Market {
  id: string;
  title: string;
  displayImageUrl: string;
  categoryId: string;
  resolutionTime: string;
  createdAt: string;
  status: MarketStatus;
  category: MarketCategory;
}

/** Token within an option group (from fetchSpecific) */
export interface MarketToken {
  id: string;
  title: string;
  volume: number;
}

export interface MarketOptionGroup {
  id: string;
  title: string;
  tokens: MarketToken[];
}

/** Full market detail returned by GET /v1/admin/marketplace/fetchSpecific */
export interface MarketDetail extends Market {
  description: string;
  optionGroups: MarketOptionGroup[];
}

export type MarketAnswer = 0 | 1;

export interface ProposeResponseRequest {
  marketId: string;
  answer: MarketAnswer;
}

export interface ProposeResponseData {
  marketId?: string;
  answer?: MarketAnswer;
  status?: MarketStatus;
  resolvedAt?: string;
  [key: string]: unknown;
}

/** Body for POST /v1/marketplace */
export interface MarketCreateRequest {
  categoryId: string;
  title: string;
  description: string;
  resolutionTime: string;  // ISO date string
  displayImageUrl: string;
}

/** Query params for list endpoint */
export interface MarketListParams {
  limit?: number;
  page?: number;
  sortKey?: string;
  sortDirection?: 'ASC' | 'DESC';
}


// ─── Category ──────────────────────────────────────────────────────────────

/** Shape returned by GET /v1/admin/categories */
export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface CategoryCreateRequest {
  name: string;
}

export interface CategoryUpdateRequest {
  name: string;
}

export interface CategoryDeleteRequest {
  categoryIds: string[];
}

export interface CategoryListParams {
  limit?: number;
  page?: number;
  sortKey?: string;
  sortDirection?: 'ASC' | 'DESC';
}

// ─── Market Outcome ────────────────────────────────────────────────────────

export interface MarketOutcome {
  id: string;
  market_id: string;
  title: string;
  display_order: number;
  current_price: number;
  is_winning: boolean;
  created_at: string;
}

export type MarketOutcomeInsert = {
  market_id: string;
  title: string;
  display_order: number;
  current_price: number;
};
