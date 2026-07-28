import React, { useState } from 'react';

interface HeaderProps {
  currentView: string;
  currentCity: string;
  onSelectCity: (city: string) => void;
  onNavigate: (view: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  unreadMessagesCount?: number;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  userName?: string;
  userRole?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  currentCity,
  onSelectCity,
  onNavigate,
  searchQuery,
  onSearchChange,
  cartCount,
  unreadMessagesCount = 0,
  isDarkMode = false,
  onToggleDarkMode,
  userName,
  userRole = 'Member',
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cities = ['Lilongwe', 'Blantyre', 'Mzuzu', 'Zomba'];

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
    { id: 'admin', label: 'Super Admin Portal', icon: 'dashboard_customize' },
  ];

  return (
    <>
      <header className="fixed top-0 w-full z-40 bg-white/90 dark:bg-black/90 backdrop-blur-xl pt-safe shadow-sm border-b border-slate-200/80 dark:border-zinc-800 transition-colors">
        <div className="h-16 md:h-20 px-2.5 sm:px-4 md:px-8 max-w-7xl mx-auto flex items-center gap-2 justify-between min-w-0">
          
          {/* Upper Left: Menu Toggle + Brand Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Open Navigation Menu"
              title="Open Navigation Menu"
            >
              <span className="material-symbols-outlined text-[26px]">menu</span>
            </button>

            <div 
              onClick={() => onNavigate('home')} 
              className="cursor-pointer flex items-center gap-1 shrink-0"
            >
              <span className="font-serif-source text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Pa_mSikA
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 min-w-0 max-w-lg mx-1 sm:mx-2 flex items-center bg-slate-100 dark:bg-zinc-900 rounded-full px-2.5 sm:px-3 py-1.5 border border-slate-200 dark:border-zinc-800 focus-within:ring-2 focus-within:ring-slate-400 transition-all">
            <span className="material-symbols-outlined text-slate-500 dark:text-zinc-400 text-[18px] sm:text-[20px] shrink-0">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search..."
              className="bg-transparent border-none focus:outline-none text-xs sm:text-sm w-full px-1 sm:px-2 text-slate-900 dark:text-white placeholder-slate-400 min-w-0"
            />
            <div className="hidden sm:block w-[1px] h-4 bg-slate-300 dark:bg-zinc-700 mx-1 shrink-0"></div>
            
            {/* Location Selector */}
            <div className="relative group shrink-0 hidden sm:flex items-center gap-1 text-slate-700 dark:text-zinc-300 cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              <select
                value={currentCity}
                onChange={(e) => onSelectCity(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer pr-1"
              >
                {cities.map((city) => (
                  <option key={city} value={city} className="bg-white text-slate-900 dark:bg-black dark:text-white">
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
              className="flex flex-col items-center justify-center min-w-[32px] sm:min-w-[40px] h-9 sm:h-10 text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl px-1 sm:px-1.5 transition-colors cursor-pointer"
              title="Dolo Affiliate Hub"
            >
              <span className="material-symbols-outlined text-[18px] sm:text-[20px]">token</span>
              <span className="hidden sm:inline text-[8px] sm:text-[9px] font-bold uppercase tracking-wider leading-none mt-0.5">Dolo</span>
            </button>

            {/* Cart Icon Button */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative p-1.5 sm:p-2 text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
              title="Shopping Cart"
            >
              <span className="material-symbols-outlined text-[20px] sm:text-[22px]">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white dark:bg-white dark:text-black text-[9px] sm:text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile / Settings */}
            <button
              onClick={() => onNavigate('settings')}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black flex items-center justify-center font-semibold text-[10px] sm:text-xs shadow-sm hover:scale-105 transition-transform cursor-pointer"
              title="Account Settings"
            >
              JD
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
          <aside className="relative z-10 w-80 max-w-[82vw] h-full bg-white dark:bg-black text-slate-900 dark:text-white border-r border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between p-5 overflow-y-auto animate-in slide-in-from-left duration-300">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-serif-source text-2xl font-bold text-slate-900 dark:text-white">
                    Pa_mSikA
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-full">
                    Malawi
                  </span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-zinc-800 dark:text-zinc-400 dark:hover:text-white rounded-full transition-colors cursor-pointer"
                  title="Close menu"
                >
                  <span className="material-symbols-outlined text-[22px]">close</span>
                </button>
              </div>

              {/* City Location Mobile Selector */}
              <div className="bg-slate-100 dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200">
                  <span className="material-symbols-outlined text-[20px]">location_on</span>
                  <span className="text-xs font-bold">Active City:</span>
                </div>
                <select
                  value={currentCity}
                  onChange={(e) => onSelectCity(e.target.value)}
                  className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
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
                <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest px-2 mb-2">
                  Explore Marketplace
                </p>
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                          isActive
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md'
                            : 'text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900'
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
                                ? 'bg-white text-slate-900 dark:bg-black dark:text-white'
                                : 'bg-slate-900 text-white dark:bg-white dark:text-black'
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
                <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest px-2 mb-2">
                  Portals &amp; Sellers
                </p>
                <nav className="space-y-1">
                  {portalItems.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                          isActive
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md'
                            : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
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
                <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest px-2 mb-2">
                  Preferences
                </p>
                <nav className="space-y-1">
                  {onToggleDarkMode && (
                    <button
                      onClick={onToggleDarkMode}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[20px]">
                          {isDarkMode ? 'light_mode' : 'dark_mode'}
                        </span>
                        <span>{isDarkMode ? 'Light Theme' : 'Dark Theme'}</span>
                      </div>
                      <span
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                          isDarkMode ? 'bg-white' : 'bg-slate-300'
                        } flex items-center`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full transition-transform ${
                            isDarkMode ? 'translate-x-4 bg-black' : 'translate-x-0 bg-white'
                          } shadow-sm`}
                        />
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => handleNavClick('settings')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                      currentView === 'settings'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">settings</span>
                    <span>Account Settings</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('landing')}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                    <span>Welcome Landing</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Drawer Footer User Profile */}
            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs shadow-sm">
                {(userName || 'Guest')
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((n) => n[0]?.toUpperCase())
                  .join('') || 'G'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{userName || 'Guest'}</p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">{userRole}</p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

