import React, { useState } from 'react';
import { OrderItem, SellerProfile, PendingProductApproval } from '../types';

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

interface AdminViewProps {
  orders: OrderItem[];
  sellers: SellerProfile[];
  pendingApprovals: PendingProductApproval[];
  stats: AdminStats | null;
  withdrawals: AdminWithdrawalItem[];
  onApproveProduct: (approvalId: string, markupPct: number, commPct: number) => void;
  onRejectProduct: (approvalId: string) => void;
  onToggleOrderDone: (orderId: string) => void;
  onCancelOrder: (orderId: string) => void;
  onToggleSellerStatus: (sellerId: string, status: SellerProfile['status']) => void;
  onExportOrders: () => void;
  onBroadcast: (title: string, body: string) => void;
  onApproveWithdrawal: (id: string) => void;
  onShowToast: (msg: string) => void;
  onNavigate?: (view: any) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  orders,
  sellers,
  pendingApprovals,
  stats,
  withdrawals,
  onApproveProduct,
  onRejectProduct,
  onToggleOrderDone,
  onCancelOrder,
  onToggleSellerStatus,
  onExportOrders,
  onBroadcast,
  onApproveWithdrawal,
  onShowToast,
  onNavigate
}) => {
  const [activeNav, setActiveNav] = useState<
    'home' | 'overview' | 'orders' | 'sellers' | 'approvals' | 'products' | 'affiliates' | 'withdrawals' | 'users' | 'promos' | 'notify' | 'inbox'
  >('overview');

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Broadcast notification form state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');

  // Approval filter states
  const [approvalSearch, setApprovalSearch] = useState('');
  const [approvalCategory, setApprovalCategory] = useState('ALL');
  const [approvalSort, setApprovalSort] = useState<'oldest' | 'newest'>('oldest');

  // Seller filter states
  const [sellerSearch, setSellerSearch] = useState('');
  const [sellerStatusFilter, setSellerStatusFilter] = useState<'ALL' | 'Active' | 'Pending' | 'Suspended'>('ALL');

  // Business Analytics timeframe state
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<'30d' | '90d' | '1y'>('30d');

  // Notifications Toggle & List State
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState([
    {
      id: 'n1',
      title: 'New Product Approval Required',
      desc: 'The Heritage Bifold – Cognac submitted by Aiden Craftworks',
      time: '10m ago',
      unread: true,
      navId: 'approvals'
    },
    {
      id: 'n2',
      title: 'High Volume Withdrawal Request',
      desc: 'Chitipa Farmers Co-op requested payout of MWK 1,250,000',
      time: '45m ago',
      unread: true,
      navId: 'withdrawals'
    },
    {
      id: 'n3',
      title: 'New Seller Registration',
      desc: 'Blantyre Electronics Hub submitted verification docs',
      time: '2h ago',
      unread: true,
      navId: 'sellers'
    },
    {
      id: 'n4',
      title: 'System Health Optimal',
      desc: 'Database response latency operating at peak performance (12ms)',
      time: '5h ago',
      unread: false,
      navId: 'overview'
    }
  ]);

  const unreadCount = notificationsList.filter((n) => n.unread).length;

  // Markup state per product card or global fallback
  const [markupMap, setMarkupMap] = useState<Record<string, { markup: number; comm: number }>>({
    'appr-1': { markup: 25, comm: 10 },
    'appr-2': { markup: 25, comm: 10 },
    'appr-3': { markup: 30, comm: 15 },
  });

  const getMarkup = (id: string) => markupMap[id]?.markup ?? 25;
  const getComm = (id: string) => markupMap[id]?.comm ?? 10;

  const updateMarkup = (id: string, markup: number, comm: number) => {
    setMarkupMap((prev) => ({
      ...prev,
      [id]: { markup, comm }
    }));
  };

  // Real pending approvals from the backend (no mock fallback — an empty
  // queue should show an empty state, not fabricated sample products).
  const displayApprovals: PendingProductApproval[] = pendingApprovals;

  const filteredApprovals = displayApprovals.filter((appr) => {
    const matchesSearch =
      appr.productName.toLowerCase().includes(approvalSearch.toLowerCase()) ||
      appr.sellerName.toLowerCase().includes(approvalSearch.toLowerCase());
    const matchesCat =
      approvalCategory === 'ALL' ||
      appr.category.toLowerCase().includes(approvalCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  const filteredSellers = sellers.filter((sel) => {
    const matchesSearch =
      sel.storeName.toLowerCase().includes(sellerSearch.toLowerCase()) ||
      sel.fullName.toLowerCase().includes(sellerSearch.toLowerCase()) ||
      sel.location.toLowerCase().includes(sellerSearch.toLowerCase());
    const matchesStatus =
      sellerStatusFilter === 'ALL' || sel.status === sellerStatusFilter;
    return matchesSearch && matchesStatus;
  });

  interface NavMenuItem {
    id: 'home' | 'overview' | 'orders' | 'sellers' | 'approvals' | 'products' | 'affiliates' | 'withdrawals' | 'users' | 'promos' | 'notify' | 'inbox';
    label: string;
    icon: string;
    badge?: number;
  }

  const navMenuItems: NavMenuItem[] = [
    { id: 'home', label: 'STOREFRONT HOME', icon: 'home' },
    { id: 'overview', label: 'OVERVIEW', icon: 'grid_view' },
    { id: 'orders', label: 'ORDERS', icon: 'shopping_cart' },
    { id: 'sellers', label: 'SELLERS', icon: 'store' },
    { id: 'approvals', label: 'APPROVALS', icon: 'verified', badge: displayApprovals.length },
    { id: 'products', label: 'PRODUCTS', icon: 'inventory_2' },
    { id: 'affiliates', label: 'AFFILIATES', icon: 'group' },
    { id: 'withdrawals', label: 'WITHDRAWALS', icon: 'payments', badge: 14 },
    { id: 'users', label: 'USERS', icon: 'person' },
    { id: 'promos', label: 'PROMOS', icon: 'sell' },
    { id: 'notify', label: 'NOTIFY', icon: 'campaign' },
    { id: 'inbox', label: 'INBOX', icon: 'mail' },
  ];

  return (
    <div className="min-h-screen bg-[#fef7ff] text-[#1d1a24] flex font-sans">
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-[#ccc3d7]/40 z-50 flex-col pt-6 pb-6 shadow-[4px_0_12px_rgba(0,0,0,0.02)]">
        {/* Brand Logo Header */}
        <div className="px-6 mb-8 flex items-center justify-between">
          <span className="font-serif-source text-2xl font-bold text-[#5300b7] tracking-tight">
            Pa_mSikA
          </span>
          <span className="text-[10px] font-bold text-[#5300b7] bg-[#ebddff] px-2 py-0.5 rounded-full uppercase">
            Admin
          </span>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
          {navMenuItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'home') {
                    if (onNavigate) {
                      onNavigate('home');
                    } else {
                      onShowToast('Navigating to Marketplace Home');
                    }
                    return;
                  }
                  setActiveNav(item.id);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  isActive
                    ? 'bg-[#5300b7] text-white shadow-md'
                    : 'text-[#4a4455] hover:bg-[#f3ebf9] hover:text-[#1d1a24]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">
                    {item.icon}
                  </span>
                  <span className="uppercase tracking-wider">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-white text-[#5300b7]' : 'bg-[#5300b7] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Link */}
        <div className="px-4 mt-4 pt-4 border-t border-[#ccc3d7]/30">
          <button
            onClick={() => onShowToast('Logged out of Super Admin Portal')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-[#ba1a1a] hover:bg-[#ffdad6] transition-all text-left"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="uppercase tracking-wider">LOGOUT</span>
          </button>
        </div>
      </aside>

      {/* MOBILE SIDEBAR DRAWER */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />
          <aside className="relative z-10 w-64 bg-white h-full flex flex-col pt-6 pb-6 shadow-2xl overflow-y-auto">
            <div className="px-6 mb-6 flex items-center justify-between">
              <span className="font-serif-source text-2xl font-bold text-[#5300b7]">
                Pa_mSikA
              </span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 text-[#4a4455] hover:text-[#5300b7]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <nav className="flex-1 px-4 space-y-1">
              {navMenuItems.map((item) => {
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'home') {
                        if (onNavigate) {
                          onNavigate('home');
                        } else {
                          onShowToast('Navigating to Marketplace Home');
                        }
                        setMobileSidebarOpen(false);
                        return;
                      }
                      setActiveNav(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-left ${
                      isActive
                        ? 'bg-[#5300b7] text-white shadow-md'
                        : 'text-[#4a4455] hover:bg-[#f3ebf9]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px]">
                        {item.icon}
                      </span>
                      <span className="uppercase tracking-wider">{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isActive ? 'bg-white text-[#5300b7]' : 'bg-[#5300b7] text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* TOP HEADER BAR */}
        <header className="sticky top-0 z-40 h-16 bg-[#fef7ff]/90 backdrop-blur-md border-b border-[#ccc3d7]/40 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-[#5300b7] rounded-xl hover:bg-[#f3ebf9]"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="font-serif-source text-xl sm:text-2xl font-bold text-[#1d1a24]">
              Admin Dashboard
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate('home');
                } else {
                  onShowToast('Navigating to Storefront Home');
                }
              }}
              className="p-2 text-[#5300b7] hover:bg-[#f3ebf9] rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Go to Storefront Home"
            >
              <span className="material-symbols-outlined text-[20px]">home</span>
              <span className="hidden sm:inline">Storefront</span>
            </button>

            {/* Working Notifications Toggle Button & Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`relative p-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center ${
                  notificationsOpen
                    ? 'bg-[#5300b7] text-white shadow-xs'
                    : 'text-[#4a4455] hover:text-[#5300b7] hover:bg-[#f3ebf9]'
                }`}
                title="Notifications"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ba1a1a] border-2 border-white rounded-full"></span>
                )}
              </button>

              {/* Interactive Notifications Popover Menu */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#ccc3d7]/40 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-4 bg-[#fef7ff] border-b border-[#ccc3d7]/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#5300b7] text-[20px]">notifications_active</span>
                      <h4 className="font-serif-source font-bold text-sm text-[#1d1a24]">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="bg-[#5300b7] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => {
                          setNotificationsList((prev) => prev.map((n) => ({ ...n, unread: false })));
                          onShowToast('All notifications marked as read');
                        }}
                        className="text-[11px] font-bold text-[#5300b7] hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-[#ccc3d7]/20">
                    {notificationsList.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#7b7486]">No notifications right now</div>
                    ) : (
                      notificationsList.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setNotificationsList((prev) =>
                              prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
                            );
                            setActiveNav(item.navId as any);
                            setNotificationsOpen(false);
                            onShowToast(`Opened: ${item.title}`);
                          }}
                          className={`p-3.5 hover:bg-[#f8f2fc] transition-colors cursor-pointer flex gap-3 items-start ${
                            item.unread ? 'bg-[#fef7ff]' : ''
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              item.unread ? 'bg-[#5300b7]' : 'bg-transparent'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-xs font-bold truncate ${item.unread ? 'text-[#1d1a24]' : 'text-[#4a4455]'}`}>
                                {item.title}
                              </p>
                              <span className="text-[10px] text-[#7b7486] shrink-0">{item.time}</span>
                            </div>
                            <p className="text-[11px] text-[#4a4455] line-clamp-2 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2.5 bg-[#fef7ff] border-t border-[#ccc3d7]/30 text-center">
                    <button
                      onClick={() => {
                        setActiveNav('notify');
                        setNotificationsOpen(false);
                      }}
                      className="text-xs font-bold text-[#5300b7] hover:bg-[#f3ebf9] w-full py-1.5 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>View All Broadcasts &amp; Alerts</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* DYNAMIC VIEW CONTAINER */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* ==================== OVERVIEW TAB ==================== */}
          {activeNav === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Hero Card */}
              <section
                className="relative overflow-hidden rounded-3xl text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCe3W5-52iMPXKPSxyaFnRDl1Mo1tytzSKT7go8Ela-DDWkt0jK4PMThxgIbYMXpXDTYyq4lKdbS6wa3dTr3FOU9BrZ8wiKs7qexpM8CtTwGYeqLLyWPTGr512ylPjGFSUbFfXrEEnbyjVnOWFZvsFaEXQjO6-qiaaSsBm-Yhab6GvC34uUCfCuh5lMWgmFru2KtlZcJhhCFoYC4xoGee1sBa9J8yU-Xw0RDITJlRmKz3I_31nIup284Qgx54SLfTZ5DM48DcuCF3Y')`
                }}
              >
                {/* Dark Purple Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#250059]/95 via-[#5300b7]/85 to-[#250059]/80" />

                <div className="relative z-10 space-y-3 max-w-2xl">
                  <h1 className="font-serif-source text-3xl sm:text-4xl font-bold tracking-tight">
                    Welcome back, Admin.
                  </h1>
                  <p className="text-xs sm:text-sm text-[#dac5ff] leading-relaxed">
                    Here's what's happening today. Your ecosystem is growing at a rate of 12% this week. Review pending approvals to maintain marketplace velocity.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => onShowToast('Refreshed real-time analytics!')}
                      className="bg-white/20 hover:bg-white/30 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer backdrop-blur-xs"
                    >
                      <span className="material-symbols-outlined text-[18px]">refresh</span>
                      <span>REFRESH STATS</span>
                    </button>
                    <button
                      onClick={() => setActiveNav('approvals')}
                      className="bg-[#6d28d9] hover:bg-[#5b00c5] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      <span>REVIEW PRODUCT APPROVALS</span>
                    </button>
                    <button
                      onClick={() => setActiveNav('sellers')}
                      className="bg-white text-[#5300b7] hover:bg-[#fef7ff] px-4 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-md"
                    >
                      VIEW SELLER APPLICATIONS
                    </button>
                  </div>
                </div>

                <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center min-w-[220px] w-full md:w-auto shrink-0 shadow-lg">
                  <span className="text-xs font-bold text-[#dac5ff] uppercase tracking-widest block mb-1">
                    GROSS REVENUE
                  </span>
                  <span className="font-serif-source text-3xl font-bold text-white block">
                    MWK {(stats?.total_revenue ?? 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-[#dac5ff] mt-1 block">Completed orders, all-time</span>
                </div>
              </section>

              {/* 8 KPI Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Revenue */}
                <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-[#f3ebf9] text-[#5300b7] rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">payments</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#4a4455] uppercase tracking-wider block">
                      TOTAL REVENUE
                    </span>
                    <span className="font-serif-source text-2xl font-bold text-[#1d1a24]">
                      MWK {(stats?.total_revenue ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Total Users */}
                <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-[#f3ebf9] text-[#5300b7] rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">group</span>
                    </div>
                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                      Growth
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#4a4455] uppercase tracking-wider block">
                      TOTAL USERS
                    </span>
                    <span className="font-serif-source text-2xl font-bold text-[#1d1a24]">
                      {(stats?.total_users ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Products */}
                <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-[#f3ebf9] text-[#5300b7] rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#4a4455] uppercase tracking-wider block">
                      PRODUCTS
                    </span>
                    <span className="font-serif-source text-2xl font-bold text-[#1d1a24]">
                      {(stats?.total_products ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Orders */}
                <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-[#f3ebf9] text-[#5300b7] rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#4a4455] uppercase tracking-wider block">
                      ORDERS
                    </span>
                    <span className="font-serif-source text-2xl font-bold text-[#1d1a24]">
                      {(stats?.total_orders ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Active Sellers */}
                <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-[#f3ebf9] text-[#5300b7] rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">store</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      {stats?.pending_seller_approvals ?? 0} PENDING
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#4a4455] uppercase tracking-wider block">
                      ACTIVE SELLERS
                    </span>
                    <span className="font-serif-source text-2xl font-bold text-[#1d1a24]">
                      {(stats?.active_sellers ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Total Affiliates */}
                <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-[#f3ebf9] text-[#5300b7] rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">share</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#4a4455] uppercase tracking-wider block">
                      TOTAL AFFILIATES
                    </span>
                    <span className="font-serif-source text-2xl font-bold text-[#1d1a24]">
                      {(stats?.total_affiliates ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Product Approvals */}
                <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">campaign</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#4a4455] uppercase tracking-wider block">
                      PRODUCT APPROVALS
                    </span>
                    <span className="font-serif-source text-2xl font-bold text-[#1d1a24]">
                      {pendingApprovals.length}
                    </span>
                  </div>
                </div>

                {/* Pending Withdrawals */}
                <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between border-l-4 border-l-[#ba1a1a]">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-[#ffdad6] text-[#ba1a1a] rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-white bg-[#ba1a1a] px-2 py-0.5 rounded-full uppercase">
                      URGENT
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#4a4455] uppercase tracking-wider block">
                      PENDING WITHDRAWALS
                    </span>
                    <span className="font-serif-source text-2xl font-bold text-[#ba1a1a]">
                      {stats?.pending_withdrawals ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* System Health & Traffic + Recent Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Traffic Graph Box */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#ccc3d7]/40 shadow-xs space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-serif-source text-xl font-bold text-[#1d1a24]">
                      System Health &amp; Traffic
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-semibold text-[#4a4455]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#5300b7]"></span> Sellers
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#c5c6c8]"></span> Users
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar Chart mockup */}
                  <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-[#ccc3d7]/30">
                    {[65, 40, 85, 55, 75, 45, 90, 60, 95].map((val, idx) => (
                      <div key={idx} className="flex-1 flex items-end justify-center gap-1 h-full">
                        <div
                          style={{ height: `${val}%` }}
                          className="w-full max-w-[18px] bg-[#ebddff] hover:bg-[#5300b7] transition-all rounded-t-lg"
                          title={`Sellers Activity: ${val}%`}
                        />
                        <div
                          style={{ height: `${Math.max(20, val - 20)}%` }}
                          className="w-full max-w-[12px] bg-[#f3ebf9] rounded-t-lg"
                          title={`Users Activity: ${val - 20}%`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Alerts Feed */}
                <div className="bg-white p-6 rounded-3xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-serif-source text-xl font-bold text-[#1d1a24] mb-4">
                      Recent Alerts
                    </h3>
                    <div className="space-y-4 text-xs">
                      <div className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-[#ba1a1a] mt-1.5 shrink-0"></span>
                        <div>
                          <p className="font-bold text-[#1d1a24]">New Withdrawal Request</p>
                          <p className="text-[#4a4455]">MWK 150,000 from Seller #402</p>
                          <span className="text-[10px] text-purple-700 font-semibold">2 mins ago</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-[#5300b7] mt-1.5 shrink-0"></span>
                        <div>
                          <p className="font-bold text-[#1d1a24]">Seller Application</p>
                          <p className="text-[#4a4455]">"TechHub Malawi" is requesting access</p>
                          <span className="text-[10px] text-[#7b7486]">15 mins ago</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-[#7b7486] mt-1.5 shrink-0"></span>
                        <div>
                          <p className="font-bold text-[#1d1a24]">Bulk Product Import</p>
                          <p className="text-[#4a4455]">Completed 1,200 entries</p>
                          <span className="text-[10px] text-[#7b7486]">1 hour ago</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onShowToast('Audit Logs exported!')}
                    className="w-full py-2.5 rounded-xl border border-[#ccc3d7] text-[#5300b7] font-bold text-xs hover:bg-[#f3ebf9] transition-colors cursor-pointer"
                  >
                    VIEW ALL AUDIT LOGS
                  </button>
                </div>
              </div>

              {/* Business Analysis & Growth Analytics Section */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ccc3d7]/40 shadow-xs space-y-6">
                {/* Header & Timeframe Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ccc3d7]/30">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="p-1 bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">trending_up</span>
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        BUSINESS GROWING (+24.8% YoY)
                      </span>
                    </div>
                    <h3 className="font-serif-source text-2xl font-bold text-[#1d1a24]">
                      Business Performance &amp; Consumer Analytics
                    </h3>
                    <p className="text-xs text-[#4a4455] mt-0.5">
                      Tracking overall revenue trajectory alongside user browsing intent vs. actual purchases
                    </p>
                  </div>

                  {/* Timeframe Buttons */}
                  <div className="flex items-center gap-1.5 bg-[#f3ebf9] p-1 rounded-xl self-start sm:self-auto">
                    {(['30d', '90d', '1y'] as const).map((period) => (
                      <button
                        key={period}
                        onClick={() => setAnalyticsTimeframe(period)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          analyticsTimeframe === period
                            ? 'bg-[#5300b7] text-white shadow-xs'
                            : 'text-[#4a4455] hover:text-[#5300b7]'
                        }`}
                      >
                        {period === '30d' ? '30 Days' : period === '90d' ? '3 Months' : '1 Year'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Key Metric Highlights Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#fef7ff] p-4 rounded-2xl border border-[#ebddff]">
                  <div>
                    <span className="text-[10px] font-bold text-[#7b7486] uppercase tracking-wider block">
                      Revenue Trajectory
                    </span>
                    <span className="font-serif-source text-lg font-bold text-[#5300b7]">
                      {analyticsTimeframe === '30d' ? 'MWK 4,500,000' : analyticsTimeframe === '90d' ? 'MWK 12,800,000' : 'MWK 48,200,000'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block">+18.2% vs prev period</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#7b7486] uppercase tracking-wider block">
                      Total Product Views
                    </span>
                    <span className="font-serif-source text-lg font-bold text-[#1d1a24]">
                      {analyticsTimeframe === '30d' ? '128,400' : analyticsTimeframe === '90d' ? '382,000' : '1,450,000'}
                    </span>
                    <span className="text-[10px] text-purple-600 font-bold block">+32.5% browsing interest</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#7b7486] uppercase tracking-wider block">
                      Completed Purchases
                    </span>
                    <span className="font-serif-source text-lg font-bold text-[#1d1a24]">
                      {analyticsTimeframe === '30d' ? '850 Orders' : analyticsTimeframe === '90d' ? '2,420 Orders' : '9,810 Orders'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block">+14.1% completed checkouts</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#7b7486] uppercase tracking-wider block">
                      Avg Conversion Rate
                    </span>
                    <span className="font-serif-source text-lg font-bold text-[#1d1a24]">
                      6.61%
                    </span>
                    <span className="text-[10px] text-amber-600 font-bold block">Strong commercial intent</span>
                  </div>
                </div>

                {/* Main Line Graph Component */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#4a4455]">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#5300b7]">show_chart</span>
                      Business Growth Line Graph
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-1 bg-[#5300b7] rounded-full inline-block"></span>
                        <span className="text-[#5300b7]">Revenue Growth (MWK)</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-1 bg-[#10b981] rounded-full inline-block"></span>
                        <span className="text-[#10b981]">Product Views (Interest)</span>
                      </span>
                    </div>
                  </div>

                  {/* SVG Line Graph */}
                  <div className="relative w-full overflow-x-auto bg-[#faf8fc] p-4 sm:p-6 rounded-2xl border border-[#ccc3d7]/30">
                    <svg viewBox="0 0 800 240" className="w-full h-60 min-w-[620px]" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="revenueGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#5300b7" stopOpacity="0.30" />
                          <stop offset="100%" stopColor="#5300b7" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Gridlines */}
                      <line x1="40" y1="30" x2="760" y2="30" stroke="#e5e7eb" strokeDasharray="4 4" />
                      <line x1="40" y1="80" x2="760" y2="80" stroke="#e5e7eb" strokeDasharray="4 4" />
                      <line x1="40" y1="130" x2="760" y2="130" stroke="#e5e7eb" strokeDasharray="4 4" />
                      <line x1="40" y1="180" x2="760" y2="180" stroke="#e5e7eb" strokeDasharray="4 4" />

                      {/* Area Fill under Revenue Line */}
                      <path
                        d="M 60,180 Q 170,160 280,120 T 500,80 T 740,35 L 740,195 L 60,195 Z"
                        fill="url(#revenueGrowthGrad)"
                      />

                      {/* Revenue Growth Smooth Vector Line */}
                      <path
                        d="M 60,180 Q 170,160 280,120 T 500,80 T 740,35"
                        fill="none"
                        stroke="#5300b7"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />

                      {/* Product Views Line */}
                      <path
                        d="M 60,190 Q 170,140 280,110 T 500,65 T 740,25"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeDasharray="6 4"
                        strokeLinecap="round"
                      />

                      {/* Data Points & Tooltips */}
                      {[
                        { x: 60, y: 180, rev: 'MWK 1.2M', label: analyticsTimeframe === '30d' ? 'Wk 1' : analyticsTimeframe === '90d' ? 'Month 1' : 'Q1' },
                        { x: 173, y: 160, rev: 'MWK 1.8M', label: analyticsTimeframe === '30d' ? 'Wk 2' : analyticsTimeframe === '90d' ? 'Month 2' : 'Q2' },
                        { x: 286, y: 120, rev: 'MWK 2.4M', label: analyticsTimeframe === '30d' ? 'Wk 3' : analyticsTimeframe === '90d' ? 'Month 3' : 'Q3' },
                        { x: 400, y: 95, rev: 'MWK 3.1M', label: analyticsTimeframe === '30d' ? 'Wk 4' : analyticsTimeframe === '90d' ? 'Month 4' : 'Q4' },
                        { x: 513, y: 75, rev: 'MWK 3.7M', label: analyticsTimeframe === '30d' ? 'Wk 5' : analyticsTimeframe === '90d' ? 'Month 5' : 'Q5' },
                        { x: 626, y: 55, rev: 'MWK 4.1M', label: analyticsTimeframe === '30d' ? 'Wk 6' : analyticsTimeframe === '90d' ? 'Month 6' : 'Q6' },
                        { x: 740, y: 35, rev: 'MWK 4.5M', label: analyticsTimeframe === '30d' ? 'Wk 7' : analyticsTimeframe === '90d' ? 'Current' : 'Q7' },
                      ].map((pt, i) => (
                        <g key={i} className="group cursor-pointer">
                          <circle cx={pt.x} cy={pt.y} r="6" fill="#5300b7" stroke="#ffffff" strokeWidth="2" />
                          <circle cx={pt.x} cy={pt.y} r="10" fill="#5300b7" opacity="0.2" className="group-hover:scale-125 transition-transform" />
                          <text x={pt.x} y="215" textAnchor="middle" fill="#6b7280" fontSize="11" fontWeight="bold">
                            {pt.label}
                          </text>
                          <text x={pt.x} y={pt.y - 12} textAnchor="middle" fill="#5300b7" fontSize="10" fontWeight="bold">
                            {pt.rev}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* What Users Are Viewing vs. Buying Breakdown */}
                <div className="pt-2 border-t border-[#ccc3d7]/30">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <h4 className="font-serif-source text-lg font-bold text-[#1d1a24] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#5300b7]">insights</span>
                        Consumer Behavior: High View Interest vs. Actual Purchases
                      </h4>
                      <p className="text-xs text-[#4a4455]">
                        Comparing items that receive massive browsing volume with products converting into finalized sales
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Item 1 */}
                    <div className="bg-[#fef7ff] p-4 rounded-2xl border border-[#ccc3d7]/40 flex flex-col justify-between space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-extrabold text-[#5300b7] bg-[#f3ebf9] px-2 py-0.5 rounded-md uppercase">
                            TEXTILES &amp; FASHION
                          </span>
                          <h5 className="font-bold text-sm text-[#1d1a24] mt-1">Chitenje African Wax Fabrics</h5>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                          13.1% Conv.
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <div className="flex justify-between text-[#4a4455] font-semibold mb-1">
                            <span>Views: 24,500</span>
                            <span className="text-[#5300b7] font-bold">Buys: 640 Orders (MWK 1.28M)</span>
                          </div>
                          <div className="w-full bg-[#e8def8] h-2.5 rounded-full overflow-hidden flex">
                            <div className="bg-[#10b981] h-full" style={{ width: '80%' }} title="Views" />
                            <div className="bg-[#5300b7] h-full" style={{ width: '20%' }} title="Purchases" />
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#4a4455] italic bg-white p-2 rounded-xl border border-[#ccc3d7]/30">
                        🔥 High Demand &amp; High Purchase Rate: Top volume driver in soft goods and traditional apparel.
                      </p>
                    </div>

                    {/* Item 2 */}
                    <div className="bg-[#fef7ff] p-4 rounded-2xl border border-[#ccc3d7]/40 flex flex-col justify-between space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-extrabold text-[#5300b7] bg-[#f3ebf9] px-2 py-0.5 rounded-md uppercase">
                            ELECTRONICS
                          </span>
                          <h5 className="font-bold text-sm text-[#1d1a24] mt-1">Samsung Galaxy S22 Ultra</h5>
                        </div>
                        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                          1.5% Conv.
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <div className="flex justify-between text-[#4a4455] font-semibold mb-1">
                            <span>Views: 31,200 (Highest Views)</span>
                            <span className="text-[#5300b7] font-bold">Buys: 48 Orders (MWK 1.44M)</span>
                          </div>
                          <div className="w-full bg-[#e8def8] h-2.5 rounded-full overflow-hidden flex">
                            <div className="bg-[#3b82f6] h-full" style={{ width: '92%' }} title="Views" />
                            <div className="bg-[#5300b7] h-full" style={{ width: '8%' }} title="Purchases" />
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#4a4455] italic bg-white p-2 rounded-xl border border-[#ccc3d7]/30">
                        👀 High Browsing Curiosity: Users view heavily for price comparisons before buying.
                      </p>
                    </div>

                    {/* Item 3 */}
                    <div className="bg-[#fef7ff] p-4 rounded-2xl border border-[#ccc3d7]/40 flex flex-col justify-between space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-extrabold text-[#5300b7] bg-[#f3ebf9] px-2 py-0.5 rounded-md uppercase">
                            GROCERIES &amp; FOOD
                          </span>
                          <h5 className="font-bold text-sm text-[#1d1a24] mt-1">Fresh Lake Chambo Fish (5kg Pack)</h5>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                          27.5% Conv.
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <div className="flex justify-between text-[#4a4455] font-semibold mb-1">
                            <span>Views: 18,900</span>
                            <span className="text-[#5300b7] font-bold">Buys: 520 Orders (MWK 780k)</span>
                          </div>
                          <div className="w-full bg-[#e8def8] h-2.5 rounded-full overflow-hidden flex">
                            <div className="bg-[#10b981] h-full" style={{ width: '70%' }} title="Views" />
                            <div className="bg-[#5300b7] h-full" style={{ width: '30%' }} title="Purchases" />
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#4a4455] italic bg-white p-2 rounded-xl border border-[#ccc3d7]/30">
                        ⚡ Fastest Conversion: Essential fresh local product with immediate order completion.
                      </p>
                    </div>

                    {/* Item 4 */}
                    <div className="bg-[#fef7ff] p-4 rounded-2xl border border-[#ccc3d7]/40 flex flex-col justify-between space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-extrabold text-[#5300b7] bg-[#f3ebf9] px-2 py-0.5 rounded-md uppercase">
                            SOLAR &amp; ENERGY
                          </span>
                          <h5 className="font-bold text-sm text-[#1d1a24] mt-1">5kVA Solar Power Inverter Set</h5>
                        </div>
                        <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full">
                          4.2% Conv.
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <div className="flex justify-between text-[#4a4455] font-semibold mb-1">
                            <span>Views: 14,800</span>
                            <span className="text-[#5300b7] font-bold">Buys: 62 Orders (MWK 930k)</span>
                          </div>
                          <div className="w-full bg-[#e8def8] h-2.5 rounded-full overflow-hidden flex">
                            <div className="bg-[#8b5cf6] h-full" style={{ width: '85%' }} title="Views" />
                            <div className="bg-[#5300b7] h-full" style={{ width: '15%' }} title="Purchases" />
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#4a4455] italic bg-white p-2 rounded-xl border border-[#ccc3d7]/30">
                        🔋 High Ticket Solution: High order values drive strong overall merchant volume.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== APPROVALS TAB ==================== */}
          {activeNav === 'approvals' && (
            <div className="space-y-6">
              {/* Quality Control Header Banner */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-[#5300b7] uppercase tracking-widest block mb-1">
                    QUALITY CONTROL
                  </span>
                  <h1 className="font-serif-source text-3xl font-bold text-[#1d1a24]">
                    Product Approvals
                  </h1>
                  <p className="text-xs text-[#4a4455] max-w-xl mt-1 leading-relaxed">
                    Maintain marketplace integrity by reviewing incoming inventory. Ensure pricing strategy aligns with affiliate incentives and platform margins.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-[#f3ebf9] px-4 py-3 rounded-2xl border border-[#ccc3d7]/30 text-center min-w-[120px]">
                    <span className="text-[9px] font-bold text-[#7b7486] uppercase block">PENDING REVIEW</span>
                    <span className="font-serif-source text-xl font-bold text-[#5300b7]">{filteredApprovals.length} Items</span>
                  </div>
                  <div className="bg-[#f3ebf9] px-4 py-3 rounded-2xl border border-[#ccc3d7]/30 text-center min-w-[120px]">
                    <span className="text-[9px] font-bold text-[#7b7486] uppercase block">AVG. TAT</span>
                    <span className="font-serif-source text-xl font-bold text-[#1d1a24]">4.2 Hrs</span>
                  </div>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="bg-white p-3 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex-1 min-w-[260px] flex items-center bg-[#fef7ff] rounded-xl px-3 py-2 border border-[#ccc3d7]/50">
                  <span className="material-symbols-outlined text-[#4a4455] text-[20px] shrink-0">search</span>
                  <input
                    type="text"
                    value={approvalSearch}
                    onChange={(e) => setApprovalSearch(e.target.value)}
                    placeholder="Search by product name or seller..."
                    className="bg-transparent border-none focus:outline-none text-xs w-full px-2 text-[#1d1a24] placeholder-[#4a4455]/60"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={approvalCategory}
                    onChange={(e) => setApprovalCategory(e.target.value)}
                    className="bg-white border border-[#ccc3d7] text-xs font-bold text-[#4a4455] px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">CATEGORY: ALL</option>
                    <option value="Fashion">Fashion &amp; Acc.</option>
                    <option value="Tech">Tech &amp; Gaming</option>
                    <option value="Home">Home Decor</option>
                  </select>

                  <select
                    value={approvalSort}
                    onChange={(e) => setApprovalSort(e.target.value as any)}
                    className="bg-white border border-[#ccc3d7] text-xs font-bold text-[#4a4455] px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
                  >
                    <option value="oldest">OLDEST FIRST</option>
                    <option value="newest">NEWEST FIRST</option>
                  </select>
                </div>
              </div>

              {/* Product Approval Cards Grid */}
              {filteredApprovals.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center text-[#7b7486] border border-[#ccc3d7]/40 shadow-xs">
                  <span className="material-symbols-outlined text-4xl text-emerald-600 mb-2">verified</span>
                  <h3 className="font-serif-source text-xl font-bold text-[#1d1a24]">Queue Cleared!</h3>
                  <p className="text-xs mt-1">No products currently match your review filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredApprovals.map((appr) => {
                    const mk = getMarkup(appr.id);
                    const cm = getComm(appr.id);

                    const platEarnings = appr.sellerPrice * (mk / 100);
                    const affilEarnings = appr.sellerPrice * (cm / 100);
                    const mktPrice = appr.sellerPrice + platEarnings + affilEarnings;
                    const markupPctDisplay = (((mktPrice - appr.sellerPrice) / appr.sellerPrice) * 100).toFixed(1);

                    return (
                      <div
                        key={appr.id}
                        className="bg-white rounded-3xl p-6 border border-[#ccc3d7]/40 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row gap-4">
                          {/* Left Images Preview */}
                          <div className="w-full sm:w-36 h-36 rounded-2xl overflow-hidden bg-[#f3ebf9] shrink-0 relative flex flex-col gap-1">
                            <img
                              src={appr.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
                              alt={appr.productName}
                              className="w-full h-full object-cover"
                            />
                            {appr.images.length > 1 && (
                              <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                                +{appr.images.length - 1} More
                              </span>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-[#5300b7] uppercase px-2 py-0.5 bg-[#ebddff] rounded-md">
                                {appr.category}
                              </span>
                              <span className="text-[#7b7486]">
                                Stock: {appr.stock} Units • {appr.submittedTime}
                              </span>
                            </div>

                            <h3 className="font-serif-source text-lg font-bold text-[#1d1a24] leading-snug">
                              {appr.productName}
                            </h3>

                            <p className="text-xs text-[#4a4455] line-clamp-2 leading-relaxed">
                              {appr.description}
                            </p>

                            {/* Prices */}
                            <div className="pt-1 flex items-baseline gap-4">
                              <div>
                                <span className="text-[9px] font-bold text-[#7b7486] uppercase block">
                                  SELLER PRICE
                                </span>
                                <span className="font-serif-source text-base font-bold text-[#1d1a24]">
                                  ${appr.sellerPrice.toFixed(2)}
                                </span>
                              </div>
                              <div>
                                <span className="text-[9px] font-bold text-[#5300b7] uppercase block">
                                  MARKETPLACE PRICE
                                </span>
                                <span className="font-serif-source text-base font-bold text-[#5300b7]">
                                  ${mktPrice.toFixed(2)}{' '}
                                  <span className="text-[10px] font-semibold text-emerald-600">
                                    +{markupPctDisplay}%
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Financial Matrix Breakdown */}
                        <div className="bg-[#fef7ff] p-3 rounded-2xl border border-[#ccc3d7]/30 grid grid-cols-3 gap-2 text-center text-xs">
                          <div>
                            <span className="text-[9px] text-[#7b7486] uppercase block font-semibold">PLAT. EARNS</span>
                            <span className="font-bold text-[#5300b7]">${platEarnings.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#7b7486] uppercase block font-semibold">AFFIL. EARNS</span>
                            <span className="font-bold text-[#5300b7]">${affilEarnings.toFixed(2)}</span>
                          </div>
                          <div className="bg-[#ebddff]/50 rounded-xl py-1">
                            <span className="text-[9px] text-[#5300b7] uppercase block font-semibold">SELLER RECEIVES</span>
                            <span className="font-bold text-[#5300b7]">${appr.sellerPrice.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Interactive Percentage Adjustments */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[10px] font-bold text-[#7b7486] uppercase mb-1">
                              PLAT. MARKUP %
                            </label>
                            <input
                              type="number"
                              value={mk}
                              onChange={(e) =>
                                updateMarkup(appr.id, parseFloat(e.target.value) || 0, cm)
                              }
                              className="w-full bg-[#fef7ff] border border-[#ccc3d7] rounded-xl px-3 py-1.5 text-xs font-bold text-[#1d1a24] focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-[#7b7486] uppercase mb-1">
                              AFFIL. COMM %
                            </label>
                            <input
                              type="number"
                              value={cm}
                              onChange={(e) =>
                                updateMarkup(appr.id, mk, parseFloat(e.target.value) || 0)
                              }
                              className="w-full bg-[#fef7ff] border border-[#ccc3d7] rounded-xl px-3 py-1.5 text-xs font-bold text-[#1d1a24] focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                            />
                          </div>
                        </div>

                        {/* Verification & Action Buttons */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#ccc3d7]/30">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#5300b7] text-[18px]">badge</span>
                            <div>
                              <p className="text-xs font-bold text-[#1d1a24]">{appr.sellerName}</p>
                              <span className="text-[9px] font-extrabold text-[#5300b7] uppercase tracking-wider block">
                                VERIFIED SELLER
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => {
                                onRejectProduct(appr.id);
                                onShowToast(`Rejected product "${appr.productName}"`);
                              }}
                              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-[#ba1a1a] font-bold text-xs hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              REJECT
                            </button>
                            <button
                              onClick={() => {
                                onApproveProduct(appr.id, mk, cm);
                                onShowToast(`Approved "${appr.productName}" for Live Marketplace!`);
                              }}
                              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#5300b7] hover:bg-[#6d28d9] text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                            >
                              APPROVE &amp; GO LIVE
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Load More Button */}
              <div className="text-center pt-4">
                <button
                  onClick={() => onShowToast('Loaded older approval queue!')}
                  className="px-6 py-3 rounded-xl border border-[#ccc3d7] bg-white text-[#1d1a24] font-bold text-xs hover:bg-[#f3ebf9] transition-colors shadow-xs cursor-pointer"
                >
                  LOAD MORE PENDING PRODUCTS
                </button>
              </div>
            </div>
          )}

          {/* ==================== SELLERS TAB ==================== */}
          {activeNav === 'sellers' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-[#5300b7] uppercase tracking-widest block mb-1">
                    MERCHANT NETWORK
                  </span>
                  <h1 className="font-serif-source text-3xl font-bold text-[#1d1a24]">
                    Sellers Management
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2 overflow-hidden">
                    <img
                      className="inline-block h-8 w-8 rounded-full border-2 border-white"
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                      alt="User"
                    />
                    <img
                      className="inline-block h-8 w-8 rounded-full border-2 border-white"
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
                      alt="User"
                    />
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#f3ebf9] text-[#5300b7] font-bold text-[10px] border-2 border-white">
                      +12
                    </div>
                  </div>

                  <button
                    onClick={() => onShowToast('Invite link generated for new merchant onboarding!')}
                    className="flex items-center gap-2 bg-[#5300b7] hover:bg-[#6d28d9] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    <span>INVITE SELLER</span>
                  </button>
                </div>
              </div>

              {/* 4 Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Sellers */}
                <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-[#f3ebf9] text-[#5300b7] rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">storefront</span>
                    </div>
                    <span className="text-xs font-bold text-[#4a4455]">+4% this month</span>
                  </div>
                  <div>
                    <span className="font-serif-source text-3xl font-bold text-[#1d1a24]">430</span>
                    <span className="text-[10px] font-bold text-[#4a4455] uppercase tracking-wider block">
                      TOTAL SELLERS
                    </span>
                  </div>
                </div>

                {/* Approved Active */}
                <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">verified</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-serif-source text-3xl font-bold text-[#1d1a24]">418</span>
                    <span className="text-[10px] font-bold text-[#4a4455] uppercase tracking-wider block">
                      APPROVED ACTIVE
                    </span>
                  </div>
                </div>

                {/* Pending Review */}
                <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">pending_actions</span>
                    </div>
                    <span className="bg-[#ba1a1a] text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                      URGENT
                    </span>
                  </div>
                  <div>
                    <span className="font-serif-source text-3xl font-bold text-[#ba1a1a]">12</span>
                    <span className="text-[10px] font-bold text-[#4a4455] uppercase tracking-wider block">
                      PENDING REVIEW
                    </span>
                  </div>
                </div>

                {/* Settlement Pool */}
                <div className="bg-[#5300b7] text-white p-5 rounded-2xl shadow-md flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-white/20 text-white rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                    </div>
                    <span className="text-[10px] text-[#dac5ff]">Settlement Pool</span>
                  </div>
                  <div>
                    <span className="font-serif-source text-2xl font-bold text-white block">MWK 2.4M</span>
                    <span className="text-[10px] font-bold text-[#dac5ff] uppercase tracking-wider block">
                      SELLER BALANCES
                    </span>
                  </div>
                </div>
              </div>

              {/* Search & Filter Controls */}
              <div className="bg-[#f3ebf9] p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex-1 min-w-[280px] flex items-center bg-white rounded-xl px-3 py-2 border border-[#ccc3d7]/50">
                  <span className="material-symbols-outlined text-[#4a4455] text-[20px] shrink-0">search</span>
                  <input
                    type="text"
                    value={sellerSearch}
                    onChange={(e) => setSellerSearch(e.target.value)}
                    placeholder="Search by name, shop, or ID..."
                    className="bg-transparent border-none focus:outline-none text-xs w-full px-2 text-[#1d1a24] placeholder-[#4a4455]/60"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={sellerStatusFilter}
                    onChange={(e) => setSellerStatusFilter(e.target.value as any)}
                    className="bg-white border border-[#ccc3d7] text-xs font-bold text-[#4a4455] px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">STATUS: ALL</option>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                  </select>

                  <button
                    onClick={() => onShowToast('Exported Seller Roster CSV')}
                    className="p-2 bg-white border border-[#ccc3d7] rounded-xl text-[#4a4455] hover:text-[#5300b7]"
                    title="Download"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                  </button>

                  <span className="text-xs font-bold text-[#4a4455] hidden sm:inline">Show: 25 Rows</span>
                </div>
              </div>

              {/* Sellers Management Table */}
              <div className="bg-white rounded-3xl shadow-xs overflow-hidden border border-[#ccc3d7]/40">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#f3ebf9]/60 border-b border-[#ccc3d7]/40 text-[#4a4455] font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-4">MERCHANT / EMAIL</th>
                        <th className="p-4">BUSINESS</th>
                        <th className="p-4">LOCATION</th>
                        <th className="p-4">NATIONAL ID</th>
                        <th className="p-4 text-right">BALANCE</th>
                        <th className="p-4 text-center">STATUS</th>
                        <th className="p-4 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ccc3d7]/30">
                      {filteredSellers.map((s) => (
                        <tr key={s.id} className="hover:bg-[#fef7ff] transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#f3ebf9] flex items-center justify-center text-[#5300b7] font-bold text-xs shrink-0">
                                {s.fullName.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-[#1d1a24] block truncate">{s.fullName}</span>
                                <span className="text-[10px] text-[#7b7486] truncate block">{s.storeName.toLowerCase().replace(/\s+/g, '')}@pamsika.mw</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-[#1d1a24] block">{s.storeName}</span>
                            <span className="text-[10px] text-[#7b7486]">{s.category}</span>
                          </td>
                          <td className="p-4 text-[#4a4455]">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px] text-[#5300b7]">location_on</span>
                              <span>{s.location}</span>
                            </span>
                          </td>
                          <td className="p-4 font-mono text-[#7b7486]">{s.nationalId}</td>
                          <td className="p-4 text-right font-serif-source font-bold text-base text-[#1d1a24]">
                            MWK {s.balance.toLocaleString()}
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                s.status === 'Active'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : s.status === 'Pending'
                                  ? 'bg-[#ebddff] text-[#5300b7]'
                                  : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {s.status === 'Active' ? (
                              <button
                                onClick={() => {
                                  onToggleSellerStatus(s.id, 'Suspended');
                                  onShowToast(`Suspended seller "${s.storeName}"`);
                                }}
                                className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 text-[10px] font-bold hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                SUSPEND
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  onToggleSellerStatus(s.id, 'Active');
                                  onShowToast(`Approved seller "${s.storeName}"`);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-[#5300b7] text-white text-[10px] font-bold hover:bg-[#6d28d9] transition-colors shadow-xs cursor-pointer"
                              >
                                APPROVE
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer Pagination */}
                <div className="p-4 bg-[#f3ebf9]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7b7486]">
                  <span>Showing 1 to {filteredSellers.length} of {sellers.length} sellers</span>
                  <div className="flex items-center gap-1">
                    <button className="px-3 py-1 bg-white border border-[#ccc3d7] rounded-lg hover:bg-gray-50">Prev</button>
                    <button className="px-3 py-1 bg-[#5300b7] text-white font-bold rounded-lg">1</button>
                    <button className="px-3 py-1 bg-white border border-[#ccc3d7] rounded-lg hover:bg-gray-50">2</button>
                    <button className="px-3 py-1 bg-white border border-[#ccc3d7] rounded-lg hover:bg-gray-50">Next</button>
                  </div>
                </div>
              </div>

              {/* Map & Insight Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 relative h-60 rounded-3xl overflow-hidden shadow-sm bg-[#5300b7] text-white p-6 flex flex-col justify-between">
                  <div className="relative z-10 max-w-md">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#dac5ff] block mb-1">
                      GEOGRAPHIC INTELLIGENCE
                    </span>
                    <h3 className="font-serif-source text-2xl font-bold">Regional Distribution</h3>
                    <p className="text-xs text-[#dac5ff] mt-2 leading-relaxed">
                      Our merchant network is concentrated in Blantyre (42%) and Lilongwe (35%), with emerging growth in the Northern Region.
                    </p>
                  </div>
                  <div className="relative z-10 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-xs font-bold text-white">3 Active Registrations in Mzuzu</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-[#5300b7] uppercase tracking-widest block mb-1">
                      QUICK INSIGHT
                    </span>
                    <h4 className="font-serif-source text-lg font-bold text-[#1d1a24]">
                      Verification Speed
                    </h4>
                    <p className="text-xs text-[#4a4455] mt-2 leading-relaxed">
                      Average seller approval time has dropped by <span className="text-emerald-600 font-bold">18%</span> since the new automated document verification pipeline was enabled.
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-1">
                      <span className="text-[#4a4455]">Verification Accuracy</span>
                      <span className="text-[#5300b7]">99.2%</span>
                    </div>
                    <div className="w-full h-2 bg-[#f3ebf9] rounded-full overflow-hidden">
                      <div className="h-full bg-[#5300b7] rounded-full w-[99.2%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== ORDERS TAB ==================== */}
          {activeNav === 'orders' && (
            <div className="bg-white rounded-3xl p-6 border border-[#ccc3d7]/40 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-serif-source text-2xl font-bold text-[#1d1a24]">System Orders Ledger</h3>
                <button
                  onClick={onExportOrders}
                  className="bg-[#5300b7] text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-[#6d28d9]"
                >
                  Download Export
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f3ebf9] text-[#4a4455] border-b border-[#ccc3d7]/30 text-[10px] font-bold uppercase">
                      <th className="p-3">Ref ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Summary</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ccc3d7]/20">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#fef7ff]">
                        <td className="p-3 font-bold text-[#5300b7]">{ord.id}</td>
                        <td className="p-3 font-medium text-[#1d1a24]">
                          {ord.customerName}
                          <span className="block text-[10px] text-[#7b7486]">{ord.customerEmail}</span>
                        </td>
                        <td className="p-3 text-[#4a4455]">{ord.itemsSummary}</td>
                        <td className="p-3 font-serif-source font-bold text-sm text-[#1d1a24]">
                          MWK {ord.amount.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 bg-[#ebddff] text-[#5300b7] font-bold rounded-full uppercase text-[9px]">
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              onToggleOrderDone(ord.id);
                              onShowToast(`Updated status for ${ord.id}`);
                            }}
                            className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            Delivered
                          </button>
                          <button
                            onClick={() => {
                              onCancelOrder(ord.id);
                              onShowToast(`Cancelled ${ord.id}`);
                            }}
                            className="px-3 py-1 bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== PRODUCTS TAB ==================== */}
          {activeNav === 'products' && (
            <div className="bg-white rounded-3xl p-6 border border-[#ccc3d7]/40 shadow-xs space-y-4">
              <h3 className="font-serif-source text-2xl font-bold text-[#1d1a24]">Live Marketplace Catalog</h3>
              <p className="text-xs text-[#4a4455]">
                Manage all published inventory across all categories and regions.
              </p>
              <div className="p-8 text-center bg-[#f3ebf9]/30 rounded-2xl border border-[#ccc3d7]/30">
                <span className="material-symbols-outlined text-3xl text-[#5300b7] mb-2">inventory_2</span>
                <p className="font-bold text-sm text-[#1d1a24]">{(stats?.total_products ?? 0).toLocaleString()} Verified Products Active</p>
                <p className="text-xs text-[#7b7486] mt-1">Products are synchronized with live inventory servers.</p>
              </div>
            </div>
          )}

          {/* ==================== AFFILIATES TAB ==================== */}
          {activeNav === 'affiliates' && (
            <div className="bg-white rounded-3xl p-6 border border-[#ccc3d7]/40 shadow-xs space-y-4">
              <h3 className="font-serif-source text-2xl font-bold text-[#1d1a24]">Dolo Affiliate Network</h3>
              <p className="text-xs text-[#4a4455]">
                Track top performing promoters, link clicks, commission payouts, and sub-affiliate tiers.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-[#f3ebf9] rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-[#7b7486] uppercase block">TOTAL AFFILIATES</span>
                  <span className="font-serif-source text-2xl font-bold text-[#5300b7]">{(stats?.total_affiliates ?? 0).toLocaleString()}</span>
                </div>
                <div className="p-4 bg-[#f3ebf9] rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-[#7b7486] uppercase block">PENDING WITHDRAWALS</span>
                  <span className="font-serif-source text-2xl font-bold text-[#1d1a24]">{stats?.pending_withdrawals ?? 0}</span>
                </div>
                <div className="p-4 bg-[#f3ebf9] rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-[#7b7486] uppercase block">TOTAL REVENUE</span>
                  <span className="font-serif-source text-2xl font-bold text-emerald-600">MWK {(stats?.total_revenue ?? 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* ==================== WITHDRAWALS TAB ==================== */}
          {activeNav === 'withdrawals' && (
            <div className="bg-white rounded-3xl p-6 border border-[#ccc3d7]/40 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-serif-source text-2xl font-bold text-[#1d1a24]">Seller &amp; Affiliate Withdrawals</h3>
                  <p className="text-xs text-[#4a4455]">Review and disburse payout requests via Mobile Money or Bank Transfer.</p>
                </div>
                <span className="px-3 py-1 bg-rose-100 text-rose-700 font-extrabold text-xs rounded-full">
                  {withdrawals.filter((w) => w.status === 'pending').length} PENDING REQUESTS
                </span>
              </div>

              {withdrawals.filter((w) => w.status === 'pending').length > 0 ? (
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                  <p className="font-bold text-xs text-amber-900">Immediate Settlement Notice</p>
                  <p className="text-xs text-amber-800">
                    Total payout volume pending approval:{' '}
                    <span className="font-bold">
                      MWK {withdrawals.filter((w) => w.status === 'pending').reduce((s, w) => s + w.amount, 0).toLocaleString()}
                    </span>
                  </p>
                  <button
                    onClick={() => {
                      withdrawals.filter((w) => w.status === 'pending').forEach((w) => onApproveWithdrawal(w.id));
                      onShowToast('Approved all pending withdrawal payouts!');
                    }}
                    className="mt-2 bg-[#5300b7] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#6d28d9] cursor-pointer"
                  >
                    PROCESS ALL BATCH PAYOUTS
                  </button>
                </div>
              ) : (
                <div className="p-8 text-center bg-[#f3ebf9]/30 rounded-2xl border border-[#ccc3d7]/30">
                  <span className="material-symbols-outlined text-3xl text-[#5300b7] mb-2">task_alt</span>
                  <p className="font-bold text-sm text-[#1d1a24]">No pending withdrawal requests</p>
                </div>
              )}

              {withdrawals.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#f3ebf9] text-[#4a4455] border-b border-[#ccc3d7]/30 text-[10px] font-bold uppercase">
                        <th className="p-3">User</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Method</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ccc3d7]/20">
                      {withdrawals.map((w) => (
                        <tr key={w.id}>
                          <td className="p-3 font-medium text-[#1d1a24]">{w.user_name || 'User'}</td>
                          <td className="p-3 font-serif-source font-bold text-[#1d1a24]">MWK {w.amount.toLocaleString()}</td>
                          <td className="p-3 text-[#4a4455] capitalize">{w.method}</td>
                          <td className="p-3">
                            <span className="px-2.5 py-1 bg-[#ebddff] text-[#5300b7] font-bold rounded-full uppercase text-[9px]">
                              {w.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ==================== USERS TAB ==================== */}
          {activeNav === 'users' && (
            <div className="bg-white rounded-3xl p-6 border border-[#ccc3d7]/40 shadow-xs space-y-4">
              <h3 className="font-serif-source text-2xl font-bold text-[#1d1a24]">User Accounts &amp; Access Control</h3>
              <p className="text-xs text-[#4a4455]">
                {(stats?.total_users ?? 0).toLocaleString()} registered buyer and seller accounts, {(stats?.active_sellers ?? 0).toLocaleString()} of them active sellers.
              </p>
            </div>
          )}

          {/* ==================== PROMOS TAB ==================== */}
          {activeNav === 'promos' && (
            <div className="bg-white rounded-3xl p-6 border border-[#ccc3d7]/40 shadow-xs space-y-4">
              <h3 className="font-serif-source text-2xl font-bold text-[#1d1a24]">Promotional Campaigns &amp; Vouchers</h3>
              <p className="text-xs text-[#4a4455]">
                Manage discount vouchers, zero-commission seller periods, and holiday banners.
              </p>
            </div>
          )}

          {/* ==================== NOTIFY TAB ==================== */}
          {activeNav === 'notify' && (
            <div className="bg-white rounded-3xl p-6 border border-[#ccc3d7]/40 shadow-xs space-y-4">
              <h3 className="font-serif-source text-2xl font-bold text-[#1d1a24]">System Broadcasts &amp; SMS Alerts</h3>
              <p className="text-xs text-[#4a4455]">
                Send push notifications and SMS updates directly to sellers or buyers.
              </p>
              <div className="space-y-3 pt-2 max-w-lg">
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="Broadcast Headline..."
                  className="w-full bg-[#fef7ff] border border-[#ccc3d7] rounded-xl px-3 py-2 text-xs font-bold"
                />
                <textarea
                  rows={3}
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  placeholder="Type broadcast announcement text..."
                  className="w-full bg-[#fef7ff] border border-[#ccc3d7] rounded-xl p-3 text-xs"
                />
                <button
                  onClick={() => {
                    if (!broadcastTitle.trim() || !broadcastBody.trim()) {
                      onShowToast('Please fill in both the headline and message');
                      return;
                    }
                    onBroadcast(broadcastTitle, broadcastBody);
                    setBroadcastTitle('');
                    setBroadcastBody('');
                  }}
                  className="bg-[#5300b7] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#6d28d9] cursor-pointer"
                >
                  SEND BROADCAST NOW
                </button>
              </div>
            </div>
          )}

          {/* ==================== INBOX TAB ==================== */}
          {activeNav === 'inbox' && (
            <div className="bg-white rounded-3xl p-6 border border-[#ccc3d7]/40 shadow-xs space-y-4">
              <h3 className="font-serif-source text-2xl font-bold text-[#1d1a24]">Support &amp; Admin Inbox</h3>
              <p className="text-xs text-[#4a4455]">
                Review customer inquiries, seller dispute tickets, and system automated logs.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

