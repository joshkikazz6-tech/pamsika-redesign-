import React, { useState, useEffect } from 'react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  isWishlisted: boolean;
  onShowToast: (msg: string) => void;
  onOrderNow?: (product: Product) => void;
}

// Supplementary high quality gallery images by category
const CATEGORY_ANGLE_IMAGES: Record<string, string[]> = {
  Footwear: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1000&q=80',
  ],
  Fashion: [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1000&q=80',
  ],
  Electronics: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1000&q=80',
  ],
  'Luxury Bags': [
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80',
  ],
  Timepieces: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1000&q=80',
  ],
  Automobiles: [
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1000&q=80',
  ],
  'Real Estate': [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80',
  ]
};

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onShowToast,
  onOrderNow,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!product) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, currentImageIndex]);

  if (!product) return null;

  // Build image list
  const galleryImages: string[] =
    product.images && product.images.length > 0
      ? product.images
      : [
          product.image,
          ...(CATEGORY_ANGLE_IMAGES[product.category] || [
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
          ]),
        ];

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
    }
    setTouchStartX(null);
  };

  const handleDownloadActiveImage = async () => {
    const activeUrl = galleryImages[currentImageIndex];
    try {
      const response = await fetch(activeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const sanitizedName = `${product.name}_photo_${currentImageIndex + 1}`.toLowerCase().replace(/[^a-z0-9]/g, '_');
      a.download = `${sanitizedName}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      onShowToast(`Downloaded photo ${currentImageIndex + 1} for "${product.name}"`);
    } catch {
      const a = document.createElement('a');
      a.href = activeUrl;
      a.target = '_blank';
      a.download = `${product.name}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      onShowToast(`Opened image for "${product.name}"`);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    onShowToast(`Copied link for "${product.name}" to clipboard!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0814]/95 backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="h-16 px-4 sm:px-8 border-b border-white/10 flex items-center justify-between text-white bg-black/40 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[10px] font-bold bg-[#5300b7] text-white px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
            {product.category}
          </span>
          <h2 className="font-serif-source text-lg sm:text-xl font-bold truncate text-white">
            {product.name}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleWishlist(product.id)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer text-white flex items-center justify-center"
            title="Toggle Wishlist"
          >
            <span
              className={`material-symbols-outlined text-[24px] ${isWishlisted ? 'text-[#ba1a1a]' : ''}`}
              style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer flex items-center justify-center"
            title="Close Full Screen View"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>
      </div>

      {/* Main Full-Screen Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        {/* Left Interactive Image Canvas with Multi-Photo Controls */}
        <div
          className="flex-1 relative bg-black/60 flex flex-col items-center justify-center p-4 sm:p-8 min-h-[400px] lg:min-h-full select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main Display Image */}
          <div className="relative max-w-2xl max-h-[70vh] w-full h-full flex items-center justify-center">
            <img
              src={galleryImages[currentImageIndex]}
              alt={`${product.name} view ${currentImageIndex + 1}`}
              className="max-h-[65vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300"
            />
          </div>

          {/* Left Arrow Button */}
          <button
            onClick={handlePrevImage}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/70 hover:bg-[#5300b7] text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-xl active:scale-95"
            title="Previous Picture (Left Arrow)"
          >
            <span className="material-symbols-outlined text-[28px]">chevron_left</span>
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={handleNextImage}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/70 hover:bg-[#5300b7] text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-xl active:scale-95"
            title="Next Picture (Right Arrow)"
          >
            <span className="material-symbols-outlined text-[28px]">chevron_right</span>
          </button>

          {/* Picture Counter Floating Pill */}
          <div className="absolute top-6 left-6 bg-black/70 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#00e676]">photo_library</span>
            <span>
              Photo {currentImageIndex + 1} of {galleryImages.length}
            </span>
          </div>

          {/* Thumbnail Strip for Direct Photo Selection */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 max-w-[90%] overflow-x-auto no-scrollbar">
            {galleryImages.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                  currentImageIndex === idx
                    ? 'border-[#00e676] scale-110 shadow-lg'
                    : 'border-white/20 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Info & Purchasing Panel */}
        <div className="w-full lg:w-[420px] bg-white p-6 sm:p-8 flex flex-col justify-between overflow-y-auto text-[#1d1a24] shrink-0 border-t lg:border-t-0 lg:border-l border-white/10">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#5300b7] uppercase tracking-widest bg-[#f3ebf9] px-3 py-1 rounded-full">
                  {product.category}
                </span>
                {product.badge && (
                  <span className="bg-[#ba1a1a] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {product.badge}
                  </span>
                )}
              </div>

              <h1 className="font-serif-source text-2xl sm:text-3xl font-bold text-[#1d1a24] leading-tight mt-1">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mt-3 text-xs text-[#4a4455]">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <span className="material-symbols-outlined text-[16px]">star</span>
                  <span>{product.rating || 4.8}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  <span>{(product.viewsCount ?? 0).toLocaleString()} Views</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1 text-emerald-600 font-bold">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>In Stock ({product.stock || 12})</span>
                </div>
              </div>
            </div>

            {/* Price Card */}
            <div className="bg-[#fef7ff] p-4 rounded-2xl border border-[#ebddff] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#7b7486] uppercase tracking-wider block">
                  Price
                </span>
                <span className="font-serif-source text-2xl font-bold text-[#5300b7]">
                  MWK {product.price.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-[#7b7486] uppercase tracking-wider block">
                  Commission
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full inline-block mt-0.5">
                  MWK {Math.round((product.price * (product.commission || 5)) / 100).toLocaleString()} ({product.commission || 5}%)
                </span>
              </div>
            </div>

            {/* Product Description */}
            <div>
              <h4 className="text-xs font-bold text-[#1d1a24] uppercase tracking-wider mb-1.5">
                Product Details
              </h4>
              <p className="text-xs sm:text-sm text-[#4a4455] leading-relaxed">
                {product.description ||
                  'High quality, authentic product sourced directly from verified Malawian artisans and merchants.'}
              </p>
            </div>

            {/* Merchant Info */}
            <div className="p-3.5 bg-[#f8f6fc] rounded-2xl border border-[#ccc3d7]/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#5300b7] text-white flex items-center justify-center font-bold text-sm shrink-0">
                <span className="material-symbols-outlined text-[20px]">store</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-[#1d1a24] truncate">
                    {product.sellerName || 'Verified Merchant Store'}
                  </p>
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                </div>
                <p className="text-[10px] text-[#4a4455]">Malawi Verified Merchant • 100% Quality Guaranteed</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-6 border-t border-[#ccc3d7]/30 mt-6">
            <button
              onClick={() => {
                if (onOrderNow && product) {
                  onOrderNow(product);
                } else {
                  onAddToCart(product);
                }
                onClose();
              }}
              className="w-full bg-[#5300b7] hover:bg-[#6d28d9] text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">handshake</span>
              <span>Deal Now (Order Methods)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadActiveImage}
                className="py-2.5 px-3 bg-[#f3ebf9] hover:bg-[#e8def8] text-[#5300b7] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Download current photo"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Save Image</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="py-2.5 px-3 bg-[#f3ebf9] hover:bg-[#e8def8] text-[#5300b7] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Copy Product Link"
              >
                <span className="material-symbols-outlined text-[18px]">content_copy</span>
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
