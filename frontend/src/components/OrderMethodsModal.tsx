import React from 'react';
import { Product, CartItem } from '../types';

interface OrderMethodsModalProps {
  product?: Product | null;
  cartItems?: CartItem[] | null;
  discount?: number;
  onClose: () => void;
  onSelectMethod: (
    product: Product | null,
    method: 'whatsapp' | 'facebook' | 'email' | 'pamsika',
    customMsg?: string
  ) => void;
}

export const OrderMethodsModal: React.FC<OrderMethodsModalProps> = ({
  product,
  cartItems,
  discount = 0,
  onClose,
  onSelectMethod,
}) => {
  React.useEffect(() => {
    if (!product && (!cartItems || cartItems.length === 0)) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, cartItems, onClose]);

  if (!product && (!cartItems || cartItems.length === 0)) return null;

  const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const cleanPath = pathname.replace(/\/$/, '');

  const isCartCheckout = !product && cartItems && cartItems.length > 0;

  const subtotalVal = isCartCheckout
    ? cartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0)
    : 0;
  const totalVal = isCartCheckout ? Math.max(0, subtotalVal - discount) : 0;
  const totalItemsCount = isCartCheckout
    ? cartItems.reduce((acc, i) => acc + i.quantity, 0)
    : 0;
  const totalCartCommission = isCartCheckout
    ? cartItems.reduce(
        (acc, i) =>
          acc +
          Math.round((i.product.price * (i.product.commission || 5)) / 100) *
            i.quantity,
        0
      )
    : 0;

  const handleOptionClick = (method: 'whatsapp' | 'facebook' | 'email' | 'pamsika') => {
    let messageText = '';

    if (product) {
      const commissionVal = Math.round((product.price * (product.commission || 5)) / 100);
      const productLink = `${origin}${cleanPath}?product=${product.id}`;

      messageText = `?? Pa_mSikA OFFICIAL ORDER INQUIRY

?? Order Ref: ${orderId}

?? ORDERED ITEM DETAILS:
- Item: ${product.name}
- Price: MWK ${product.price.toLocaleString()}
- Category: ${product.category}
- Commission: MWK ${commissionVal.toLocaleString()} (${product.commission || 5}%)
- Merchant: ${product.sellerName || 'Verified Merchant'}

?? DIRECT PRODUCT LINK:
${productLink}

?? CUSTOMER NOTE:
"Hello Pa_mSikA Team, I would like to place an order for this item. Please confirm item availability and delivery details."`;
    } else if (isCartCheckout && cartItems) {
      const itemsListStr = cartItems
        .map((item, idx) => {
          const p = item.product;
          const comm = Math.round((p.price * (p.commission || 5)) / 100);
          const link = `${origin}${cleanPath}?product=${p.id}`;
          return `${idx + 1}. ${item.quantity}x ${p.name}
   • Price: MWK ${(p.price * item.quantity).toLocaleString()} (MWK ${p.price.toLocaleString()} ea)
   • Category: ${p.category} | Merchant: ${p.sellerName || 'Verified Merchant'}
   • Commission: MWK ${(comm * item.quantity).toLocaleString()} (${p.commission || 5}%)
   • Link: ${link}`;
        })
        .join('\n\n');

      messageText = `?? Pa_mSikA SHOPPING BAG ORDER

?? Order Ref: ${orderId}

?? BAG ITEMS (${totalItemsCount} Items):
${itemsListStr}

?? FINANCIAL SUMMARY:
- Subtotal: MWK ${subtotalVal.toLocaleString()}
${discount > 0 ? `• Voucher Discount: - MWK ${discount.toLocaleString()}\n` : ''}• Total Amount Payable: MWK ${totalVal.toLocaleString()}
- Total Commission: MWK ${totalCartCommission.toLocaleString()}

?? CUSTOMER NOTE:
"Hello Pa_mSikA Team, I would like to checkout my shopping bag. Please confirm order availability and delivery details."`;
    }

    if (method === 'whatsapp') {
      const whatsappUrl = `https://wa.me/265890641028?text=${encodeURIComponent(messageText)}`;
      window.open(whatsappUrl, '_blank');
    } else if (method === 'facebook') {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(messageText);
      }
      window.open(`https://m.me/999148263287916`, '_blank');
    } else if (method === 'email') {
      const subject = product
        ? `Pa_mSikA Order [${orderId}] - ${product.name}`
        : `Pa_mSikA Cart Order [${orderId}] (${totalItemsCount} Items)`;
      const mailtoUrl = `mailto:Pamsika8@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(messageText)}`;
      window.open(mailtoUrl, '_self');
    }

    onSelectMethod(product || null, method, messageText);
    onClose();
  };

  return (
    <div className="pm-dialog-backdrop" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isCartCheckout ? 'Checkout Bag' : 'Choose Order Method'}
        onClick={(e) => e.stopPropagation()}
        className="pm-dialog-card max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">
                {isCartCheckout ? 'shopping_cart' : 'shopping_bag'}
              </span>
            </div>
            <div>
              <h3 className="font-serif-source font-bold text-base text-slate-900 dark:text-white">
                {isCartCheckout ? `Checkout Bag (${totalItemsCount} Items)` : 'Choose Order Method'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {isCartCheckout
                  ? 'Select channel to dispatch your cart order'
                  : 'Select how you want to order this item'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Order Preview Header */}
        {product ? (
          <div className="p-4 bg-slate-100 dark:bg-zinc-800/40 border-b border-slate-200 dark:border-zinc-800 flex items-center gap-3 shrink-0">
            <img
              src={product.image}
              alt={product.name}
              className="w-14 h-14 object-cover rounded-xl border border-slate-200 dark:border-zinc-700 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                {product.category}
              </span>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{product.name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="font-bold text-sm text-slate-900 dark:text-white">
                  MWK {product.price.toLocaleString()}
                </p>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                  MWK {Math.round((product.price * (product.commission || 5)) / 100).toLocaleString()} ({product.commission || 5}%)
                </span>
              </div>
            </div>
          </div>
        ) : isCartCheckout && cartItems ? (
          <div className="p-4 bg-slate-100 dark:bg-zinc-800/40 border-b border-slate-200 dark:border-zinc-800 space-y-2 max-h-48 overflow-y-auto shrink-0">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              <span>Items in Order ({cartItems.length} Products)</span>
              <span className="text-emerald-600">Total: MWK {totalVal.toLocaleString()}</span>
            </div>
            {cartItems.map((item) => {
              const itemComm = Math.round((item.product.price * (item.product.commission || 5)) / 100);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2.5 p-2 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700/60"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-10 h-10 object-cover rounded-lg shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.quantity}x {item.product.name}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      <span>MWK {(item.product.price * item.quantity).toLocaleString()}</span>
                      <span className="text-emerald-600 font-semibold text-[10px]">
                        Comm: MWK {(itemComm * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Order Channel Options */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {/* WhatsApp */}
          <button
            onClick={() => handleOptionClick('whatsapp')}
            className="w-full p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 transition-all flex items-center justify-between group cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[22px]">chat</span>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-xs text-emerald-950 dark:text-emerald-200">Order via WhatsApp</p>
                  <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                    Fastest
                  </span>
                </div>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400">wa.me/265890641028</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-emerald-600 group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </button>

          {/* Facebook */}
          <button
            onClick={() => handleOptionClick('facebook')}
            className="w-full p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 transition-all flex items-center justify-between group cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[22px]">forum</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-xs text-blue-950 dark:text-blue-200">Order via Facebook</p>
                <p className="text-[10px] text-blue-700 dark:text-blue-400">m.me/999148263287916</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-blue-600 group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </button>

          {/* Email */}
          <button
            onClick={() => handleOptionClick('email')}
            className="w-full p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800 transition-all flex items-center justify-between group cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[22px]">mail</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-xs text-rose-950 dark:text-rose-200">Order via Email</p>
                <p className="text-[10px] text-rose-700 dark:text-rose-400">Pamsika8@gmail.com (Subject: Pa_mSikA Order [{orderId}])</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-rose-600 group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </button>

          {/* Direct Pamsika Inbox Chat */}
          <button
            onClick={() => handleOptionClick('pamsika')}
            className="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 transition-all flex items-center justify-between group cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[22px]">mark_chat_unread</span>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-xs text-slate-900 dark:text-white">Chat Directly on Pa_mSikA</p>
                  <span className="bg-slate-900 text-white dark:bg-white dark:text-black text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                    In-App
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-zinc-400">Open Pa_mSikA Inbox conversation with Admin</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-800 dark:text-white group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </button>
        </div>

        {/* Footer info note */}
        <div className="p-3 bg-slate-50 dark:bg-zinc-800/80 border-t border-slate-200 dark:border-zinc-800 text-center shrink-0">
          <p className="text-[10px] text-slate-500 dark:text-zinc-400 flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[14px]">mark_chat_read</span>
            <span>Selecting any option sends an order message to Admin in your Pa_mSikA Inbox</span>
          </p>
        </div>
      </div>
    </div>
  );
};