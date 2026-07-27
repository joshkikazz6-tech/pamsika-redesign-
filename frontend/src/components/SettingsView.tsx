import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Api, ApiError } from '../lib/api';

interface SettingsViewProps {
  currentCity: string;
  onSelectCity: (city: string) => void;
  onNavigate: (view: string) => void;
  onShowToast: (msg: string) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentCity,
  onSelectCity,
  onNavigate,
  onShowToast,
  isDarkMode = false,
  onToggleDarkMode
}) => {
  const { user, logout } = useAuth();
  const [currency, setCurrency] = useState<'MWK' | 'USD'>('MWK');
  const [language, setLanguage] = useState<'en' | 'ch'>('en');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');

  const initial = user ? user.full_name.charAt(0).toUpperCase() : '?';
  const roleBadge = user?.is_admin
    ? 'Admin'
    : user?.is_seller && user.seller_status === 'approved'
    ? 'Seller'
    : user?.is_affiliate
    ? 'Dolo Affiliate'
    : 'Member';

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw) return;
    Api.changePassword(currentPw, newPw)
      .then(() => {
        setIsPasswordFormOpen(false);
        setCurrentPw('');
        setNewPw('');
        onShowToast('Password updated successfully!');
      })
      .catch((err) => onShowToast(err instanceof ApiError ? err.message : 'Could not update password'));
  };

  const copyRefLink = () => {
    const link = user?.affiliate_id
      ? `${window.location.origin}/?ref=${user.affiliate_id}`
      : `${window.location.origin}`;
    navigator.clipboard?.writeText(link);
    onShowToast('Referral link copied to clipboard!');
  };

  const handleSignOut = () => {
    logout();
    onNavigate('home');
    onShowToast('Signed out successfully');
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 py-4 pb-28 space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center pt-2">
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-full bg-[#6d28d9] text-white font-serif-source text-3xl font-bold flex items-center justify-center border-4 border-white shadow-md">
            {initial}
          </div>
          <div className="absolute bottom-0 right-0 bg-[#059669] w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[14px]">check</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <h2 className="font-serif-source text-2xl font-bold text-[#111827]">{user?.full_name || 'Guest'}</h2>
          <span className="px-2.5 py-0.5 bg-[#EDE9FE] border border-[#6D28D9]/20 rounded-full text-[10px] font-bold text-[#6D28D9] tracking-widest uppercase">
            {roleBadge}
          </span>
        </div>
        <p className="text-xs text-[#4B5563]">{user?.email || ''}</p>
      </div>

      {/* Portal Shortcuts */}
      <section>
        <h3 className="text-xs font-bold text-[#6D28D9] uppercase tracking-[0.2em] mb-2 px-1">
          Portals &amp; Dashboards
        </h3>
        <div className="bg-[#F9FAFB] rounded-2xl overflow-hidden border border-[#E5E7EB]">
          {user?.is_admin && (
            <button
              onClick={() => onNavigate('admin')}
              className="w-full flex items-center gap-3 p-4 hover:bg-[#EDE9FE] transition-colors text-left border-b border-[#E5E7EB]"
            >
              <span className="material-symbols-outlined text-[#6D28D9]">dashboard_customize</span>
              <div className="flex-1">
                <p className="font-bold text-sm text-[#111827]">Super Admin Panel</p>
                <p className="text-[11px] text-[#4B5563]">Product approvals, ledger, seller network</p>
              </div>
              <span className="material-symbols-outlined text-[#4B5563] text-[20px]">chevron_right</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('seller')}
            className="w-full flex items-center gap-3 p-4 hover:bg-[#EDE9FE] transition-colors text-left border-b border-[#E5E7EB]"
          >
            <span className="material-symbols-outlined text-[#6D28D9]">storefront</span>
            <div className="flex-1">
              <p className="font-bold text-sm text-[#111827]">SellerHub Dashboard</p>
              <p className="text-[11px] text-[#4B5563]">Manage inventory, sales, and withdrawals</p>
            </div>
            <span className="material-symbols-outlined text-[#4B5563] text-[20px]">chevron_right</span>
          </button>

          <button
            onClick={() => onNavigate('dolo')}
            className="w-full flex items-center gap-3 p-4 hover:bg-[#EDE9FE] transition-colors text-left border-b border-[#E5E7EB]"
          >
            <span className="material-symbols-outlined text-[#6D28D9]">token</span>
            <div className="flex-1">
              <p className="font-bold text-sm text-[#111827]">Dolo Affiliate Hub</p>
              <p className="text-[11px] text-[#4B5563]">Track link clicks, referrals and earnings</p>
            </div>
            <span className="material-symbols-outlined text-[#4B5563] text-[20px]">chevron_right</span>
          </button>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 p-4 hover:bg-red-50 transition-colors text-left text-[#DC2626]"
          >
            <span className="material-symbols-outlined text-[#DC2626]">logout</span>
            <div className="flex-1">
              <p className="font-bold text-sm">Sign Out</p>
              <p className="text-[11px] text-[#DC2626]/70">Return to landing page</p>
            </div>
          </button>
        </div>
      </section>

      {/* Seller Verification Status */}
      <section>
        <h3 className="text-xs font-bold text-[#6D28D9] uppercase tracking-[0.2em] mb-2 px-1">
          Seller Status
        </h3>
        <div className="bg-[#F9FAFB] rounded-2xl p-4 border border-[#6D28D9]/20 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#6D28D9] shrink-0">
            <span className="material-symbols-outlined">verified</span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-[#111827]">
              {user?.is_seller
                ? user.seller_status === 'approved'
                  ? 'Verified Seller'
                  : user.seller_status === 'pending'
                  ? 'Application Pending'
                  : 'Application Rejected'
                : 'Not a Seller Yet'}
            </p>
            <p className="text-[11px] text-[#4B5563]">
              {user?.is_seller && user.seller_status === 'approved'
                ? 'Your store is authenticated and active'
                : 'Apply from the SellerHub Dashboard to start selling'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('seller')}
            className="px-4 py-2 bg-[#6D28D9] text-white rounded-lg text-xs font-bold shadow-sm"
          >
            Dashboard
          </button>
        </div>
      </section>

      {/* Theme Picker */}
      <section>
        <h3 className="text-xs font-bold text-[#6D28D9] uppercase tracking-[0.2em] mb-2 px-1">
          Appearance
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-1">
          <button
            onClick={() => {
              if (isDarkMode && onToggleDarkMode) onToggleDarkMode();
              onShowToast('Purple Elite theme active');
            }}
            className={`p-3 rounded-2xl border flex-1 text-center transition-all ${
              !isDarkMode ? 'border-[#6D28D9] bg-[#EDE9FE]' : 'border-[#E5E7EB] bg-white'
            }`}
          >
            <div className="w-full h-8 bg-[#6D28D9] rounded-lg mb-2"></div>
            <span className="text-xs font-bold text-[#111827]">Purple Elite</span>
          </button>

          <button
            onClick={() => {
              if (!isDarkMode && onToggleDarkMode) onToggleDarkMode();
              onShowToast('Pure Black theme active');
            }}
            className={`p-3 rounded-2xl border flex-1 text-center transition-all ${
              isDarkMode ? 'border-[#6D28D9] bg-slate-900 text-white' : 'border-[#E5E7EB] bg-white'
            }`}
          >
            <div className="w-full h-8 bg-black border border-[#333] rounded-lg mb-2"></div>
            <span className="text-xs font-bold">Pure Black</span>
          </button>
        </div>
      </section>

      {/* Language */}
      <section>
        <h3 className="text-xs font-bold text-[#6D28D9] uppercase tracking-[0.2em] mb-2 px-1">
          Language
        </h3>
        <div className="bg-[#F9FAFB] rounded-2xl overflow-hidden border border-[#E5E7EB] text-xs">
          <button
            onClick={() => {
              setLanguage('en');
              onShowToast('Set language to English');
            }}
            className="w-full p-3.5 flex items-center justify-between border-b border-[#E5E7EB] hover:bg-white"
          >
            <span className="font-semibold text-[#111827]">English (UK)</span>
            {language === 'en' && (
              <span className="material-symbols-outlined text-[#6D28D9] text-[20px]">check_circle</span>
            )}
          </button>
          <button
            onClick={() => {
              setLanguage('ch');
              onShowToast('Ikani Mchichewa: System set to Chichewa!');
            }}
            className="w-full p-3.5 flex items-center justify-between hover:bg-white"
          >
            <span className="font-semibold text-[#111827]">Chichewa (Malawi)</span>
            {language === 'ch' && (
              <span className="material-symbols-outlined text-[#6D28D9] text-[20px]">check_circle</span>
            )}
          </button>
        </div>
      </section>

      {/* Preferences & Location */}
      <section>
        <h3 className="text-xs font-bold text-[#6D28D9] uppercase tracking-[0.2em] mb-2 px-1">
          Preferences
        </h3>
        <div className="bg-[#F9FAFB] rounded-2xl p-4 border border-[#E5E7EB] space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-[#111827]">Currency Display</p>
              <p className="text-[#4B5563]">Current: {currency}</p>
            </div>
            <div className="flex bg-[#E5E7EB] p-1 rounded-xl">
              <button
                onClick={() => setCurrency('MWK')}
                className={`px-3 py-1 rounded-lg font-bold ${
                  currency === 'MWK' ? 'bg-[#6D28D9] text-white' : 'text-[#4B5563]'
                }`}
              >
                MWK
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1 rounded-lg font-bold ${
                  currency === 'USD' ? 'bg-[#6D28D9] text-white' : 'text-[#4B5563]'
                }`}
              >
                USD
              </button>
            </div>
          </div>

          <div>
            <p className="font-bold text-[#111827] mb-2">Default Location Filter</p>
            <div className="flex flex-wrap gap-2">
              {['Lilongwe', 'Blantyre', 'Mzuzu', 'Zomba'].map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    onSelectCity(city);
                    onShowToast(`Default city updated to ${city}`);
                  }}
                  className={`px-3.5 py-1.5 rounded-full border text-xs font-bold ${
                    currentCity === city
                      ? 'border-[#6D28D9] bg-[#EDE9FE] text-[#6D28D9]'
                      : 'border-[#D1D5DB] text-[#4B5563]'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
            <div>
              <p className="font-bold text-[#111827]">Push Notifications</p>
              <p className="text-[#4B5563]">Real-time order &amp; message alerts</p>
            </div>
            <button
              onClick={() => {
                setPushEnabled(!pushEnabled);
                onShowToast(`Notifications ${!pushEnabled ? 'Enabled' : 'Disabled'}`);
              }}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                pushEnabled ? 'bg-[#6D28D9]' : 'bg-[#D1D5DB]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  pushEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Share & Referral */}
      <section>
        <h3 className="text-xs font-bold text-[#6D28D9] uppercase tracking-[0.2em] mb-2 px-1">
          Share &amp; Invite
        </h3>
        <div className="bg-[#F9FAFB] rounded-2xl p-4 border border-[#E5E7EB] space-y-3">
          <div className="bg-white p-3 rounded-xl border border-[#E5E7EB] flex items-center justify-between">
            <span className="text-xs font-mono text-[#4B5563] truncate">
              {user?.affiliate_id ? `${window.location.host}/?ref=${user.affiliate_id}` : window.location.host}
            </span>
            <button
              onClick={copyRefLink}
              className="text-[#6D28D9] font-bold text-xs hover:underline ml-2"
            >
              COPY
            </button>
          </div>
        </div>
      </section>

      {/* Security */}
      <section>
        <h3 className="text-xs font-bold text-[#6D28D9] uppercase tracking-[0.2em] mb-2 px-1">
          Privacy &amp; Security
        </h3>
        <div className="bg-[#F9FAFB] rounded-2xl overflow-hidden border border-[#E5E7EB]">
          <button
            onClick={() => setIsPasswordFormOpen(!isPasswordFormOpen)}
            className="w-full p-4 flex items-center justify-between hover:bg-white text-left"
          >
            <div>
              <p className="font-bold text-sm text-[#111827]">Change Password</p>
              <p className="text-[11px] text-[#4B5563]">Update your account password</p>
            </div>
            <span className="material-symbols-outlined text-[#4B5563]">
              {isPasswordFormOpen ? 'expand_less' : 'chevron_right'}
            </span>
          </button>

          {isPasswordFormOpen && (
            <form onSubmit={handlePasswordSubmit} className="p-4 bg-white border-t border-[#E5E7EB] space-y-3">
              <input
                type="password"
                placeholder="Current Password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                required
                className="w-full bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl px-3 py-2 text-xs"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                required
                className="w-full bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl px-3 py-2 text-xs"
              />
              <button
                type="submit"
                className="w-full bg-[#6D28D9] text-white py-2.5 rounded-xl font-bold text-xs"
              >
                Update Password
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
