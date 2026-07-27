import { Product } from '../types';

export interface UserPreferences {
  categoryViews: Record<string, number>;
  productViews: Record<string, number>;
  searchQueries: string[];
  lastInteractedCategory?: string;
  totalViewsCount: number;
}

const STORAGE_KEY = 'pamsika_user_smart_prefs_v1';

export const loadUserPreferences = (): UserPreferences => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load user smart preferences:', e);
  }
  return {
    categoryViews: {
      Electronics: 2,
      Footwear: 2,
      'Luxury Bags': 1,
    },
    productViews: {},
    searchQueries: [],
    totalViewsCount: 5,
  };
};

export const saveUserPreferences = (prefs: UserPreferences): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save user smart preferences:', e);
  }
};

export const trackProductView = (product: Product): UserPreferences => {
  const prefs = loadUserPreferences();
  
  // Increment category views
  prefs.categoryViews[product.category] = (prefs.categoryViews[product.category] || 0) + 1;
  
  // Increment product view
  prefs.productViews[product.id] = (prefs.productViews[product.id] || 0) + 1;
  
  prefs.lastInteractedCategory = product.category;
  prefs.totalViewsCount += 1;

  saveUserPreferences(prefs);
  return prefs;
};

export const trackSearchQuery = (query: string): UserPreferences => {
  if (!query || query.trim().length < 2) return loadUserPreferences();
  
  const prefs = loadUserPreferences();
  const cleanQuery = query.trim().toLowerCase();
  
  if (!prefs.searchQueries.includes(cleanQuery)) {
    prefs.searchQueries = [cleanQuery, ...prefs.searchQueries.slice(0, 9)];
  }
  saveUserPreferences(prefs);
  return prefs;
};

export interface RecommendedProduct {
  product: Product;
  score: number;
  reason: string;
  badgeType: 'algorithm' | 'trending' | 'frequently_viewed' | 'category_match';
}

export const getSmartRecommendations = (
  allProducts: Product[],
  limit: number = 6,
  wishlistIds: string[] = [],
  cartProductIds: string[] = []
): RecommendedProduct[] => {
  const prefs = loadUserPreferences();
  
  // Determine top category from views
  const sortedCategories = Object.entries(prefs.categoryViews).sort((a, b) => Number(b[1]) - Number(a[1]));
  const topCategory = sortedCategories[0]?.[0];

  const scored = allProducts.map((product) => {
    let score = 0;
    let primaryReason = '⭐ Trending on Pamsika';
    let badgeType: RecommendedProduct['badgeType'] = 'trending';

    // 1. Direct product view count weight
    const viewCount = prefs.productViews[product.id] || 0;
    if (viewCount > 0) {
      score += viewCount * 8;
      primaryReason = `👀 Frequently viewed by you (${viewCount}x)`;
      badgeType = 'frequently_viewed';
    }

    // 2. Category view weight
    const catViews = prefs.categoryViews[product.category] || 0;
    if (catViews > 0) {
      score += catViews * 4;
      if (viewCount === 0 && product.category === topCategory) {
        primaryReason = `🔥 Top pick based on your interest in ${product.category}`;
        badgeType = 'category_match';
      }
    }

    // 3. Wishlist and Cart Category synergy
    if (wishlistIds.includes(product.id)) {
      score += 15;
    }
    if (cartProductIds.includes(product.id)) {
      score += 20;
    }

    // Wishlist/Cart category halo effect
    const wishlistedProducts = allProducts.filter((p) => wishlistIds.includes(p.id));
    if (wishlistedProducts.some((p) => p.category === product.category)) {
      score += 6;
      if (viewCount === 0 && badgeType === 'trending') {
        primaryReason = `❤️ Related to items in your Wishlist`;
        badgeType = 'category_match';
      }
    }

    // 4. Search queries matching product name/category/description
    if (prefs.searchQueries.length > 0) {
      const matchSearch = prefs.searchQueries.some(
        (q) =>
          product.name.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q)
      );
      if (matchSearch) {
        score += 12;
        if (badgeType === 'trending') {
          primaryReason = `🎯 Matches your recent searches`;
          badgeType = 'algorithm';
        }
      }
    }

    // 5. Popularity baseline score
    score += (product.rating || 4.5) * 2;
    score += (product.viewsCount || 100) / 100;

    // 6. Dynamic Reload Session Entropy (Simulates FB/YouTube Feed Refresh on each page load)
    const reloadJitter = Math.random() * 8;
    score += reloadJitter;

    if (score > 15 && badgeType === 'trending') {
      primaryReason = `🤖 Algorithm Match (${Math.round(score)}% Score)`;
      badgeType = 'algorithm';
    }

    return {
      product,
      score,
      reason: primaryReason,
      badgeType,
    };
  });

  // Sort descending by score
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
};
