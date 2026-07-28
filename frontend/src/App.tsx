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
import { ProductDetailModal } from './components/ProductDetailModal';
import { Toast } from './components/Toast';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import { Api, ApiError } from './lib/api';
import { trackProductView } from './lib/recommendationEngine';
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
  adaptAdminInbox,
} from './lib/adapters';

import { Product, CartItem, ChatConversation, CommunityPost, PostComment, OrderItem, SellerProfile, PendingProductApproval, DoloAffiliate } from './types';

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

  // Dark Mode Theme State (kept local — the new frontend dropped ThemeContext
  // in favour of a plain boolean + localStorage flag on <html class="dark">)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('pamsika_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('pamsika_theme', next ? 'dark' : 'light');
      return next;
    });
  };

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
  const [adminAffiliatesList, setAdminAffiliatesList] = useState<any[]>([]);
  const [adminWithdrawalsList, setAdminWithdrawalsList] = useState<any[]>([]);
  const [adminClickLogsList, setAdminClickLogsList] = useState<any[]>([]);
  const [adminPromosList, setAdminPromosList] = useState<any[]>([]);
  const [adminInboxList, setAdminInboxList] = useState<any[]>([]);

  // Order Methods & Detail Modal State
  const [orderModalProduct, setOrderModalProduct] = useState<Product | null>(null);
  const [orderModalCart, setOrderModalCart] = useState<boolean>(false);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);

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
      const [stats, ords, sellerList, pending, affiliates, withdrawals, clicks, promos, inbox] = await Promise.all([
        Api.adminStats(),
        Api.adminOrders({ per_page: 100 }),
        Api.adminSellers(),
        Api.adminSellerProducts('pending'),
        Api.adminAffiliates(),
        Api.adminWithdrawals(),
        Api.adminAffiliateClicks(),
        Api.adminListPromos(),
        Api.adminAllConversations(),
      ]);
      setAdminStats(stats);
      setAdminOrdersList(adaptOrders(ords));
      setSellers(adaptSellerProfiles(sellerList));
      setPendingApprovals(adaptPendingApprovals(pending));
      setAdminAffiliatesList(affiliates);
      setAdminWithdrawalsList(withdrawals);
      setAdminClickLogsList(clicks);
      setAdminPromosList(promos);
      setAdminInboxList(adaptAdminInbox(inbox));
    } catch (err) {
      console.error('Failed to load admin data', err);
    }
  }, [user]);

  const handleApproveWithdrawal = async (id: string) => {
    try {
      await Api.adminApproveWithdrawal(id);
      await loadAdminData();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not approve withdrawal');
    }
  };

  const handleRejectWithdrawal = async (id: string, note?: string) => {
    try {
      await Api.adminRejectWithdrawal(id, note);
      await loadAdminData();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not reject withdrawal');
    }
  };

  const handleCreatePromo = async (data: Record<string, any>) => {
    try {
      await Api.adminCreatePromo(data);
      await loadAdminData();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not create promo code');
    }
  };

  const handleTogglePromo = async (id: string, isActive: boolean) => {
    try {
      await Api.adminUpdatePromo(id, { is_active: isActive });
      await loadAdminData();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not update promo code');
    }
  };

  const handleUpdatePromo = async (id: string, data: Record<string, any>) => {
    try {
      await Api.adminUpdatePromo(id, data);
      await loadAdminData();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not update promo code');
    }
  };

  const handleDeletePromo = async (id: string) => {
    try {
      await Api.adminDeletePromo(id);
      await loadAdminData();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not delete promo code');
    }
  };

  const handleSendBroadcast = async (title: string, body: string) => {
    try {
      await Api.broadcastNotification(title, body);
      showToast('Broadcast notification sent to all active users!');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not send broadcast');
    }
  };

  const handleReplyInbox = async (conversationId: string, text: string) => {
    try {
      await Api.replyMessage(conversationId, text);
      await loadAdminData();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not send reply');
    }
  };

  const handleResolveInbox = async (conversationId: string, resolved: boolean) => {
    try {
      await Api.adminUpdateConversation(conversationId, { resolved });
      await loadAdminData();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not update conversation');
    }
  };

  const handleSetInboxRead = async (conversationId: string, read: boolean) => {
    try {
      await Api.adminUpdateConversation(conversationId, { read });
      await loadAdminData();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not update conversation');
    }
  };

  const handleDeleteInbox = async (conversationId: string) => {
    try {
      await Api.deleteConversation(conversationId);
      await loadAdminData();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not delete conversation');
    }
  };

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
    }
  }, [user, loadAdminData]);

  // Auto-trace product when opening app via shared product link (e.g. ?product=prod-1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('product');
    if (productId && products.length > 0) {
      const target = products.find((p) => p.id === productId);
      if (target) {
        trackProductView(target);
        setSelectedDetailProduct(target);
        showToast(`Traced shared product: "${target.name}"`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

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

  // View tracking + detail modal preview (view counts are a client-side-only
  // affordance — the backend has no "increment views" endpoint to persist to)
  const handleViewProduct = (product: Product) => {
    trackProductView(product);
    setSelectedDetailProduct(product);
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

  // ── "Order Now" / cart checkout → real order + admin inbox message ───────

  const handleOrderNow = (product: Product) => {
    setOrderModalCart(false);
    setOrderModalProduct(product);
  };

  const handleOpenCartCheckout = () => {
    setOrderModalProduct(null);
    setOrderModalCart(true);
  };

  const CHECKOUT_METHOD_MAP: Record<string, 'whatsapp' | 'email' | 'messenger'> = {
    whatsapp: 'whatsapp',
    facebook: 'messenger',
    email: 'email',
    pamsika: 'whatsapp',
  };

  const handleConfirmOrderMethod = async (
    product: Product | null,
    method: 'whatsapp' | 'facebook' | 'email' | 'pamsika',
    customMsg?: string,
    promoCode?: string
  ) => {
    try {
      if (product) {
        // Single "Order Now" inquiry — logged as a real conversation with admin.
        const subject = `Order Inquiry: ${product.name}`;
        const message =
          customMsg ||
          `Hello Admin, I would like to place an order for: ${product.name} (MWK ${product.price.toLocaleString()}). Selected contact method: ${method.toUpperCase()}. Please assist with availability and delivery.`;
        if (user) {
          const res = await Api.startConversation(null, subject, message);
          await loadConversations();
          setSelectedConvId(res.conversation_id);
        }
        showToast('Order inquiry sent — our team will follow up shortly!');
      } else {
        // Cart checkout — creates a real order from the cart.
        const ok = user || (await requireAuth());
        if (!ok) return;
        await Api.createOrderFromCart(CHECKOUT_METHOD_MAP[method] || 'whatsapp', {
          name: user?.full_name || 'Customer',
        }, promoCode);
        setCart([]);
        loadSellerData();
        if (customMsg) {
          try {
            await Api.startConversation(null, 'Cart Checkout', customMsg);
            await loadConversations();
          } catch {
            /* order already placed either way — inbox message is best-effort */
          }
        }
        showToast('Order placed successfully!');
      }
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not process order');
    } finally {
      setOrderModalProduct(null);
      setOrderModalCart(false);
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

  const handleAddComment = async (postId: string, text: string) => {
    if (!text.trim()) return;
    const ok = await requireAuth();
    if (!ok) return;
    try {
      await Api.addComment(postId, text.trim());
      await loadPosts();
      showToast('Comment posted!');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not post comment');
    }
  };

  const handleToggleLikeComment = async (postId: string, commentId: string) => {
    const post = posts.find((p) => p.id === postId);
    const comment = post?.comments?.find((c) => c.id === commentId);
    try {
      if (comment?.isLiked) {
        await Api.unlikeComment(postId, commentId);
      } else {
        await Api.likeComment(postId, commentId);
      }
      await loadPosts();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not update like');
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await Api.deleteComment(postId, commentId);
      await loadPosts();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not delete comment');
    }
  };

  const handleCreatePost = async (content: string, image?: string) => {
    const ok = await requireAuth();
    if (!ok) return;
    try {
      await Api.createPost(content, image ? [image] : []);
      await loadPosts();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not publish post');
    }
  };

  const handleCreateAdminPost = async (
    content: string,
    categoryTag?: string,
    image?: string,
    taggedProduct?: Product
  ) => {
    const ok = await requireAuth();
    if (!ok) return;
    try {
      await Api.createPost(content, image ? [image] : [], categoryTag, taggedProduct?.id);
      await loadPosts();
      showToast('Official Admin Broadcast published to Feed!');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not publish broadcast');
    }
  };

  // ── Seller operations ─────────────────────────────────────────────────────

  const handleAddSellerProduct = async (data: Omit<Product, 'id'>) => {
    const ok = await requireAuth();
    if (!ok) {
      showToast('Please sign in first');
      return;
    }
    try {
      await Api.sellerSubmitProduct({
        name: data.name,
        category: data.category,
        description: data.description || '',
        price: data.price,
        stock: data.stock ?? 0,
        images: data.images && data.images.length > 0 ? data.images : [data.image],
      });
      await loadSellerData();
      showToast('New product submitted for admin approval!');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not submit product');
    }
  };

  const handleSellerApply = async (data: {
    fullName: string;
    nationalId: string;
    phone: string;
    location: string;
    storeName: string;
    productsSummary: string;
  }) => {
    const ok = await requireAuth();
    if (!ok) {
      showToast('Please sign in first');
      return;
    }
    try {
      await Api.sellerApply({
        business: data.storeName,
        phone: data.phone,
        location: data.location,
        nid: data.nationalId,
        description: data.productsSummary,
      });
      showToast('Application submitted! Awaiting admin approval.');
      window.location.reload(); // pulls fresh seller_status from /auth/me
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not submit application');
    }
  };

  const handleSellerWithdraw = async (amount: number, method: string, details: Record<string, any>) => {
    const ok = await requireAuth();
    if (!ok) {
      showToast('Please sign in first');
      return;
    }
    try {
      await Api.sellerRequestPayout(amount, method, details);
      await loadSellerData();
      showToast('Payout request submitted!');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not request payout');
    }
  };

  // ── Dolo / Affiliate operations ──────────────────────────────────────────

  const handleDoloJoin = async () => {
    const ok = await requireAuth();
    if (!ok) {
      showToast('Please sign in first');
      return;
    }
    try {
      await Api.joinAffiliate();
      window.location.reload(); // refresh user.is_affiliate from a clean /auth/me
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not join Dolo');
    }
  };

  const WITHDRAW_METHOD_MAP: Record<string, 'bank' | 'mobile_money' | 'wallet'> = {
    'Airtel Money': 'mobile_money',
    'TNM Mpamba': 'mobile_money',
  };

  const handleDoloWithdraw = async (amount: number, methodLabel: string, details: Record<string, any>) => {
    const ok = await requireAuth();
    if (!ok) {
      showToast('Please sign in first');
      return;
    }
    const method = WITHDRAW_METHOD_MAP[methodLabel] || (methodLabel.toLowerCase().includes('bank') ? 'bank' : 'mobile_money');
    try {
      await Api.requestAffiliateWithdrawal(amount, method, { label: methodLabel, ...details });
      await loadDoloData();
      showToast('Payout request submitted!');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not request payout');
    }
  };

  // ── Admin operations ──────────────────────────────────────────────────────

  const handleApproveProduct = async (approvalId: string) => {
    try {
      await Api.adminApproveProduct(approvalId, 30, 5);
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

  const VALID_ADMIN_BADGES = new Set(['HOT', 'NEW']);

  const handleAdminAddProduct = async (data: Omit<Product, 'id'>) => {
    try {
      await Api.adminCreateProduct({
        name: data.name,
        description: data.description || '',
        price: data.price,
        category: data.category,
        images: data.images && data.images.length > 0 ? data.images : [data.image],
        commission_percent: data.commission ?? 5,
        badge: data.badge && VALID_ADMIN_BADGES.has(data.badge) ? data.badge : undefined,
      });
      await loadProducts();
      showToast('Product created and published!');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not create product');
    }
  };

  const handleAdminEditProduct = async (updatedProduct: Product) => {
    try {
      await Api.adminUpdateProduct(updatedProduct.id, {
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: updatedProduct.price,
        category: updatedProduct.category,
        images:
          updatedProduct.images && updatedProduct.images.length > 0
            ? updatedProduct.images
            : [updatedProduct.image],
        commission_percent: updatedProduct.commission,
        badge: updatedProduct.badge && VALID_ADMIN_BADGES.has(updatedProduct.badge) ? updatedProduct.badge : null,
      });
      await loadProducts();
      showToast('Product updated!');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not update product');
    }
  };

  const handleAdminDeleteProduct = async (productId: string) => {
    try {
      await Api.adminDeleteProduct(productId);
      await loadProducts();
      showToast('Product deleted!');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not delete product');
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
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'dark bg-[#0c0814] text-slate-100' : 'bg-[#fbf8ff] text-[#1a1b22]'}`}>
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
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
          userName={user?.full_name}
          userRole={user?.is_admin ? 'Admin' : user?.is_seller ? 'Seller' : user?.is_affiliate ? 'Affiliate' : 'Member'}
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
            onViewProduct={handleViewProduct}
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
            onViewProduct={handleViewProduct}
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
            onConfirmCartOrder={handleConfirmOrderMethod}
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
            onViewProduct={handleViewProduct}
          />
        )}

        {currentView === 'community' && (
          <CommunityView
            posts={posts}
            products={products}
            registeredUserName={user?.full_name || 'Guest'}
            onToggleLike={handleToggleLikePost}
            onAddComment={handleAddComment}
            onToggleLikeComment={handleToggleLikeComment}
            onDeleteComment={handleDeleteComment}
            onCreateAdminPost={user?.is_admin ? handleCreateAdminPost : undefined}
            onShowToast={showToast}
            onViewProduct={handleViewProduct}
            onOrderNow={handleOrderNow}
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
            defaultApplicantName={user?.full_name || ''}
          />
        )}

        {currentView === 'admin' && (
          <AdminView
            products={products}
            orders={adminOrdersList}
            sellers={sellers}
            pendingApprovals={pendingApprovals}
            onApproveProduct={handleApproveProduct}
            onRejectProduct={handleRejectProduct}
            onToggleOrderDone={handleToggleOrderDone}
            onCancelOrder={handleCancelOrder}
            onToggleSellerStatus={handleToggleSellerStatus}
            onAddProduct={handleAdminAddProduct}
            onEditProduct={handleAdminEditProduct}
            onDeleteProduct={handleAdminDeleteProduct}
            onShowToast={showToast}
            onNavigate={handleNavigate}
            affiliates={adminAffiliatesList}
            withdrawals={adminWithdrawalsList}
            clickLogs={adminClickLogsList}
            promos={adminPromosList}
            inbox={adminInboxList}
            totalUsers={adminStats?.total_users || 0}
            onApproveWithdrawal={handleApproveWithdrawal}
            onRejectWithdrawal={handleRejectWithdrawal}
            onCreatePromo={handleCreatePromo}
            onUpdatePromo={handleUpdatePromo}
            onTogglePromo={handleTogglePromo}
            onDeletePromo={handleDeletePromo}
            onSendBroadcast={handleSendBroadcast}
            onReplyInbox={handleReplyInbox}
            onResolveInbox={handleResolveInbox}
            onSetInboxRead={handleSetInboxRead}
            onDeleteInbox={handleDeleteInbox}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            currentCity={currentCity}
            onSelectCity={setCurrentCity}
            onNavigate={handleNavigate}
            onShowToast={showToast}
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
          />
        )}
      </main>

      {/* Order Methods Modal — single-product "Order Now" or full-cart checkout */}
      <OrderMethodsModal
        product={orderModalProduct}
        cartItems={orderModalCart ? cart : null}
        onClose={() => {
          setOrderModalProduct(null);
          setOrderModalCart(false);
        }}
        onSelectMethod={handleConfirmOrderMethod}
      />

      {/* Global Product Detail Modal */}
      <ProductDetailModal
        product={
          selectedDetailProduct
            ? products.find((p) => p.id === selectedDetailProduct.id) || selectedDetailProduct
            : null
        }
        onClose={() => setSelectedDetailProduct(null)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={selectedDetailProduct ? wishlistIds.includes(selectedDetailProduct.id) : false}
        onShowToast={showToast}
        onOrderNow={handleOrderNow}
      />

      {/* Auth Modal (login / register) */}
      <AuthModal onShowToast={showToast} />

      {/* Non-intrusive Toast */}
      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />
    </div>
  );
}
