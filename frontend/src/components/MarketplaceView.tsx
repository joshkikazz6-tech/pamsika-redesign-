import React, { useState } from 'react';
import { Product } from '../types';
import { ProductDetailModal } from './ProductDetailModal';
import { SmartRecommendationFeed } from './SmartRecommendationFeed';
import { trackProductView } from '../lib/recommendationEngine';

interface MarketplaceViewProps {
  products: Product[];
  wishlistIds: string[];
  initialCategory?: string;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onShowToast: (msg: string) => void;
  onOrderNow?: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  products,
  wishlistIds,
  initialCategory,
  onToggleWishlist,
  onAddToCart,
  onShowToast,
  onOrderNow,
  onViewProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);

  const activeModalProduct = selectedProductModal
    ? products.find((p) => p.id === selectedProductModal.id) || selectedProductModal
    : null;

  const categories = ['All', 'Footwear', 'Fashion', 'Luxury Bags', 'Timepieces', 'Electronics', 'Automobiles', 'Home Decor'];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const handleCopyLink = (productName: string) => {
    navigator.clipboard?.writeText(window.location.href);
    onShowToast(`Copied link for "${productName}" to clipboard!`);
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
      onShowToast(`Downloading image for "${productName}"...`);
    } catch {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.target = '_blank';
      a.download = `${productName}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      onShowToast(`Opened image for "${productName}"`);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto px-4 py-4 pb-28">
      {/* Category Filter Bar */}
      <div className="overflow-x-auto no-scrollbar py-3 flex gap-2 mb-6">
        {categories.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full font-semibold text-xs whitespace-nowrap transition-all shadow-sm cursor-pointer ${
                isSelected
                  ? 'bg-[#6d28d9] text-white shadow-purple-500/20 shadow-md'
                  : 'bg-[#eeedf7] dark:bg-zinc-900 text-[#4a4455] dark:text-zinc-200 hover:text-[#6d28d9] dark:hover:text-white'
              }`}
            >
              {cat === 'All' ? 'All Collections' : cat}
            </button>
          );
        })}
      </div>

      {/* Product List / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
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
                      onShowToast(`Added "${product.name}" to your cart!`);
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
                    onClick={() => {
                      if (onViewProduct) {
                        onViewProduct(product);
                      } else {
                        trackProductView(product);
                      }
                      setSelectedProductModal(product);
                    }}
                    className="flex items-center gap-1 font-semibold hover:text-[#6d28d9] transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">info</span> VIEW
                  </button>
                  <button
                    onClick={() => handleCopyLink(product.name)}
                    className="flex items-center gap-1 font-semibold hover:text-[#6d28d9] transition-colors"
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

      {/* Algorithmic Smart Recommendation Feed */}
      <SmartRecommendationFeed
        products={products}
        wishlistIds={wishlistIds}
        cartProductIds={[]}
        onAddToCart={onAddToCart}
        onToggleWishlist={onToggleWishlist}
        onSelectProduct={(p) => {
          if (onViewProduct) {
            onViewProduct(p);
          } else {
            trackProductView(p);
          }
          setSelectedProductModal(p);
        }}
        onOrderNow={(p) => {
          if (onOrderNow) {
            onOrderNow(p);
          } else {
            onAddToCart(p);
          }
        }}
        onShowToast={onShowToast}
      />

      {/* Full-Screen Product Detail Modal */}
      <ProductDetailModal
        product={activeModalProduct}
        onClose={() => setSelectedProductModal(null)}
        onAddToCart={onAddToCart}
        onToggleWishlist={onToggleWishlist}
        isWishlisted={selectedProductModal ? wishlistIds.includes(selectedProductModal.id) : false}
        onShowToast={onShowToast}
        onOrderNow={onOrderNow}
      />
    </div>
  );
};
