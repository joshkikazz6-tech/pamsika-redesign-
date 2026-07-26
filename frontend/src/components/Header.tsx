import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentView: string;
  currentCity: string;
  onSelectCity: (city: string) => void;
  onNavigate: (view: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  unreadMessagesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  currentCity,
  onSelectCity,
  onNavigate,
  searchQuery,
  onSearchChange,
  cartCount,
  unreadMessagesCount = 0
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, openAuthModal, logout } = useAuth();
  const cities = ['Lilongwe', 'Blantyre', 'Mzuzu', 'Zomba'];

  const initials = user
    ? user.full_name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  const roleLabel = user
    ? user.is_admin
      ? 'Super Admin • Verified'
      : user.is_seller && user.seller_status === 'approved'
      ? 'Verified Seller'
      : user.is_affiliate
      ? 'Dolo Affiliate'
      : 'Member'
    : 'Guest';

  const handleAvatarClick = () => {
    if (!user) {
      openAuthModal('login');
    } else {
      onNavigate('settings');
    }
  };

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setIsMenuOpen(false);
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'marketplace', label: 'Marketplace', icon: 'storefront' },
    { id: 'cart', label: 'Shopping Cart', icon: 'shopping_cart', badge: cartCount },
    { id: 'wishlist', label: 'Wishlist', icon: 'favorite' },
    { id: 'messages', label: 'Messages', icon: 'chat_bubble', badge: unreadMessagesCount },
    { id: 'community', label: 'Community Feed', icon: 'groups' },
  ];

  const portalItems = [
    { id: 'dolo', label: 'Dolo Affiliate Hub', icon: 'token' },
    { id: 'seller', label: 'SellerHub Dashboard', icon: 'store' },
    ...(user?.is_admin ? [{ id: 'admin', label: 'Super Admin Portal', icon: 'dashboard_customize' }] : []),
  ];

  return (
    <>
      <header className="fixed top-0 w-full z-40 bg-[#fbf8ff]/85 backdrop-blur-xl pt-safe shadow-sm border-b border-[#ccc3d7]/30">
        <div className="h-16 md:h-20 px-2.5 sm:px-4 md:px-8 max-w-7xl mx-auto flex items-center gap-2 justify-between min-w-0">
          
          {/* Upper Left: Menu Toggle + Brand Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 text-[#5300b7] hover:bg-[#5300b7]/10 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Open Navigation Menu"
              title="Open Navigation Menu"
            >
              <span className="material-symbols-outlined text-[26px]">menu</span>
            </button>

            <div 
              onClick={() => onNavigate('home')} 
              className="cursor-pointer flex items-center gap-1 shrink-0"
            >
              <span className="font-serif-source text-lg sm:text-2xl font-bold text-[#5300b7] tracking-tight">
                Pa_mSikA
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 min-w-0 max-w-lg mx-1 sm:mx-2 flex items-center bg-[#f4f2fd] rounded-full px-2.5 sm:px-3 py-1.5 border border-[#ccc3d7]/50 focus-within:ring-2 focus-within:ring-[#5300b7]/30 transition-all">
            <span className="material-symbols-outlined text-[#4a4455] text-[18px] sm:text-[20px] shrink-0">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search..."
              className="bg-transparent border-none focus:outline-none text-xs sm:text-sm w-full px-1 sm:px-2 text-[#1a1b22] placeholder-[#4a4455]/60 min-w-0"
            />
            <div className="hidden sm:block w-[1px] h-4 bg-[#ccc3d7]/50 mx-1 shrink-0"></div>
            
            {/* Location Selector */}
            <div className="relative group shrink-0 hidden sm:flex items-center gap-1 text-[#5300b7] cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              <select
                value={currentCity}
                onChange={(e) => onSelectCity(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#5300b7] focus:outline-none cursor-pointer pr-1"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0">
            {/* Dolo Quick Button */}
            <button
              onClick={() => onNavigate('dolo')}
              className="flex flex-col items-center justify-center min-w-[32px] sm:min-w-[40px] h-9 sm:h-10 text-[#5300b7] hover:bg-[#5300b7]/5 rounded-xl px-1 sm:px-1.5 transition-colors"
              title="Dolo Affiliate Hub"
            >
              <span className="material-symbols-outlined text-[18px] sm:text-[20px]">token</span>
              <span className="hidden sm:inline text-[8px] sm:text-[9px] font-bold uppercase tracking-wider leading-none mt-0.5">Dolo</span>
            </button>

            {/* Cart Icon Button */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative p-1.5 sm:p-2 text-[#4a4455] hover:text-[#5300b7] hover:bg-[#5300b7]/5 rounded-full transition-colors"
              title="Shopping Cart"
            >
              <span className="material-symbols-outlined text-[20px] sm:text-[22px]">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#5300b7] text-white text-[9px] sm:text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile / Settings */}
            <button
              onClick={handleAvatarClick}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#5300b7] flex items-center justify-center text-white font-semibold text-[10px] sm:text-xs shadow-sm hover:scale-105 transition-transform"
              title={user ? 'Account Settings' : 'Sign In'}
            >
              {user ? initials : <span className="material-symbols-outlined text-[16px]">person</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Upper Left Menu Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
          />

          {/* Drawer Content */}
          <aside className="relative z-10 w-80 max-w-[82vw] h-full bg-white shadow-2xl flex flex-col justify-between p-5 overflow-y-auto animate-in slide-in-from-left duration-300">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-[#ccc3d7]/30 pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-serif-source text-2xl font-bold text-[#5300b7]">
                    Pa_mSikA
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#ebddff] text-[#5300b7] rounded-full">
                    Malawi
                  </span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 text-[#4a4455] hover:text-[#5300b7] hover:bg-[#f4f2fd] rounded-full transition-colors cursor-pointer"
                  title="Close menu"
                >
                  <span className="material-symbols-outlined text-[22px]">close</span>
                </button>
              </div>

              {/* City Location Mobile Selector */}
              <div className="bg-[#f4f2fd] p-3 rounded-2xl border border-[#ccc3d7]/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#5300b7]">
                  <span className="material-symbols-outlined text-[20px]">location_on</span>
                  <span className="text-xs font-bold">Active City:</span>
                </div>
                <select
                  value={currentCity}
                  onChange={(e) => onSelectCity(e.target.value)}
                  className="bg-white border border-[#ccc3d7]/50 rounded-xl px-2.5 py-1 text-xs font-bold text-[#5300b7] focus:outline-none cursor-pointer"
                >
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Main Navigation Links */}
              <div>
                <p className="text-[10px] font-bold text-[#7b7486] uppercase tracking-widest px-2 mb-2">
                  Explore Marketplace
                </p>
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                          isActive
                            ? 'bg-[#5300b7] text-white shadow-md'
                            : 'text-[#1a1b22] hover:bg-[#f4f2fd]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[20px]">
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              isActive
                                ? 'bg-white text-[#5300b7]'
                                : 'bg-[#5300b7] text-white'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Ecosystem Portals */}
              <div>
                <p className="text-[10px] font-bold text-[#7b7486] uppercase tracking-widest px-2 mb-2">
                  Portals &amp; Sellers
                </p>
                <nav className="space-y-1">
                  {portalItems.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
                          isActive
                            ? 'bg-[#5300b7] text-white shadow-md'
                            : 'text-[#4a4455] hover:bg-[#f4f2fd]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Preferences & Settings */}
              <div>
                <p className="text-[10px] font-bold text-[#7b7486] uppercase tracking-widest px-2 mb-2">
                  Preferences
                </p>
                <nav className="space-y-1">
                  <button
                    onClick={() => handleNavClick('settings')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
                      currentView === 'settings'
                        ? 'bg-[#5300b7] text-white shadow-md'
                        : 'text-[#4a4455] hover:bg-[#f4f2fd]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">settings</span>
                    <span>Account Settings</span>
                  </button>
                  {user ? (
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                        onNavigate('home');
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left text-red-600 hover:bg-red-50"
                    >
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                      <span>Sign Out</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        openAuthModal('login');
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left text-[#5300b7] hover:bg-[#f4f2fd]"
                    >
                      <span className="material-symbols-outlined text-[20px]">login</span>
                      <span>Sign In / Register</span>
                    </button>
                  )}
                </nav>
              </div>
            </div>

            {/* Drawer Footer User Profile */}
            <div className="pt-4 border-t border-[#ccc3d7]/30 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#5300b7] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#1a1b22] truncate">{user ? user.full_name : 'Guest'}</p>
                <p className="text-[10px] text-[#7b7486]">{roleLabel}</p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

