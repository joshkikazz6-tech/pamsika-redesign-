export interface Product {
  id: string;
  name: string;
  category: 'Automobiles' | 'Fashion' | 'Real Estate' | 'Electronics' | 'Luxury Bags' | 'Footwear' | 'Timepieces' | 'Home Decor' | 'Others';
  price: number;
  currency: 'MWK' | 'USD';
  image: string;
  images?: string[];
  description?: string;
  sellerId?: string;
  sellerName?: string;
  sellerVerified?: boolean;
  commission?: number; // e.g. 5% or 10%
  likesCount?: number;
  viewsCount?: number;
  stock?: number;
  badge?: 'HOT' | 'NEW' | 'EXCLUSIVE' | 'FEATURED';
  rating?: number;
  status?: 'Approved' | 'Pending' | 'Rejected';
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'vendor' | 'system' | 'admin';
  text: string;
  timestamp: string;
  productRef?: Product;
}

export interface ChatConversation {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  type: 'seller' | 'buyer' | 'admin';
  messages: ChatMessage[];
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorBadge?: string;
  timestamp: string;
  content: string;
  image?: string;
  categoryTag?: string;
  likes: number;
  isLiked?: boolean;
  commentsCount: number;
}

export interface OrderItem {
  id: string;
  customerName: string;
  customerEmail: string;
  itemsSummary: string;
  amount: number;
  currency: 'MWK' | 'USD';
  paymentMethod: string;
  sellerName: string;
  affiliateName?: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Pending';
  date: string;
}

export interface SellerProfile {
  id: string;
  fullName: string;
  nationalId: string;
  phone: string;
  location: string;
  storeName: string;
  category: string;
  status: 'Active' | 'Pending' | 'Suspended';
  balance: number;
  currency: 'MWK' | 'USD';
  totalSales: number;
  storeViews: string;
}

export interface DoloAffiliate {
  id: string;
  name: string;
  email: string;
  doloId: string;
  balance: number;
  linkClicks: number;
  salesMade: number;
  totalEarned: number;
  inviteLink: string;
  subEarnings: number;
  subInvites: number;
}

export interface PendingProductApproval {
  id: string;
  productName: string;
  category: string;
  sellerName: string;
  sellerPrice: number;
  stock: number;
  submittedTime: string;
  description: string;
  images: string[];
  platformMarkupPct: number;
  affiliateCommPct: number;
}
