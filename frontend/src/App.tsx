import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { LandingView } from './components/LandingView';
import { MarketplaceView } from './components/MarketplaceView';
import { CartView } from './components/CartView';
import { WishlistView } from './components/WishlistView';
import { CommunityView } from './components/CommunityView';
import { MessagesView } from './components/MessagesView';
import { ChatDetailView } from './components/ChatDetailView';
import { DoloView } from './components/DoloView';
import { SellerHubView } from './components/SellerHubView';
import { AdminView } from './components/AdminView';
import { SettingsView } from './components/SettingsView';
import { OrderMethodsModal } from './components/OrderMethodsModal';
import { Toast } from './components/Toast';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import { Api, ApiError } from './lib/api';
import {
  adaptProducts,
  adaptCart,
  adaptOrders,
  adaptPosts,
  adaptConversations,
  adaptConversation,
  adaptSellerProfiles,
  sellerStatusToBackend,
  adaptPendingApprovals,
  adaptDoloData,
} from './lib/adapters';

import { Product, CartItem, ChatConversation, CommunityPost, OrderItem, SellerProfile, PendingProductApproval, DoloAffiliate } from './types';

interface AdminStats {
  total_products: number;
  total_orders: number;
  total_users: number;
  pending_withdrawals: number;
  total_affiliates: number;
  active_sellers: number;
  pending_seller_approvals: number;
  total_revenue: number;
}

interface AdminWithdrawalItem {
  id: string;
  amount: number;
  method: string;
  status: string;
  user_name?: string;
}

const EMPTY_DOLO: DoloAffiliate = {
  id: '', name: '', email: '', doloId: '', balance: 0, linkClicks: 0,
  salesMade: 0, totalEarned: 0, inviteLink: '', subEarnings: 0, subInvites: 0,
};

export default function App() {
  const { user, requireAuth } = useAuth();

  const [currentView, setCurrentView] = useState<string>('home');
  const [currentCity, setCurrentCity] = useState<string>('Lilongwe');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedConvId, setSelectedConvId] = useState<string>('');

  // Core Dynamic Data State — populated from the backend, not mock files
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  // Seller-scoped state
  const [sellerProductsList, setSellerProductsList] = useState<Product[]>([]);
  const [sellerOrdersList, setSellerOrdersList] = useState<OrderItem[]>([]);
  const [sellerBalance, setSellerBalance] = useState<number>(0);

  // Dolo/affiliate-scoped state
  const [doloData, setDoloData] = useState<DoloAffiliate>(EMPTY_DOLO);

  // Admin-scoped state
  const [adminOrdersList, setAdminOrdersList] = useState<OrderItem[]>([]);
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingProductApproval[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [adminWithdrawals, setAdminWithdrawals] = useState<AdminWithdrawalItem[]>([]);

  // Order Methods Modal State
  const [orderModalProduct, setOrderModalProduct] = useState<Product | null>(null);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((current) => (current === msg ? null : current));
    }, 3500);
  }, []);

  // ── Data loading ──────────────────────────────────────────────────────────

  const loadProducts = useCallback(async () => {
    try {
      const res = await Api.products({ per_page: 100 });
      setProducts(adaptProducts(res.items || []));
    } catch (err) {
      console.error('Failed to load products', err);
    }
  }, []);

  const loadPosts = useCallback(async () => {
    try {
      const res = await Api.getPosts();
      setPosts(adaptPosts(res, user?.id));
    } catch (err) {
      console.error('Failed to load community posts', err);
    }
  }, [user?.id]);

  const loadCart = useCallback(async () => {
    try {
      const res = await Api.getCart();
      setCart(adaptCart(res));
    } catch (err) {
      console.error('Failed to load cart', err);
    }
  }, []);

  const loadFavorites = useCallback(async () => {
    if (!user) return;
    try {
      const res = await Api.getFavorites();
      setWishlistIds((res || []).map((f: any) => String(f.product_id)));
    } catch (err) {
      console.error('Failed to load favorites', err);
    }
  }, [user]);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const res = await Api.myConversations();
      setConversations(adaptConversations(res));
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  }, [user]);

  const loadSellerData = useCallback(async () => {
    if (!user?.is_seller || user.seller_status !== 'approved') return;
    try {
      const [dash, prods, ords] = await Promise.all([
        Api.sellerDashboard(),
        Api.sellerProducts(),
        Api.sellerOrders(),
      ]);
      setSellerBalance(dash.seller_referral_bonus ?? 0);
      setSellerProductsList(adaptProducts(prods));
      setSellerOrdersList(adaptOrders(ords));
    } catch (err) {
      console.error('Failed to load seller data', err);
    }
  }, [user]);

  const loadDoloData = useCallback(async () => {
    if (!user?.is_affiliate) return;
    try {
      const dash = await Api.affiliateDashboard();
      setDoloData(adaptDoloData(dash, user, window.location.origin));
    } catch (err) {
      console.error('Failed to load Dolo dashboard', err);
    }
  }, [user]);

  const loadAdminData = useCallback(async () => {
    if (!user?.is_admin) return;
    try {
      const [stats, ords, sellerList, pending, withdrawals] = await Promise.all([
        Api.adminStats(),
        Api.adminOrders({ per_page: 100 }),
        Api.adminSellers(),
        Api.adminSellerProducts('pending'),
        Api.adminWithdrawals(),
      ]);
      setAdminStats(stats);
      setAdminOrdersList(adaptOrders(ords));
      setSellers(adaptSellerProfiles(sellerList));
      setPendingApprovals(adaptPendingApprovals(pending));
      setAdminWithdrawals(
        (withdrawals || []).map((w: any) => ({
          id: String(w.id),
          amount: w.amount,
          method: w.method,
          status: w.status,
          user_name: w.affiliate_email || 'User',
        }))
      );
    } catch (err) {
      console.error('Failed to load admin data', err);
    }
  }, [user]);

  // Public data — loads once
  useEffect(() => {
    loadProducts();
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cart works for guests too (session-based) — reload whenever auth changes
  // so a guest cart merges/refreshes correctly after login.
  useEffect(() => {
    loadCart();
  }, [user, loadCart]);

  useEffect(() => {
    if (user) {
      loadFavorites();
      loadConversations();
    } else {
      setWishlistIds([]);
      setConversations([]);
    }
  }, [user, loadFavorites, loadConversations]);

  useEffect(() => {
    if (user?.is_seller && user.seller_status === 'approved') {
      loadSellerData();
    } else {
      setSellerProductsList([]);
      setSellerOrdersList([]);
      setSellerBalance(0);
    }
  }, [user, loadSellerData]);

  useEffect(() => {
    if (user?.is_affiliate) {
      loadDoloData();
    } else {
      setDoloData(EMPTY_DOLO);
    }
  }, [user, loadDoloData]);

  useEffect(() => {
    if (user?.is_admin) {
      loadAdminData();
    } else {
      setAdminOrdersList([]);
      setSellers([]);
      setPendingApprovals([]);
      setAdminStats(null);
      setAdminWithdrawals([]);
    }
  }, [user, loadAdminData]);

  // ── Navigation ────────────────────────────────────────────────────────────

  const handleNavigate = async (view: string, filterCategory?: string) => {
    if (filterCategory) setSelectedCategoryFilter(filterCategory);

    if (view === 'admin') {
      const ok = user || (await requireAuth());
      if (!ok) return;
      if (!user?.is_admin) {
        showToast('Admin access required for this area');
        return;
      }
      setCurrentView(view);
      return;
    }

    if (view === 'messages' || view === 'settings') {
      const ok = user || (await requireAuth());
      if (!ok) return;
      setCurrentView(view);
      return;
    }

    setCurrentView(view);
  };

  // ── Cart operations ──────────────────────────────────────────────────────

  const handleAddToCart = async (product: Product) => {
    try {
      const res = await Api.addToCart(product.id, 1);
      setCart(adaptCart(res));
      showToast(`Added "${product.name}" to cart!`);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not add to cart');
    }
  };

  const handleUpdateQty = async (cartItemId: string, delta: number) => {
    const item = cart.find((c) => c.id === cartItemId);
    if (!item) return;
    const newQty = item.quantity + delta;
    try {
      const res = newQty <= 0 ? await Api.removeCartItem(cartItemId) : await Api.updateCartItem(cartItemId, newQty);
      setCart(adaptCart(res));
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not update cart');
    }
  };

  const handleRemoveCartItem = async (cartItemId: string) => {
    try {
      const res = await Api.removeCartItem(cartItemId);
      setCart(adaptCart(res));
      showToast('Item removed from cart');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not remove item');
    }
  };

  const handleClearCart = async () => {
    try {
      await Api.clearCart();
      setCart([]);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not clear cart');
    }
  };

  const handleCheckout = async (
    paymentMethod: string,
    contactInfo: { name: string; phone: string; address: string }
  ) => {
    if (cart.length === 0) throw new Error('Your cart is empty');
    const items = cart.map((c) => ({ product_id: c.product.id, quantity: c.quantity }));
    await Api.createDirectOrder(items, paymentMethod, contactInfo);
    await Api.clearCart();
    setCart([]);
    if (user) loadSellerData(); // in case the user is also a seller who just sold something
  };

  // ── Wishlist ──────────────────────────────────────────────────────────────

  const handleToggleWishlist = async (productId: string) => {
    const ok = await requireAuth();
    if (!ok) return;
    try {
      if (wishlistIds.includes(productId)) {
        await Api.removeFavorite(productId);
        setWishlistIds((prev) => prev.filter((id) => id !== productId));
      } else {
        await Api.addFavorite(productId);
        setWishlistIds((prev) => [...prev, productId]);
      }
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not update wishlist');
    }
  };

  // ── "Order Now" quick-order → logs an inbox inquiry with Admin ──────────

  const handleOrderNow = (product: Product) => {
    setOrderModalProduct(product);
  };

  const handleConfirmOrderMethod = async (
    product: Product,
    method: 'whatsapp' | 'facebook' | 'email' | 'pamsika'
  ) => {
    const subject = `Order Inquiry: ${product.name}`;
    const message = `Hello Admin, I would like to place an order for: ${product.name} (MWK ${product.price.toLocaleString()}). Selected contact method: ${method.toUpperCase()}. Please assist with availability and delivery.`;

    try {
      if (user) {
        const res = await Api.startConversation(null, subject, message);
        await loadConversations();
        setSelectedConvId(res.conversation_id);
        setCurrentView('chat');
      }
      await handleAddToCart(product);
      showToast('Order inquiry sent — our team will follow up shortly!');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not send order inquiry');
    }
  };

  // ── Messaging ─────────────────────────────────────────────────────────────

  const handleSendMessage = async (convId: string, text: string) => {
    await Api.replyMessage(convId, text);
    const updated = await Api.getConversation(convId);
    setConversations((prev) => prev.map((c) => (c.id === convId ? adaptConversation(updated) : c)));
  };

  // ── Community ─────────────────────────────────────────────────────────────

  const handleToggleLikePost = async (postId: string) => {
    const ok = await requireAuth();
    if (!ok) return;
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    try {
      if (post.isLiked) {
        await Api.unlikePost(postId);
      } else {
        await Api.likePost(postId);
      }
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p
        )
      );
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not update like');
    }
  };

  const handleCreatePost = async (content: string, _categoryTag?: string, image?: string) => {
    const ok = await requireAuth();
    if (!ok) return;
    try {
      await Api.createPost(content, image ? [image] : []);
      await loadPosts();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not publish post');
    }
  };

  // ── Seller operations ─────────────────────────────────────────────────────

  const handleAddSellerProduct = async (data: {
    name: string;
    category: string;
    price: number;
    stock: number;
    description: string;
  }) => {
    const ok = await requireAuth();
    if (!ok) throw new Error('Please sign in first');
    await Api.sellerSubmitProduct(data);
    await loadSellerData();
  };

  const handleSellerApply = async (data: {
    business: string;
    phone: string;
    location: string;
    nid: string;
    description: string;
  }) => {
    const ok = await requireAuth();
    if (!ok) throw new Error('Please sign in first');
    await Api.sellerApply(data);
    // seller_status on the user record changes server-side; a fresh /auth/me
    // pull happens automatically the next time AuthContext refreshes, but we
    // nudge a reload here so the UI reflects "pending" immediately.
    window.location.reload();
  };

  const handleSellerWithdraw = async (amount: number) => {
    const ok = await requireAuth();
    if (!ok) throw new Error('Please sign in first');
    await Api.sellerRequestPayout(amount, 'mobile_money', {});
    await loadSellerData();
  };

  // ── Dolo / Affiliate operations ──────────────────────────────────────────

  const handleDoloJoin = async () => {
    const ok = await requireAuth();
    if (!ok) throw new Error('Please sign in first');
    await Api.joinAffiliate();
    window.location.reload(); // refresh user.is_affiliate from a clean /auth/me
  };

  const WITHDRAW_METHOD_MAP: Record<string, 'bank' | 'mobile_money' | 'wallet'> = {
    'Airtel Money': 'mobile_money',
    'TNM Mpamba': 'mobile_money',
    'National Bank Account': 'bank',
  };

  const handleDoloWithdraw = async (amount: number, methodLabel: string) => {
    const ok = await requireAuth();
    if (!ok) throw new Error('Please sign in first');
    const method = WITHDRAW_METHOD_MAP[methodLabel] || 'mobile_money';
    await Api.requestAffiliateWithdrawal(amount, method, { label: methodLabel });
    await loadDoloData();
  };

  // ── Admin operations ──────────────────────────────────────────────────────

  const handleApproveProduct = async (approvalId: string, markupPct: number, commPct: number) => {
    try {
      await Api.adminApproveProduct(approvalId, markupPct, commPct);
      await loadAdminData();
      await loadProducts();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not approve product');
    }
  };

  const handleRejectProduct = async (approvalId: string) => {
    try {
      await Api.adminRejectProduct(approvalId, 'Did not meet marketplace quality standards');
      await loadAdminData();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not reject product');
    }
  };

  const handleToggleOrderDone = async (orderId: string) => {
    try {
      await Api.adminPatchOrder(orderId, 'completed');
      await loadAdminData();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not update order');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await Api.adminPatchOrder(orderId, 'cancelled');
      await loadAdminData();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not cancel order');
    }
  };

  const handleToggleSellerStatus = async (sellerId: string, status: SellerProfile['status']) => {
    try {
      await Api.adminUpdateSeller(sellerId, { seller_status: sellerStatusToBackend(status) });
      await loadAdminData();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not update seller status');
    }
  };

  const handleExportOrders = () => {
    Api.exportOrders('csv').catch((err) =>
      showToast(err instanceof ApiError ? err.message : 'Export failed')
    );
  };

  const handleBroadcast = async (title: string, body: string) => {
    try {
      await Api.broadcastNotification(title, body);
      showToast('Broadcast sent to all active users!');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Broadcast failed');
    }
  };

  const handleApproveWithdrawal = async (id: string) => {
    try {
      await Api.adminApproveWithdrawal(id);
      await loadAdminData();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not approve withdrawal');
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────

  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];
  const totalCartCount = cart.reduce((a, b) => a + b.quantity, 0);
  const unreadMessagesCount = conversations.reduce((a, b) => a + b.unreadCount, 0);
  const sellerStatus: 'none' | 'pending' | 'approved' | 'rejected' = !user?.is_seller
    ? 'none'
    : ((user.seller_status as any) || 'none');

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf8ff] text-[#1a1b22]">
      {/* Show Global Header unless in full chat mode or admin view */}
      {currentView !== 'chat' && currentView !== 'admin' && (
        <Header
          currentView={currentView}
          currentCity={currentCity}
          onSelectCity={setCurrentCity}
          onNavigate={handleNavigate}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          cartCount={totalCartCount}
          unreadMessagesCount={unreadMessagesCount}
        />
      )}

      {/* Main Content Area */}
      <main className={`flex-1 ${currentView !== 'chat' && currentView !== 'admin' ? 'pt-16 md:pt-20' : ''}`}>
        {currentView === 'landing' && (
          <LandingView onEnterMarketplace={() => setCurrentView('home')} />
        )}

        {currentView === 'home' && (
          <HomeView
            products={products}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onNavigate={handleNavigate}
            searchQuery={searchQuery}
            onShowToast={showToast}
            onOrderNow={handleOrderNow}
          />
        )}

        {currentView === 'marketplace' && (
          <MarketplaceView
            products={products}
            wishlistIds={wishlistIds}
            initialCategory={selectedCategoryFilter}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onShowToast={showToast}
            onOrderNow={handleOrderNow}
          />
        )}

        {currentView === 'cart' && (
          <CartView
            cartItems={cart}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
            onNavigate={handleNavigate}
            onShowToast={showToast}
            onCheckout={handleCheckout}
          />
        )}

        {currentView === 'wishlist' && (
          <WishlistView
            products={products}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onNavigate={handleNavigate}
            onShowToast={showToast}
            onOrderNow={handleOrderNow}
          />
        )}

        {currentView === 'community' && (
          <CommunityView
            posts={posts}
            onToggleLike={handleToggleLikePost}
            onCreatePost={handleCreatePost}
            onShowToast={showToast}
          />
        )}

        {currentView === 'messages' && (
          <MessagesView
            conversations={conversations}
            onSelectConversation={(id) => {
              setSelectedConvId(id);
              setCurrentView('chat');
            }}
            onShowToast={showToast}
          />
        )}

        {currentView === 'chat' && activeConv && (
          <ChatDetailView
            conversation={activeConv}
            onBack={() => setCurrentView('messages')}
            onSendMessage={handleSendMessage}
            onShowToast={showToast}
          />
        )}

        {currentView === 'dolo' && (
          <DoloView
            doloData={doloData}
            isAffiliate={!!user?.is_affiliate}
            onShowToast={showToast}
            onJoin={handleDoloJoin}
            onWithdraw={handleDoloWithdraw}
          />
        )}

        {currentView === 'seller' && (
          <SellerHubView
            products={sellerProductsList}
            orders={sellerOrdersList}
            sellerStatus={sellerStatus}
            balance={sellerBalance}
            onAddProduct={handleAddSellerProduct}
            onApply={handleSellerApply}
            onWithdraw={handleSellerWithdraw}
            onShowToast={showToast}
          />
        )}

        {currentView === 'admin' && (
          <AdminView
            orders={adminOrdersList}
            sellers={sellers}
            pendingApprovals={pendingApprovals}
            stats={adminStats}
            withdrawals={adminWithdrawals}
            onApproveProduct={handleApproveProduct}
            onRejectProduct={handleRejectProduct}
            onToggleOrderDone={handleToggleOrderDone}
            onCancelOrder={handleCancelOrder}
            onToggleSellerStatus={handleToggleSellerStatus}
            onExportOrders={handleExportOrders}
            onBroadcast={handleBroadcast}
            onApproveWithdrawal={handleApproveWithdrawal}
            onShowToast={showToast}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            currentCity={currentCity}
            onSelectCity={setCurrentCity}
            onNavigate={handleNavigate}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Order Methods Modal */}
      <OrderMethodsModal
        product={orderModalProduct}
        onClose={() => setOrderModalProduct(null)}
        onSelectMethod={handleConfirmOrderMethod}
      />

      {/* Auth Modal (login / register) */}
      <AuthModal onShowToast={showToast} />

      {/* Non-intrusive Toast */}
      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />
    </div>
  );
}
