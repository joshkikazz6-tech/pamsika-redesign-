import React, { useState } from 'react';
import { Product } from '../types';
import { ProductDetailModal } from './ProductDetailModal';
import { SmartRecommendationFeed } from './SmartRecommendationFeed';
import { trackProductView } from '../lib/recommendationEngine';

interface HomeViewProps {
  products: Product[];
  feedProducts?: Product[];
  onRefreshFeed?: () => void | Promise<void>;
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onNavigate: (view: string, filterCategory?: string) => void;
  searchQuery: string;
  onShowToast?: (msg: string) => void;
  onOrderNow?: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  feedProducts,
  onRefreshFeed,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onNavigate,
  searchQuery,
  onShowToast,
  onOrderNow,
  onViewProduct,
}) => {
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);

  const activeModalProduct = selectedProductModal
    ? products.find((p) => p.id === selectedProductModal.id) ||
      (feedProducts || []).find((p) => p.id === selectedProductModal.id) ||
      selectedProductModal
    : null;

  const categories = [
    { name: 'Automobiles', icon: 'directions_car' },
    { name: 'Fashion', icon: 'apparel' },
    { name: 'Real Estate', icon: 'apartment' },
    { name: 'Electronics', icon: 'devices' },
    { name: 'Others', icon: 'more_horiz' }
  ];

  // The dynamic discovery feed (personalized/trending/new/random, sourced
  // from the backend) drives the default homepage view. An active search
  // query still searches the full catalog, since that's an explicit user
  // intent that should override the discovery feed. Falls back to the
  // full catalog if the feed hasn't loaded yet, so the homepage is never
  // empty on first paint.
  const discoveryProducts = feedProducts && feedProducts.length > 0 ? feedProducts : products;

  const filteredProducts = products.filter((p) => {
    if (!searchQuery) return true;
    return p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           p.category.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const displayProducts = searchQuery ? filteredProducts : discoveryProducts;

  const handleCopyLink = (productName: string) => {
    navigator.clipboard?.writeText(window.location.href);
    if (onShowToast) {
      onShowToast(`Copied link for "${productName}" to clipboard!`);
    }
  };

  const handleDownloadImage = async (imageUrl: string, productName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const sanitizedName = productName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      a.download = `${sanitizedName}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      if (onShowToast) {
        onShowToast(`Downloading image for "${productName}"...`);
      }
    } catch {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.target = '_blank';
      a.download = `${productName}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (onShowToast) {
        onShowToast(`Opened image for "${productName}"`);
      }
    }
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto px-4 py-4 pb-24">
      {/* Hero Banner Section */}
      <section className="relative mb-8">
        <div className="relative h-[220px] md:h-[280px] rounded-2xl overflow-hidden flex items-center bg-[#e3e1ec] shadow-lg">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuD_e_tqTx0_D8kvJ1y2RnvSDhjpIoiZrlpH-gAMlUQPs-uLHDGDGU7I-jovUbgUplxvVoQ42N6jWXDCmMeXd_rQP5Yuw5FXb98X8-HZlBRMYcFb5XfKcb7AHH1vR7Z0HGUxSkClf-yUeikqzMGf9w_bjlKPO59G1eMnAgRoGf2PPX_lvOCnHNefofIgH8Wu1P08Albj1LR_oh_x0qpOiev5MI70v2WPgVsm6XKYMymOcChau83-RIfQdYsu-O7OOIN43JSRRPF2o_g')`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a1b22]/90 via-[#1a1b22]/60 to-transparent" />
          <div className="relative z-10 pl-6 pr-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-[2px] bg-[#d3bbff]"></span>
              <span className="text-[#d3bbff] font-semibold uppercase tracking-widest text-[11px]">
                Exclusive
              </span>
            </div>
            <h1 className="font-garamond text-3xl md:text-5xl text-white mb-2 leading-tight">
              Malawi's <span className="text-[#d3bbff]">Premium</span>
              <br />
              Marketplace
            </h1>
            <p className="text-[#e3e1ec] text-xs md:text-sm max-w-[220px] leading-snug mb-4">
              Your all-in-one trusted marketplace in the heart of Malawi.
            </p>
            <button
              onClick={() => onNavigate('marketplace')}
              className="bg-[#5300b7] hover:bg-[#6d28d9] text-white text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Explore All</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Categories Horizontal Scroll */}
      <section className="mb-8">
        <div className="mb-4 flex justify-between items-end">
          <h2 className="font-garamond text-2xl font-bold text-[#1a1b22]">Categories</h2>
          <button
            onClick={() => onNavigate('marketplace')}
            className="text-[#5300b7] text-sm font-semibold hover:underline cursor-pointer"
          >
            View all
          </button>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onNavigate('marketplace', cat.name)}
              className="flex flex-col items-center gap-2 shrink-0 group focus:outline-none cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-[#e8e7f1] flex items-center justify-center border border-[#ccc3d7]/30 group-hover:bg-[#5300b7] group-hover:text-white group-active:scale-95 transition-all shadow-sm">
                <span className="material-symbols-outlined text-[#5300b7] group-hover:text-white transition-colors">
                  {cat.icon}
                </span>
              </div>
              <span className="text-xs font-medium text-[#4a4455] group-hover:text-[#5300b7]">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="mb-8">
        <div className="grid grid-cols-3 gap-2 bg-[#f4f2fd] rounded-2xl p-4 border border-[#ccc3d7]/30 shadow-sm">
          <div className="flex flex-col items-center text-center gap-1">
            <span className="material-symbols-outlined text-[#5300b7] text-[22px]">account_balance_wallet</span>
            <span className="text-[#1a1b22] text-xs font-semibold">5% Commission</span>
          </div>
          <div className="flex flex-col items-center text-center gap-1 border-x border-[#ccc3d7]/30">
            <span className="material-symbols-outlined text-[#5300b7] text-[22px]">location_city</span>
            <span className="text-[#1a1b22] text-xs font-semibold">4 Major Cities</span>
          </div>
          <div className="flex flex-col items-center text-center gap-1">
            <span className="material-symbols-outlined text-[#5300b7] text-[22px]">verified</span>
            <span className="text-[#1a1b22] text-xs font-semibold">100% Trusted</span>
          </div>
        </div>
      </section>

      {/* Featured Product Grid - Marketplace Card Style */}
      <section className="mb-8">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="font-garamond text-2xl font-bold text-[#1a1b22]">Featured Products</h2>
          <button
            onClick={() => onNavigate('marketplace')}
            className="p-2 bg-[#e8e7f1] rounded-lg border border-[#ccc3d7]/30 text-[#4a4455] hover:text-[#5300b7] flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">storefront</span>
            <span>All Products</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProducts.map((product) => {
            const isWishlisted = wishlistIds.includes(product.id);
            return (
              <div
                key={product.id}
                className="group relative bg-[#eeedf7] rounded-2xl overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-[#ccc3d7]/30 flex flex-col"
              >
                {/* Image Header - Clickable for Full Screen Gallery View */}
                <div
                  onClick={() => {
                    if (onViewProduct) {
                      onViewProduct(product);
                    } else {
                      trackProductView(product);
                    }
                    setSelectedProductModal(product);
                  }}
                  className="relative aspect-square w-full overflow-hidden bg-[#e8e7f1] cursor-pointer group/img"
                  title="Click image to open full screen photo gallery"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[32px] opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/50 p-2 rounded-full backdrop-blur-sm">
                      zoom_in
                    </span>
                  </div>
                  {product.badge && (
                    <div className="absolute top-4 left-4 bg-[#ba1a1a] text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider shadow-md uppercase pointer-events-none">
                      {product.badge}
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(product.id);
                    }}
                    className="absolute top-4 right-4 w-9 h-9 bg-white/70 dark:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-[#1a1b22] dark:text-white hover:text-[#6d28d9] transition-colors shadow-sm cursor-pointer z-10"
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] ${
                        isWishlisted ? 'text-[#ba1a1a]' : ''
                      }`}
                      style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      favorite
                    </span>
                  </button>
                </div>

                {/* Card Body */}
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-[10px] font-bold text-[#7b7486] uppercase tracking-[0.2em] mb-1">
                    {product.category}
                  </p>
                  <h3 className="font-playfair text-xl font-bold text-[#1a1b22] mb-2 line-clamp-1">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between mb-4">
                    <span className="font-playfair text-[#6d28d9] text-2xl font-bold">
                      MWK {product.price.toLocaleString()}
                    </span>
                    <div className="flex gap-3 items-center text-[#4a4455] text-xs">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">visibility</span>
                        <span>{(product.viewsCount ?? 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#059669]">
                        <span className="material-symbols-outlined text-[15px]">payments</span>
                        <span>
                          MWK {Math.round((product.price * (product.commission || 5)) / 100).toLocaleString()} ({product.commission || 5}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => {
                        if (onOrderNow) {
                          onOrderNow(product);
                        } else {
                          onAddToCart(product);
                        }
                      }}
                      className="flex-1 bg-[#6d28d9] hover:bg-[#5300b7] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">handshake</span> DEAL NOW
                    </button>
                    <button
                      onClick={() => {
                        onAddToCart(product);
                        if (onShowToast) {
                          onShowToast(`Added "${product.name}" to your cart!`);
                        }
                      }}
                      className="w-12 h-12 bg-[#e3e1ec] text-[#6d28d9] rounded-xl flex items-center justify-center hover:bg-[#6d28d9] hover:text-white transition-all shadow-sm cursor-pointer"
                      title="Add to Cart"
                    >
                      <span className="material-symbols-outlined">add_shopping_cart</span>
                    </button>
                  </div>

                  {/* Secondary Quick Utilities */}
                  <div className="flex justify-between items-center pt-3 border-t border-[#ccc3d7]/30 text-xs text-[#4a4455]">
                    <button
                      onClick={() => setSelectedProductModal(product)}
                      className="flex items-center gap-1 font-semibold hover:text-[#6d28d9] transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">info</span> VIEW
                    </button>
                    <button
                      onClick={() => handleCopyLink(product.name)}
                      className="flex items-center gap-1 font-semibold hover:text-[#6d28d9] transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">content_copy</span> COPY
                    </button>
                    <button
                      onClick={() => handleDownloadImage(product.image, product.name)}
                      className="flex items-center gap-1 font-semibold hover:text-[#6d28d9] transition-colors cursor-pointer"
                      title="Download Product Image"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span> SAVE
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Algorithmic Smart Recommendation Feed (Facebook/YouTube style personalization) */}
      <SmartRecommendationFeed
        products={discoveryProducts}
        wishlistIds={wishlistIds}
        cartProductIds={[]}
        onAddToCart={onAddToCart}
        onToggleWishlist={onToggleWishlist}
        onSelectProduct={(p) => {
          trackProductView(p);
          setSelectedProductModal(p);
        }}
        onOrderNow={(p) => {
          if (onOrderNow) {
            onOrderNow(p);
          } else {
            onAddToCart(p);
          }
        }}
        onShowToast={(msg) => onShowToast && onShowToast(msg)}
        onRefresh={onRefreshFeed}
      />

      {/* Community CTA */}
      <section className="pb-8">
        <div className="p-6 md:p-8 bg-[#e8e7f1] rounded-2xl flex flex-col items-center text-center border border-[#ccc3d7]/40 border-dashed">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm">
            <span className="material-symbols-outlined text-[#5300b7] text-[30px]">diversity_3</span>
          </div>
          <h4 className="font-garamond text-2xl font-bold text-[#1a1b22] mb-1">
            Join the Community
          </h4>
          <p className="text-[#4a4455] text-xs md:text-sm mb-5 max-w-md">
            Connect with thousands of buyers, local artisans, and trusted sellers across Malawi.
          </p>
          <button
            onClick={() => onNavigate('community')}
            className="px-6 py-2.5 rounded-full border-2 border-[#5300b7] text-[#5300b7] font-semibold text-xs hover:bg-[#5300b7] hover:text-white transition-all shadow-sm cursor-pointer"
          >
            Explore Community
          </button>
        </div>
      </section>

      {/* Full-Screen Product Detail Modal */}
      <ProductDetailModal
        product={activeModalProduct}
        onClose={() => setSelectedProductModal(null)}
        onAddToCart={onAddToCart}
        onToggleWishlist={onToggleWishlist}
        isWishlisted={selectedProductModal ? wishlistIds.includes(selectedProductModal.id) : false}
        onShowToast={(msg) => onShowToast && onShowToast(msg)}
        onOrderNow={onOrderNow}
      />
    </div>
  );
};

