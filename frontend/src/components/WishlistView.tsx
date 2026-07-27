import React, { useState } from 'react';
import { Product } from '../types';
import { ProductDetailModal } from './ProductDetailModal';

interface WishlistViewProps {
  products: Product[];
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onNavigate: (view: string) => void;
  onShowToast: (msg: string) => void;
  onOrderNow?: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  products,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onNavigate,
  onShowToast,
  onOrderNow,
  onViewProduct,
}) => {
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));

  const activeModalProduct = selectedProductModal
    ? products.find((p) => p.id === selectedProductModal.id) || selectedProductModal
    : null;

  const handleShareList = () => {
    navigator.clipboard?.writeText(window.location.href);
    onShowToast('Wishlist link copied to clipboard!');
  };

  if (wishlistedProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center max-w-md mx-auto py-12">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-[#5300b7]/10 rounded-full animate-pulse"></div>
          <div className="absolute inset-2 bg-[#5300b7]/20 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[#5300b7] text-4xl">favorite</span>
          </div>
        </div>
        <h2 className="font-serif-source text-2xl font-bold text-[#121c2a] mb-2">No saved items yet</h2>
        <p className="text-[#4a4455] text-sm mb-8 max-w-[280px]">
          Explore our exclusive collection and save your favorites here for later.
        </p>
        <button
          onClick={() => onNavigate('marketplace')}
          className="px-8 py-3.5 bg-[#5300b7] hover:bg-[#6d28d9] text-white rounded-full font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">explore</span>
          Discover Products
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 py-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold text-[#5300b7] uppercase tracking-widest">WISHLIST</p>
          <h2 className="font-serif-source text-2xl font-bold text-[#121c2a]">
            {wishlistedProducts.length} Items Reserved
          </h2>
        </div>
        <button
          onClick={handleShareList}
          className="flex items-center gap-2 px-4 py-2 bg-[#eeedf7] hover:bg-[#e3e1ec] rounded-full text-xs font-bold text-[#5300b7] transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">share</span>
          Share List
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {wishlistedProducts.map((product) => (
          <div
            key={product.id}
            className="group relative flex flex-col bg-[#eeedf7] rounded-2xl overflow-hidden shadow-sm border border-[#ccc3d7]/30"
          >
            <div
              onClick={() => {
                if (onViewProduct) onViewProduct(product);
                setSelectedProductModal(product);
              }}
              className="relative aspect-square overflow-hidden bg-[#e8e7f1] cursor-pointer group/img"
              title="Click image to open full screen photo gallery"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[28px] opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/50 p-2 rounded-full backdrop-blur-sm">
                  zoom_in
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWishlist(product.id);
                  onShowToast(`Removed "${product.name}" from wishlist`);
                }}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-full text-[#ba1a1a] hover:bg-white transition-colors shadow-sm z-10"
                title="Remove from wishlist"
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  favorite
                </span>
              </button>
            </div>

            <div className="p-3 flex flex-col flex-1 gap-1">
              <span className="text-[10px] font-bold text-[#7b7486] uppercase">
                {product.category}
              </span>
              <h3 className="font-bold text-sm text-[#121c2a] truncate">
                {product.name}
              </h3>
              <p className="font-bold text-[#5300b7] text-base mt-auto">
                MWK {product.price.toLocaleString()}
              </p>
              <button
                onClick={() => {
                  if (onOrderNow) {
                    onOrderNow(product);
                  } else {
                    onAddToCart(product);
                    onShowToast(`Added "${product.name}" to cart!`);
                  }
                }}
                className="mt-2 w-full py-2 bg-[#5300b7] hover:bg-[#6d28d9] text-white rounded-xl font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-transform shadow-sm cursor-pointer"
              >
                Deal Now
              </button>
            </div>
          </div>
        ))}
      </div>

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
