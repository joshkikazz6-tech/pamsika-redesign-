/* ================================================================
   Adapters — map backend (FastAPI/SQLAlchemy) JSON shapes onto the
   frontend's existing src/types.ts contracts, so every view component
   keeps working exactly as designed with zero prop-shape changes.
   ================================================================ */

import { Product, OrderItem, CommunityPost, PostComment, ChatConversation, ChatMessage, CartItem, SellerProfile, PendingProductApproval, DoloAffiliate } from '../types';

const FALLBACK_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDDAPWiWV47AkKi7TwwOsVy43l182AI4vQca9vjMVLJVE225ahupJyce9rn8uqsezfDgz5R06Qd6ggSv8sXW_jOW3X3KExIBZWmR3bXgQgmj6B4zinsycLYSTD47jRUK-LuALvBgf82ym38JF2r5R_Uvbhsay-VbR_M66b5dJ3J9b2WlUdk99odno1iOdfsb2Q0KSlF_v71BrwAjfxAGLYKpcQDyJf2ps2vcAv51JaYyx-0EcPTLgEIt_Xeajv2p9WRAd8xZRHU9wA';

// Backend `category` is a free-text string; frontend types.ts narrows it to a
// union. We pass whatever the backend has through and fall back to "Others"
// only if it's empty, since the union is really just used for filter chips.
export function adaptProduct(p: any): Product {
  const images: string[] = Array.isArray(p.images) && p.images.length ? p.images : [FALLBACK_IMAGE];
  return {
    id: String(p.id),
    name: p.name,
    category: (p.category || 'Others') as Product['category'],
    price: p.price,
    currency: 'MWK', // Backend stores MWK only — no per-product currency field.
    image: images[0],
    images,
    description: p.description,
    sellerId: p.seller_id ? String(p.seller_id) : undefined,
    sellerName: p.seller?.full_name || p.seller?.seller_business || (p.seller_id ? 'Verified Merchant' : 'Pa_mSikA'),
    sellerVerified: !!p.seller_id,
    commission: p.commission_percent,
    likesCount: p.likes ?? 0,
    viewsCount: p.views ?? 0,
    stock: p.stock ?? undefined,
    badge: p.badge ?? undefined,
    rating: p.rating ?? undefined,
    status:
      p.approval_status === 'approved'
        ? 'Approved'
        : p.approval_status === 'rejected'
        ? 'Rejected'
        : p.approval_status === 'pending'
        ? 'Pending'
        : undefined,
  };
}

export function adaptProducts(list: any[]): Product[] {
  return (list || []).map(adaptProduct);
}

// ── Orders ──────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, OrderItem['status']> = {
  pending: 'Pending',
  completed: 'Delivered',
  cancelled: 'Cancelled',
};

export function adaptOrder(o: any): OrderItem {
  const items = o.items || [];
  const itemsSummary = items
    .map((i: any) => `${i.product_snapshot?.name || i.product_name || 'Item'} x${i.quantity}`)
    .join(', ');
  return {
    id: String(o.id),
    customerName: o.customer_name || (o.contact_info || {}).name || 'You',
    customerEmail: o.customer_email || (o.contact_info || {}).email || '',
    itemsSummary: itemsSummary || 'Order',
    amount: o.total_amount,
    currency: 'MWK',
    paymentMethod: o.payment_method,
    sellerName: o.seller_name || 'Pa_mSikA',
    affiliateName: items.find((i: any) => i.affiliate_id)?.affiliate_id,
    status: STATUS_MAP[o.status] || 'Processing',
    date: (o.created_at || '').slice(0, 10),
  };
}

export function adaptOrders(list: any[]): OrderItem[] {
  return (list || []).map(adaptOrder);
}

// ── Community ─────────────────────────────────────────────────────────────

function adaptComment(c: any): PostComment {
  return {
    id: String(c.id),
    authorName: c.author || 'User',
    authorAvatar: FALLBACK_IMAGE,
    authorBadge: undefined,
    timestamp: c.created_at ? new Date(c.created_at).toLocaleString() : 'Just now',
    text: c.content,
    // The backend doesn't persist per-comment likes, so this is a
    // client-side-only affordance (see CHANGES.md — "Known scope limits").
    likes: 0,
    isLiked: false,
  };
}

export function adaptPost(p: any, currentUserId?: string): CommunityPost {
  return {
    id: String(p.id),
    authorName: p.author || 'User',
    authorAvatar: FALLBACK_IMAGE,
    authorBadge: undefined,
    timestamp: p.created_at ? new Date(p.created_at).toLocaleString() : 'Just now',
    content: p.content,
    image: (p.images && p.images[0]) || undefined,
    categoryTag: undefined,
    likes: p.likes ?? 0,
    isLiked: currentUserId ? (p.liked_by_ids || []).includes(currentUserId) : false,
    commentsCount: (p.comments || []).length,
    comments: (p.comments || []).map(adaptComment),
    // Tagged-product posts and an "admin post" flag aren't in the backend's
    // post schema yet (see CHANGES.md); left undefined rather than guessed.
    isAdminPost: undefined,
    taggedProduct: undefined,
  };
}

export function adaptPosts(list: any[], currentUserId?: string): CommunityPost[] {
  return (list || []).map((p) => adaptPost(p, currentUserId));
}

// ── Messages / Conversations ────────────────────────────────────────────────

export function adaptMessage(m: any): ChatMessage {
  return {
    id: String(m.id),
    sender: m.is_admin ? 'admin' : 'user',
    text: m.content,
    timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
  };
}

export function adaptConversation(c: any): ChatConversation {
  const messages = (c.messages || []).map(adaptMessage);
  const last = messages[messages.length - 1];
  return {
    id: String(c.id),
    name: c.subject || 'Pa_mSikA Support',
    avatar: FALLBACK_IMAGE,
    online: true,
    lastMessage: last ? last.text : '',
    timestamp: c.updated_at ? new Date(c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
    unreadCount: c.unread || 0,
    type: 'admin',
    messages,
  };
}

export function adaptConversations(list: any[]): ChatConversation[] {
  return (list || []).map(adaptConversation);
}

// ── Cart ──────────────────────────────────────────────────────────────────

/** Backend CartOut -> frontend CartItem[]. Drops lines whose product was deleted. */
export function adaptCart(cartOut: any): CartItem[] {
  const items = cartOut?.items || [];
  return items
    .filter((i: any) => i.product)
    .map((i: any) => ({
      id: String(i.id),
      product: adaptProduct(i.product),
      quantity: i.quantity,
    }));
}

// ── Seller (admin "Sellers" tab) ────────────────────────────────────────────

const SELLER_STATUS_MAP: Record<string, SellerProfile['status']> = {
  approved: 'Active',
  pending: 'Pending',
  rejected: 'Suspended',
};

export function adaptSellerProfile(s: any): SellerProfile {
  return {
    id: String(s.id),
    fullName: s.full_name,
    nationalId: s.seller_nid || '',
    phone: s.seller_phone || '',
    location: s.seller_location || '',
    storeName: s.seller_business || s.full_name,
    category: 'General',
    status: SELLER_STATUS_MAP[s.seller_status || 'pending'] || 'Pending',
    balance: s.seller_referral_bonus ?? 0,
    currency: 'MWK',
    totalSales: s.total_sales ?? 0,
    storeViews: String(s.store_views ?? 0),
  };
}

export function adaptSellerProfiles(list: any[]): SellerProfile[] {
  return (list || []).map(adaptSellerProfile);
}

/** Reverse map for AdminView's onToggleSellerStatus -> backend PATCH /admin/sellers/{id}. */
export function sellerStatusToBackend(status: SellerProfile['status']): string {
  if (status === 'Active') return 'approved';
  if (status === 'Suspended') return 'rejected';
  return 'pending';
}

// ── Pending product approvals (admin QC queue) ──────────────────────────────

export function adaptPendingApproval(p: any): PendingProductApproval {
  return {
    id: String(p.id),
    productName: p.name,
    category: p.category,
    sellerName: p.seller?.full_name || p.seller?.seller_business || 'Seller',
    sellerPrice: p.seller_price ?? p.price,
    stock: p.stock ?? 0,
    submittedTime: p.created_at ? new Date(p.created_at).toLocaleString() : '',
    description: p.description || '',
    images: p.images && p.images.length ? p.images : [FALLBACK_IMAGE],
    platformMarkupPct: 10,
    affiliateCommPct: p.affiliate_commission_percent ?? p.commission_percent ?? 5,
  };
}

export function adaptPendingApprovals(list: any[]): PendingProductApproval[] {
  return (list || []).map(adaptPendingApproval);
}

// ── Dolo / Affiliate dashboard ───────────────────────────────────────────────

export function adaptDoloData(dash: any, user: { full_name: string; email: string }, frontendUrl: string): DoloAffiliate {
  return {
    id: dash.affiliate_id || '',
    name: user.full_name,
    email: user.email,
    doloId: dash.affiliate_id || '',
    balance: dash.commission_balance ?? 0,
    linkClicks: dash.clicks ?? 0,
    salesMade: dash.sales ?? 0,
    totalEarned: dash.total_earned ?? 0,
    inviteLink: (dash.personal_referral_link || '').replace(/^https?:\/\//, ''),
    subEarnings: dash.sub_affiliate_earned ?? 0,
    subInvites: dash.invited_affiliates_count ?? 0,
  };
}
