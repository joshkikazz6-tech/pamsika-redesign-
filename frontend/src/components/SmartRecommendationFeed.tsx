import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import {
  getSmartRecommendations,
  loadUserPreferences,
  RecommendedProduct,
  UserPreferences,
} from '../lib/recommendationEngine';

interface SmartRecommendationFeedProps {
  products: Product[];
  wishlistIds: string[];
  cartProductIds: string[];
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onOrderNow: (product: Product) => void;
  onShowToast: (msg: string) => void;
}

export const SmartRecommendationFeed: React.FC<SmartRecommendationFeedProps> = ({
  products,
  wishlistIds,
  cartProductIds,
  onAddToCart,
  onToggleWishlist,
  onSelectProduct,
  onOrderNow,
  onShowToast,
}) => {
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [userPrefs, setUserPrefs] = useState<UserPreferences>(loadUserPreferences());
  const [activeFilter, setActiveFilter] = useState<'all' | 'category' | 'frequently'>('all');

  useEffect(() => {
    const prefs = loadUserPreferences();
    setUserPrefs(prefs);
    const recs = getSmartRecommendations(products, 8, wishlistIds, cartProductIds);
    setRecommendations(recs);
  }, [products, wishlistIds, cartProductIds]);

  const topCategories = Object.entries(userPrefs.categoryViews)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 3);

  const filteredRecommendations = recommendations.filter((item) => {
    if (activeFilter === 'category') return item.badgeType === 'category_match';
    if (activeFilter === 'frequently') return item.badgeType === 'frequently_viewed';
    return true;
  });

  const handleRefreshFeed = () => {
    const recs = getSmartRecommendations(products, 8, wishlistIds, cartProductIds);
    setRecommendations(recs);
    onShowToast('🔄 Smart feed refreshed with new product recommendations!');
  };

  return (
    <div className="bg-[#120e24] dark:bg-[#0a0a0a] text-white rounded-3xl p-5 sm:p-8 shadow-2xl border border-[#3b2a5c] dark:border-zinc-800 relative overflow-hidden my-8 transition-colors">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#5300b7]/20 dark:bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00e676]/10 dark:bg-white/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Section */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#00e676]/20 border border-[#00e676]/40 text-[#00e676] dark:text-[#00e676] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse"></span>
              Pamsika Recommendation Engine (AI Active)
            </span>
            <span className="text-xs text-white/60 hidden sm:inline">• Live Behavioral Analytics</span>
          </div>
          <h2 className="font-serif-source text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Recommended For You</span>
            <span className="material-symbols-outlined text-[#00e676] text-[28px]">psychology</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Personalized feed analyzing your browsing history, category interactions, and order preferences in real-time.
          </p>
        </div>

        {/* User Engagement Insights Pill & Manual Refresh */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <button
            onClick={handleRefreshFeed}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
            title="Reload Feed Algorithms"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            <span>Refresh Feed</span>
          </button>

          <div className="bg-white/5 border border-white/10 dark:border-zinc-800 p-3 rounded-2xl backdrop-blur-md shrink-0 flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-4 text-xs font-bold">
              <span className="text-slate-300 dark:text-zinc-400">Top Interests:</span>
              <span className="text-[#00e676] font-mono">{userPrefs.totalViewsCount} Views Logged</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {topCategories.length > 0 ? (
                topCategories.map(([cat, count]) => (
                  <span
                    key={cat}
                    className="bg-[#5300b7] dark:bg-zinc-800 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/20 dark:border-zinc-700"
                  >
                    {cat} ({count}x)
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-slate-400">Explore products to build your feed</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeFilter === 'all'
              ? 'bg-[#5300b7] text-white shadow-lg border border-white/20'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          ✨ All Smart Picks ({recommendations.length})
        </button>
        <button
          onClick={() => setActiveFilter('category')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeFilter === 'category'
              ? 'bg-[#5300b7] text-white shadow-lg border border-white/20'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          🎯 Favorite Categories
        </button>
        <button
          onClick={() => setActiveFilter('frequently')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeFilter === 'frequently'
              ? 'bg-[#5300b7] text-white shadow-lg border border-white/20'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          👀 Frequently Viewed
        </button>
      </div>

      {/* Recommended Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredRecommendations.map(({ product, reason }) => {
          const isWishlisted = wishlistIds.includes(product.id);
          return (
            <div
              key={product.id}
              className="bg-[#211836] border border-white/10 rounded-2xl overflow-hidden hover:border-[#00e676]/60 transition-all duration-300 flex flex-col group hover:-translate-y-1 shadow-lg"
            >
              {/* Image Banner */}
              <div
                onClick={() => onSelectProduct(product)}
                className="relative aspect-square w-full bg-black/40 overflow-hidden cursor-pointer"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Algorithmic Reason Pill */}
                <div className="absolute top-2 left-2 right-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#00e676] border border-[#00e676]/30 flex items-center gap-1 shadow-md truncate">
                  <span className="material-symbols-outlined text-[14px] shrink-0">auto_awesome</span>
                  <span className="truncate">{reason}</span>
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWishlist(product.id);
                  }}
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white hover:text-[#ba1a1a] flex items-center justify-center transition-colors cursor-pointer"
                  title="Toggle Wishlist"
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      isWishlisted ? 'text-[#ba1a1a]' : ''
                    }`}
                    style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    favorite
                  </span>
                </button>
              </div>

              {/* Body Content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {product.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5 text-slate-400 text-[11px]">
                        <span className="material-symbols-outlined text-[13px]">visibility</span>
                        <span>{(product.viewsCount ?? 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400 text-[11px] font-bold">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        <span>{product.rating || 4.8}</span>
                      </div>
                    </div>
                  </div>

                  <h3
                    onClick={() => onSelectProduct(product)}
                    className="font-bold text-sm text-white hover:text-[#00e676] transition-colors line-clamp-1 cursor-pointer"
                  >
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mt-1 gap-2 flex-wrap">
                    <p className="font-serif-source font-bold text-base text-[#00e676]">
                      MWK {product.price.toLocaleString()}
                    </p>
                    <span className="text-[10px] font-bold text-[#00e676] bg-[#00e676]/10 px-2 py-0.5 rounded-full border border-[#00e676]/30 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">payments</span>
                      MWK {Math.round((product.price * (product.commission || 5)) / 100).toLocaleString()} ({product.commission || 5}%)
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => onOrderNow(product)}
                    className="py-2 px-2 bg-[#5300b7] hover:bg-[#6d28d9] text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md active:scale-95"
                    title="Deal Now & Choose Order Channel"
                  >
                    <span className="material-symbols-outlined text-[16px]">handshake</span>
                    <span>Deal Now</span>
                  </button>

                  <button
                    onClick={() => {
                      onAddToCart(product);
                      onShowToast(`Added "${product.name}" to cart!`);
                    }}
                    className="py-2 px-2 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Add to Cart"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                    <span>Add Cart</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
