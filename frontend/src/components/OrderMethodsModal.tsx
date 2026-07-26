import React from 'react';
import { Product } from '../types';

interface OrderMethodsModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectMethod: (product: Product, method: 'whatsapp' | 'facebook' | 'email' | 'pamsika') => void;
}

export const OrderMethodsModal: React.FC<OrderMethodsModalProps> = ({
  product,
  onClose,
  onSelectMethod,
}) => {
  if (!product) return null;

  const handleOptionClick = (method: 'whatsapp' | 'facebook' | 'email' | 'pamsika') => {
    const encodedProductName = encodeURIComponent(product.name);
    const encodedPrice = encodeURIComponent(`MWK ${product.price.toLocaleString()}`);
    const messageText = `Hello Pamsika Admin, I would like to place an order for: ${product.name} (${product.price.toLocaleString()} MWK). Please assist with availability and delivery.`;

    if (method === 'whatsapp') {
      window.open(`https://wa.me/265999000111?text=${encodeURIComponent(messageText)}`, '_blank');
    } else if (method === 'facebook') {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(messageText);
      }
      window.open(`https://facebook.com/pamsikamarketplace`, '_blank');
    } else if (method === 'email') {
      window.open(
        `mailto:admin@pamsika.com?subject=Order Inquiry: ${encodedProductName}&body=${encodeURIComponent(messageText)}`,
        '_self'
      );
    }

    // Simultaneously trigger in-app message sending to Admin and open Pamsika Chat thread
    onSelectMethod(product, method);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#ccc3d7]/30 flex flex-col">
        {/* Header */}
        <div className="p-5 bg-[#fef7ff] border-b border-[#ccc3d7]/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#5300b7] text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            </div>
            <div>
              <h3 className="font-serif-source font-bold text-base text-[#1d1a24]">
                Choose Order Method
              </h3>
              <p className="text-[11px] text-[#4a4455]">Select how you want to order this item</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#e3e1ec] flex items-center justify-center text-[#4a4455] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Product Preview Card */}
        <div className="p-4 bg-[#f4f2fd] border-b border-[#ccc3d7]/20 flex items-center gap-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-14 h-14 object-cover rounded-xl border border-[#ccc3d7]/40 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-bold text-[#5300b7] uppercase tracking-wider block">
              {product.category}
            </span>
            <h4 className="font-bold text-xs text-[#1d1a24] truncate">{product.name}</h4>
            <p className="font-bold text-sm text-[#5300b7] mt-0.5">
              MWK {product.price.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Order Channel Options */}
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {/* WhatsApp */}
          <button
            onClick={() => handleOptionClick('whatsapp')}
            className="w-full p-3.5 rounded-2xl bg-[#f0fdf4] hover:bg-[#dcfce7] border border-[#bbf7d0] transition-all flex items-center justify-between group cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#16a34a] text-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[22px]">chat</span>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-xs text-[#0f5132]">Order via WhatsApp</p>
                  <span className="bg-[#16a34a] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                    Fastest
                  </span>
                </div>
                <p className="text-[10px] text-[#15803d]">Direct chat on +265 999 000 111</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#16a34a] group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </button>

          {/* Facebook */}
          <button
            onClick={() => handleOptionClick('facebook')}
            className="w-full p-3.5 rounded-2xl bg-[#eff6ff] hover:bg-[#dbeafe] border border-[#bfdbfe] transition-all flex items-center justify-between group cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2563eb] text-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[22px]">forum</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-xs text-[#1e3a8a]">Order via Facebook</p>
                <p className="text-[10px] text-[#1d4ed8]">Message Pamsika Official Page</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#2563eb] group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </button>

          {/* Email */}
          <button
            onClick={() => handleOptionClick('email')}
            className="w-full p-3.5 rounded-2xl bg-[#fff1f2] hover:bg-[#ffe4e6] border border-[#fecdd3] transition-all flex items-center justify-between group cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#e11d48] text-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[22px]">mail</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-xs text-[#881337]">Order via Email</p>
                <p className="text-[10px] text-[#be123c]">Send email inquiry to admin@pamsika.com</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#e11d48] group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </button>

          {/* Direct Pamsika Inbox Chat */}
          <button
            onClick={() => handleOptionClick('pamsika')}
            className="w-full p-3.5 rounded-2xl bg-[#fef7ff] hover:bg-[#f3ebf9] border border-[#e8def8] transition-all flex items-center justify-between group cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5300b7] text-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[22px]">mark_chat_unread</span>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-xs text-[#1d1a24]">Chat Directly on Pamsika</p>
                  <span className="bg-[#5300b7] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                    In-App
                  </span>
                </div>
                <p className="text-[10px] text-[#4a4455]">Open Pamsika Inbox conversation with Admin</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#5300b7] group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </button>
        </div>

        {/* Footer info note */}
        <div className="p-3 bg-[#fef7ff] border-t border-[#ccc3d7]/30 text-center">
          <p className="text-[10px] text-[#7b7486] flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-[#5300b7]">mark_chat_read</span>
            <span>Selecting any option sends an order message to Admin in your Pamsika Inbox</span>
          </p>
        </div>
      </div>
    </div>
  );
};
