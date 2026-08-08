/* ================================================================
   PA_MSIKA — API CLIENT
   Talks to the FastAPI backend at /api/v1.

   - Same-origin in production (backend serves this app's build), so
     no CORS/base-URL configuration is required there.
   - In dev, vite.config.ts proxies /api + /uploads to the backend.
   - Handles JWT access-token storage, silent refresh-on-401 via the
     HttpOnly refresh cookie, and guest cart/session continuity.
   ================================================================ */

const API_BASE = '/api/v1';

const ACCESS_TOKEN_KEY = 'pm_access_token';
const SESSION_ID_KEY = 'pm_session_id';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

function genSessionId(): string {
  return 'sess-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

class ApiClient {
  private _token: string | null = null;
  private _sessionId: string;
  private _onUnauthorized: (() => void) | null = null;

  constructor() {
    this._token = localStorage.getItem(ACCESS_TOKEN_KEY);
    let sid = localStorage.getItem(SESSION_ID_KEY);
    if (!sid) {
      sid = genSessionId();
      localStorage.setItem(SESSION_ID_KEY, sid);
    }
    this._sessionId = sid;
  }

  /** Called by AuthContext so the client can react to session expiry app-wide. */
  onUnauthorized(fn: () => void) {
    this._onUnauthorized = fn;
  }

  get token() {
    return this._token;
  }

  setToken(token: string | null) {
    this._token = token;
    if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
    else localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  private _headers(extra: Record<string, string> = {}, isJson = true): Record<string, string> {
    const h: Record<string, string> = { ...extra };
    if (isJson) h['Content-Type'] = 'application/json';
    if (this._token) h['Authorization'] = 'Bearer ' + this._token;
    if (this._sessionId) h['X-Session-Id'] = this._sessionId;
    return h;
  }

  private async _refresh(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(API_BASE + '/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        signal: controller.signal,
      });
      clearTimeout(t);
      if (!res.ok) return false;
      const data = await res.json();
      this.setToken(data.access_token);
      return true;
    } catch {
      return false;
    }
  }

  private async _req<T = any>(
    method: string,
    path: string,
    body?: any,
    opts: { skipAuthRetry?: boolean } = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const fetchOpts: RequestInit = {
        method,
        headers: this._headers(),
        credentials: 'include',
        signal: controller.signal,
      };
      if (body !== undefined) fetchOpts.body = JSON.stringify(body);

      let res = await fetch(API_BASE + path, fetchOpts);

      if (res.status === 401 && !opts.skipAuthRetry) {
        const refreshed = await this._refresh();
        if (refreshed) {
          const retryOpts: RequestInit = { ...fetchOpts, headers: this._headers() };
          res = await fetch(API_BASE + path, retryOpts);
        } else {
          this.setToken(null);
          if (this._onUnauthorized) this._onUnauthorized();
        }
      }

      clearTimeout(timer);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const detail = Array.isArray(err.detail)
          ? err.detail.map((e: any) => e.msg || e.message || JSON.stringify(e)).join('; ')
          : err.detail || `Request failed (${res.status})`;
        throw new ApiError(detail, res.status);
      }
      if (res.status === 204) return null as T;
      const text = await res.text();
      return (text ? JSON.parse(text) : null) as T;
    } catch (e: any) {
      clearTimeout(timer);
      if (e instanceof ApiError) throw e;
      if (e.name === 'AbortError') throw new ApiError('Request timed out — please check your connection', 0);
      if (e instanceof TypeError) throw new ApiError('Network error — check your connection', 0);
      throw e;
    }
  }

  get<T = any>(path: string) {
    return this._req<T>('GET', path);
  }
  post<T = any>(path: string, body?: any) {
    return this._req<T>('POST', path, body ?? {});
  }
  put<T = any>(path: string, body?: any) {
    return this._req<T>('PUT', path, body ?? {});
  }
  patch<T = any>(path: string, body?: any) {
    return this._req<T>('PATCH', path, body ?? {});
  }
  del<T = any>(path: string) {
    return this._req<T>('DELETE', path);
  }

  // ── Uploads (multipart, admin/seller/message images) ─────────────────────
  async uploadFiles(path: string, files: File[]): Promise<{ urls: string[] }> {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    const headers: Record<string, string> = {};
    if (this._token) headers['Authorization'] = 'Bearer ' + this._token;
    const res = await fetch(API_BASE + path, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(err.detail || 'Upload failed', res.status);
    }
    return res.json();
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  async register(fullName: string, email: string, password: string, referredBy?: string | null) {
    const body: any = { full_name: fullName, email, password };
    if (referredBy) body.referred_by = referredBy;
    const data = await this.post<{ access_token: string }>('/auth/register', body);
    this.setToken(data.access_token);
    return data;
  }
  async login(email: string, password: string) {
    const data = await this.post<{ access_token: string }>('/auth/login', { email, password });
    this.setToken(data.access_token);
    return data;
  }
  async logout() {
    try {
      await this.post('/auth/logout');
    } catch {
      /* ignore */
    }
    this.setToken(null);
  }
  me() {
    return this.get('/auth/me');
  }
  forgotPassword(email: string) {
    return this.post('/auth/forgot-password', { email });
  }
  resetPassword(token: string, password: string) {
    return this.post('/auth/reset-password', { token, password });
  }
  changePassword(currentPassword: string, newPassword: string) {
    return this.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword });
  }

  // ── Products ──────────────────────────────────────────────────────────────
  products(params: Record<string, any> = {}) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
    });
    return this.get(`/products?${q.toString()}`);
  }
  product(id: string) {
    return this.get(`/products/${id}`);
  }
  hotProducts() {
    return this.get('/products/hot');
  }
  newProducts() {
    return this.get('/products/new');
  }

  // ── Discovery feed / recommendations ─────────────────────────────────────
  getFeed(params: { page?: number; per_page?: number } = {}) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) q.set(k, String(v));
    });
    return this.get(`/feed?${q.toString()}`);
  }
  getRecentlyViewed(limit = 20) {
    return this.get(`/feed/recently-viewed?limit=${limit}`);
  }
  logInteraction(
    interactionType: 'view' | 'wishlist_add' | 'wishlist_remove' | 'cart_add' | 'purchase' | 'search' | 'category_view',
    opts: { productId?: string; category?: string; searchQuery?: string } = {}
  ) {
    // Best-effort — a failed tracking call should never surface to the UI.
    return this.post('/feed/interactions', {
      interaction_type: interactionType,
      product_id: opts.productId,
      category: opts.category,
      search_query: opts.searchQuery,
    }).catch(() => undefined);
  }

  // ── Cart (guest-friendly via X-Session-Id) ──────────────────────────────
  getCart() {
    return this.get('/cart');
  }
  addToCart(productId: string, quantity = 1) {
    return this.post('/cart/items', { product_id: productId, quantity });
  }
  updateCartItem(itemId: string, quantity: number) {
    return this.put(`/cart/items/${itemId}`, { quantity });
  }
  removeCartItem(itemId: string) {
    return this.del(`/cart/items/${itemId}`);
  }
  clearCart() {
    return this.del('/cart');
  }

  // ── Orders ────────────────────────────────────────────────────────────────
  /** Works for guests AND logged-in users — no cart round-trip required. */
  createDirectOrder(
    items: { product_id: string; quantity: number }[],
    paymentMethod: string,
    contactInfo: Record<string, any>,
    affiliateRef?: string | null
  ) {
    const body: any = { payment_method: paymentMethod, contact_info: contactInfo, items };
    if (affiliateRef) body.affiliate_ref = affiliateRef;
    return this.post('/orders/direct', body);
  }
  createOrderFromCart(paymentMethod: string, contactInfo: Record<string, any>, promoCode?: string) {
    const body: any = { payment_method: paymentMethod, contact_info: contactInfo };
    if (promoCode) body.promo_code = promoCode;
    return this.post('/orders', body);
  }
  myOrders() {
    return this.get('/orders');
  }
  deleteOrder(orderId: string) {
    return this.del(`/orders/${orderId}`);
  }
  clearMyOrders() {
    return this.del('/orders');
  }

  // ── Favorites (wishlist) ─────────────────────────────────────────────────
  getFavorites() {
    return this.get('/favorites');
  }
  addFavorite(productId: string) {
    return this.post(`/favorites/${productId}`);
  }
  removeFavorite(productId: string) {
    return this.del(`/favorites/${productId}`);
  }

  // ── Affiliate / "Dolo" ───────────────────────────────────────────────────
  joinAffiliate() {
    return this.post('/affiliate/join');
  }
  validateInvite(inviteId: string) {
    return this.get(`/affiliate/validate-invite/${inviteId}`);
  }
  affiliateDashboard() {
    return this.get('/affiliate/dashboard');
  }
  referralLink(productId: string) {
    return this.get(`/affiliate/referral-link/${productId}`);
  }
  trackAffiliateClick(affiliateId: string, productId: string) {
    return this.post('/affiliate/click', { affiliate_id: affiliateId, product_id: productId });
  }
  requestAffiliateWithdrawal(amount: number, method: 'bank' | 'mobile_money' | 'wallet', details: Record<string, any>) {
    return this.post('/affiliate/withdrawal', { amount, method, payout_details: details });
  }
  myAffiliateWithdrawals() {
    return this.get('/affiliate/withdrawals');
  }

  // ── Seller ────────────────────────────────────────────────────────────────
  sellerApply(data: {
    business: string;
    phone: string;
    location: string;
    nid: string;
    description: string;
  }) {
    return this.post('/seller/apply', data);
  }
  withdrawSellerApplication() {
    return this.del('/seller/apply');
  }
  sellerDashboard() {
    return this.get('/seller/dashboard');
  }
  sellerProducts() {
    return this.get('/seller/products');
  }
  sellerSubmitProduct(data: Record<string, any>) {
    return this.post('/seller/products', data);
  }
  sellerDeleteProduct(id: string) {
    return this.del(`/seller/products/${id}`);
  }
  sellerOrders(params: Record<string, any> = {}) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v != null && q.set(k, String(v)));
    return this.get(`/seller/orders?${q.toString()}`);
  }
  sellerRequestPayout(amount: number, method: string, details: Record<string, any>) {
    return this.post('/seller/payout', { amount, method, details });
  }
  uploadSellerImages(files: File[]) {
    return this.uploadFiles('/admin/upload/seller-images', files);
  }

  // ── Community ─────────────────────────────────────────────────────────────
  getPosts() {
    return this.get('/community/posts');
  }
  createPost(content: string, images: string[] = [], categoryTag?: string, taggedProductId?: string) {
    return this.post('/community/posts', {
      content, images,
      category_tag: categoryTag,
      tagged_product_id: taggedProductId,
    });
  }
  deletePost(id: string) {
    return this.del(`/community/posts/${id}`);
  }
  likePost(id: string) {
    return this.post(`/community/posts/${id}/like`);
  }
  unlikePost(id: string) {
    return this.del(`/community/posts/${id}/like`);
  }
  addComment(postId: string, content: string) {
    return this.post(`/community/posts/${postId}/comments`, { content });
  }
  deleteComment(postId: string, commentId: string) {
    return this.del(`/community/posts/${postId}/comments/${commentId}`);
  }
  likeComment(postId: string, commentId: string) {
    return this.post(`/community/posts/${postId}/comments/${commentId}/like`);
  }
  unlikeComment(postId: string, commentId: string) {
    return this.del(`/community/posts/${postId}/comments/${commentId}/like`);
  }

  // ── Messages ──────────────────────────────────────────────────────────────
  myConversations() {
    return this.get('/messages/my');
  }
  deleteConversation(id: string) {
    return this.del(`/messages/${id}`);
  }
  startConversation(orderId: string | null, subject: string, message: string, mediaUrls: string[] = []) {
    return this.post('/messages/start', { order_id: orderId, subject, message, media_urls: mediaUrls });
  }
  getConversation(id: string) {
    return this.get(`/messages/${id}`);
  }
  replyMessage(convId: string, content: string, mediaUrls: string[] = []) {
    return this.post(`/messages/${convId}/reply`, { content, media_urls: mediaUrls });
  }
  uploadMessageImages(files: File[]) {
    return this.uploadFiles('/admin/upload/message-images', files);
  }
  // Admin messaging
  adminAllConversations() {
    return this.get('/messages/admin/all');
  }
  adminUnreadCount() {
    return this.get('/messages/admin/unread-count');
  }
  adminSearchUsers(q: string) {
    return this.get(`/messages/admin/search-users?q=${encodeURIComponent(q)}`);
  }
  adminStartConversation(userId: string, subject: string, message: string, mediaUrls: string[] = []) {
    return this.post('/messages/admin/start', { user_id: userId, subject, message, media_urls: mediaUrls });
  }
  adminUpdateConversation(id: string, data: { resolved?: boolean; read?: boolean }) {
    return this.patch(`/messages/admin/${id}`, data);
  }

  // ── Reviews ───────────────────────────────────────────────────────────────
  getReviews(productId: string) {
    return this.get(`/reviews/${productId}`);
  }
  addReview(productId: string, rating: number, comment?: string) {
    return this.post(`/reviews/${productId}`, { rating, comment });
  }
  deleteReview(reviewId: string) {
    return this.del(`/reviews/${reviewId}`);
  }

  // ── Promo codes ───────────────────────────────────────────────────────────
  validatePromo(code: string, subtotal?: number) {
    const qs = subtotal ? `?subtotal=${subtotal}` : '';
    return this.get(`/promo/validate/${encodeURIComponent(code)}${qs}`);
  }
  adminCreatePromo(data: Record<string, any>) {
    return this.post('/promo/admin/create', data);
  }
  adminListPromos() {
    return this.get('/promo/admin/list');
  }
  adminUpdatePromo(id: string, data: Record<string, any>) {
    return this.patch(`/promo/admin/${id}`, data);
  }
  adminDeletePromo(id: string) {
    return this.del(`/promo/admin/${id}`);
  }

  // ── Notifications ─────────────────────────────────────────────────────────
  broadcastNotification(title: string, body: string, url?: string) {
    return this.post('/notifications/broadcast', { title, body, url });
  }
  notificationCount() {
    return this.get('/notifications/count');
  }

  // ── Admin ─────────────────────────────────────────────────────────────────
  adminStats() {
    return this.get('/admin/stats');
  }
  adminAffiliates() {
    return this.get('/admin/affiliates');
  }
  adminAffiliateClicks() {
    return this.get('/admin/affiliate-clicks');
  }
  adminSetGlobalCommission(percent: number) {
    return this.post('/admin/affiliates/set-global-commission', { commission_percent: percent });
  }
  adminSetAffiliateCommission(userId: string, percent: number | null) {
    return this.patch(`/admin/affiliates/${userId}/commission`, { commission_percent: percent });
  }

  adminCreateProduct(data: Record<string, any>) {
    return this.post('/admin/products', data);
  }
  adminUpdateProduct(id: string, data: Record<string, any>) {
    return this.put(`/admin/products/${id}`, data);
  }
  adminDeleteProduct(id: string) {
    return this.del(`/admin/products/${id}`);
  }
  uploadAdminImages(files: File[]) {
    return this.uploadFiles('/admin/upload/images', files);
  }

  adminOrders(params: Record<string, any> = {}) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v != null && q.set(k, String(v)));
    return this.get(`/admin/orders?${q.toString()}`);
  }
  adminPatchOrder(id: string, status: string) {
    return this.patch(`/admin/orders/${id}`, { status });
  }
  adminDeleteOrder(id: string) {
    return this.del(`/admin/orders/${id}`);
  }
  adminClearOrders() {
    return this.del('/admin/orders');
  }

  adminUsers(params: Record<string, any> = {}) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v != null && q.set(k, String(v)));
    return this.get(`/admin/users?${q.toString()}`);
  }

  adminSellers(status?: string) {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.get(`/admin/sellers${q}`);
  }
  adminUpdateSeller(id: string, data: Record<string, any>) {
    return this.patch(`/admin/sellers/${id}`, data);
  }
  adminSellerProducts(status = 'pending') {
    return this.get(`/admin/seller-products?approval_status=${encodeURIComponent(status)}`);
  }
  adminApproveProduct(id: string, platformCommissionPct: number, affiliateCommissionPct: number) {
    return this.patch(`/admin/seller-products/${id}`, {
      approval_status: 'approved',
      platform_commission_percent: platformCommissionPct,
      affiliate_commission_percent: affiliateCommissionPct,
    });
  }
  adminRejectProduct(id: string, reason: string) {
    return this.patch(`/admin/seller-products/${id}`, { approval_status: 'rejected', reject_reason: reason });
  }

  adminWithdrawals() {
    return this.get('/admin/withdrawals');
  }
  adminApproveWithdrawal(id: string) {
    return this.put(`/admin/withdrawals/${id}/approve`);
  }
  adminRejectWithdrawal(id: string, note?: string) {
    return this.put(`/admin/withdrawals/${id}/reject`, note ? { note } : undefined);
  }

  adminAuditLogs() {
    return this.get('/admin/audit-logs');
  }

  // ── Export ────────────────────────────────────────────────────────────────
  async exportOrders(fmt: 'csv' | 'xlsx' = 'csv') {
    const headers: Record<string, string> = {};
    if (this._token) headers['Authorization'] = 'Bearer ' + this._token;
    const res = await fetch(`${API_BASE}/admin/export/orders?fmt=${fmt}`, { headers, credentials: 'include' });
    if (!res.ok) throw new ApiError('Export failed', res.status);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pamsika_orders_${new Date().toISOString().slice(0, 10)}.${fmt}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
  async exportWithdrawals(fmt: 'csv' | 'xlsx' = 'csv') {
    const headers: Record<string, string> = {};
    if (this._token) headers['Authorization'] = 'Bearer ' + this._token;
    const res = await fetch(`${API_BASE}/admin/export/withdrawals?fmt=${fmt}`, { headers, credentials: 'include' });
    if (!res.ok) throw new ApiError('Export failed', res.status);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pamsika_withdrawals_${new Date().toISOString().slice(0, 10)}.${fmt}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
}

export const Api = new ApiClient();
export { ApiError };
