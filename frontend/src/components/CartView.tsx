import React, { useState } from 'react';
import { CartItem, Product } from '../types';
import { OrderMethodsModal } from './OrderMethodsModal';

interface CartViewProps {
  cartItems: CartItem[];
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onNavigate: (view: string) => void;
  onShowToast: (msg: string) => void;
  onConfirmCartOrder?: (
    product: Product | null,
    method: 'whatsapp' | 'facebook' | 'email' | 'pamsika',
    customMsg?: string
  ) => void;
}

export const CartView: React.FC<CartViewProps> = ({
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onNavigate,
  onShowToast,
  onConfirmCartOrder,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const total = Math.max(0, subtotal - discount);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'PAMSIKA10') {
      setDiscount(subtotal * 0.1);
      onShowToast('Promo code applied! 10% discount off total.');
    } else if (promoCode.trim().length > 0) {
      onShowToast('Try code "PAMSIKA10" for 10% off!');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center max-w-md mx-auto py-12">
        <div className="w-24 h-24 rounded-full bg-[#e6eeff] flex items-center justify-center mb-6 shadow-inner">
          <span className="material-symbols-outlined text-[48px] text-[#5300b7]">shopping_bag</span>
        </div>
        <h3 className="font-serif-source text-2xl font-bold text-[#121c2a] mb-2">Your bag is empty</h3>
        <p className="text-[#4a4455] text-sm mb-8">
          Explore our exclusive collection from trusted Malawian merchants.
        </p>
        <button
          onClick={() => onNavigate('marketplace')}
          className="px-8 py-3.5 bg-[#5300b7] hover:bg-[#6d28d9] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto px-4 py-4 pb-32">
      {/* Header */}
      <div className="pt-2 pb-4 flex items-end justify-between border-b border-[#ccc3d7]/30 mb-6">
        <div>
          <p className="text-[10px] font-bold text-[#5300b7] uppercase tracking-widest mb-0.5">Your Selection</p>
          <h2 className="font-serif-source text-2xl font-bold text-[#121c2a]">Shopping Bag</h2>
        </div>
        <span className="text-sm font-semibold text-[#4a4455]">
          {cartItems.reduce((a, b) => a + b.quantity, 0)} Items
        </span>
      </div>

      {/* Cart Item Cards */}
      <div className="flex flex-col gap-4 mb-8">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="bg-[#e6eeff]/60 rounded-2xl p-4 flex gap-4 border border-[#ccc3d7]/30 shadow-sm relative"
          >
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-white shrink-0 shadow-inner">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-between flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div className="pr-4">
                  <span className="text-[10px] font-bold uppercase text-[#7b7486]">
                    {item.product.category}
                  </span>
                  <h3 className="font-serif-source text-base font-bold text-[#121c2a] truncate">
                    {item.product.name}
                  </h3>
                  <p className="text-xs text-[#4a4455] mt-0.5">
                    Seller: {item.product.sellerName || 'Verified Merchant'}
                  </p>
                </div>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="text-[#7b7486] hover:text-[#ba1a1a] transition-colors p-1"
                  title="Remove item"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center bg-white rounded-full px-1 py-0.5 border border-[#ccc3d7]/50 shadow-sm">
                  <button
                    onClick={() => onUpdateQty(item.id, -1)}
                    className="w-7 h-7 flex items-center justify-center text-[#121c2a] hover:bg-[#eff4ff] rounded-full transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">remove</span>
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-[#121c2a]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQty(item.id, 1)}
                    className="w-7 h-7 flex items-center justify-center text-[#121c2a] hover:bg-[#eff4ff] rounded-full transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>

                <p className="font-bold text-[#5300b7] text-lg">
                  MWK {(item.product.price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary & Voucher */}
      <div className="bg-[#eff4ff] rounded-3xl p-6 border border-[#ccc3d7]/40 shadow-sm relative overflow-hidden mb-8">
        <h3 className="font-serif-source text-lg font-bold text-[#121c2a] mb-4">Order Summary</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-[#4a4455]">
            <span>Subtotal</span>
            <span className="font-medium text-[#121c2a]">MWK {subtotal.toLocaleString()}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-[#059669]">
              <span>Discount</span>
              <span className="font-bold">- MWK {discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-[#4a4455]">
            <span>Delivery Fee</span>
            <span className="font-semibold text-[#059669]">Free (Promotional)</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-[#ccc3d7]/30 text-base">
            <span className="font-bold text-[#121c2a]">Total</span>
            <span className="font-serif-source text-2xl font-bold text-[#5300b7]">
              MWK {total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Voucher Promo */}
        <div className="mt-6 flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Promo Code (e.g. PAMSIKA10)"
            className="flex-1 bg-white border border-[#ccc3d7]/50 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#5300b7]"
          />
          <button
            onClick={handleApplyPromo}
            className="px-5 bg-white border border-[#5300b7]/30 text-[#5300b7] hover:bg-[#5300b7] hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Sticky Bottom Checkout Action */}
      <div className="fixed bottom-16 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-[#ccc3d7]/30 py-3 px-4 z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-[#7b7486] uppercase block">Total Payable</span>
            <span className="font-serif-source text-xl font-bold text-[#5300b7]">
              MWK {total.toLocaleString()}
            </span>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="flex-1 max-w-sm bg-[#5300b7] hover:bg-[#6d28d9] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <span>Proceed to Checkout</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Order Methods Modal for Cart Checkout */}
      {isCheckoutOpen && (
        <OrderMethodsModal
          cartItems={cartItems}
          discount={discount}
          onClose={() => setIsCheckoutOpen(false)}
          onSelectMethod={(prod, method, customMsg) => {
            if (onConfirmCartOrder) {
              onConfirmCartOrder(prod, method, customMsg);
            }
            onClearCart();
            setIsCheckoutOpen(false);
          }}
        />
      )}
    </div>
  );
};
