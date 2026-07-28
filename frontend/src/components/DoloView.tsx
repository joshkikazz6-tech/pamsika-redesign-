import React, { useState, useEffect } from 'react';
import { DoloAffiliate } from '../types';

interface DoloViewProps {
  doloData: DoloAffiliate;
  onShowToast: (msg: string) => void;
  /** When provided, these drive real backend state instead of the local-only demo fallback. */
  isAffiliate?: boolean;
  onJoin?: () => Promise<void> | void;
  onWithdraw?: (amount: number, method: string, details: Record<string, any>) => Promise<void> | void;
}

export const DoloView: React.FC<DoloViewProps> = ({ doloData, onShowToast, isAffiliate, onJoin, onWithdraw }) => {
  const usesRealAuth = isAffiliate !== undefined;

  // Persistence state for Dolo membership (only used as a fallback when no
  // real onJoin/isAffiliate wiring is provided)
  const [isDoloMember, setIsDoloMember] = useState<boolean>(() => {
    const saved = localStorage.getItem('pamsika_is_dolo_member');
    return saved !== null ? saved === 'true' : true; // default to true or active member for demo, or false if toggled
  });

  const memberState = usesRealAuth ? !!isAffiliate : isDoloMember;

  const [authMode, setAuthMode] = useState<'join' | 'signin'>('join');
  const [fullName, setFullName] = useState(doloData.name || '');
  const [contactInfo, setContactInfo] = useState(doloData.email || '');
  const [payoutOption, setPayoutOption] = useState('Airtel Money (+265 990...)');

  // Withdrawal modal state
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('Airtel Money');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState(doloData.name || '');

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    onShowToast(`Copied "${text}" to clipboard!`);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || parseInt(withdrawAmount, 10) <= 0) {
      onShowToast('Please enter a valid withdrawal amount.');
      return;
    }
    if (!accountNumber.trim()) {
      onShowToast('Please enter your phone or account number.');
      return;
    }
    if (!accountName.trim()) {
      onShowToast('Please enter the account recipient name.');
      return;
    }

    setIsWithdrawOpen(false);

    if (onWithdraw) {
      Promise.resolve(
        onWithdraw(parseInt(withdrawAmount, 10), withdrawMethod, {
          account_number: accountNumber,
          account_name: accountName,
        })
      );
      return;
    }

    onShowToast(
      `Payout request of MWK ${parseInt(withdrawAmount, 10).toLocaleString()} via ${withdrawMethod} to ${accountName} (${accountNumber}) submitted!`
    );
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (onJoin) {
      Promise.resolve(onJoin());
      return;
    }

    localStorage.setItem('pamsika_is_dolo_member', 'true');
    setIsDoloMember(true);
    onShowToast(
      authMode === 'join'
        ? 'Congratulations! Welcome to your Dolo Partner Dashboard.'
        : 'Welcome back! Signed into Dolo Partner Account.'
    );
  };

  const handleSignOut = () => {
    localStorage.setItem('pamsika_is_dolo_member', 'false');
    setIsDoloMember(false);
    onShowToast('Signed out of Dolo Partner Account.');
  };

  // IF USER IS NOT YET A DOLO MEMBER -> SHOW PITCH / SIGN-IN VIEW
  if (!memberState) {
    return (
      <div className="flex flex-col w-full max-w-xl mx-auto px-4 py-6 pb-28 space-y-6">
        {/* Pitch Hero Card */}
        <section className="bg-[#6d28d9] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden text-center">
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white text-[#5300b7] rounded-2xl flex items-center justify-center shadow-lg mb-4 transform -rotate-3">
              <span className="material-symbols-outlined text-3xl font-black">handshake</span>
            </div>
            <span className="px-3 py-1 bg-white/20 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider mb-2">
              Pa_mSikA Dolo Programme
            </span>
            <h1 className="font-serif-source text-2xl sm:text-3xl font-bold mb-2 leading-tight">
              Earn <span className="text-[#ebddff]">5% Commission</span> as a Dolo Affiliate
            </h1>
            <p className="text-xs text-white/90 max-w-md leading-relaxed mb-4">
              Share products with friends and followers. Get instant Mobile Money payouts directly to Airtel Money, TNM Mpamba, or Bank.
            </p>

            <div className="grid grid-cols-3 gap-2 w-full pt-3 border-t border-white/20 text-left">
              <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/20">
                <p className="text-[10px] text-white/80 font-bold uppercase">Zero Fee</p>
                <p className="text-[11px] font-semibold text-white">100% Free Join</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/20">
                <p className="text-[10px] text-white/80 font-bold uppercase">Payouts</p>
                <p className="text-[11px] font-semibold text-white">Weekly Mobile</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/20">
                <p className="text-[10px] text-white/80 font-bold uppercase">Sub-Invites</p>
                <p className="text-[11px] font-semibold text-white">+5% Lifetime</p>
              </div>
            </div>
          </div>
        </section>

        {/* Auth / Sign In Form Card */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-[#ccc3d7]/30">
          <div className="flex bg-[#f4f2fd] p-1 rounded-2xl mb-5">
            <button
              onClick={() => setAuthMode('join')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                authMode === 'join'
                  ? 'bg-[#5300b7] text-white shadow-md'
                  : 'text-[#4a4455] hover:text-[#121c2a]'
              }`}
            >
              Become a Dolo Partner
            </button>
            <button
              onClick={() => setAuthMode('signin')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                authMode === 'signin'
                  ? 'bg-[#5300b7] text-white shadow-md'
                  : 'text-[#4a4455] hover:text-[#121c2a]'
              }`}
            >
              Sign In
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'join' && (
              <div>
                <label className="block text-xs font-bold text-[#4a4455] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Chisomo Banda"
                  className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#4a4455] mb-1">
                {authMode === 'join' ? 'Phone or Email' : 'Dolo Email or Mobile Number'}
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="+265 990 000 000"
                className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                required
              />
            </div>

            {authMode === 'join' && (
              <div>
                <label className="block text-xs font-bold text-[#4a4455] mb-1">
                  Preferred Mobile Payout Account
                </label>
                <select
                  value={payoutOption}
                  onChange={(e) => setPayoutOption(e.target.value)}
                  className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                >
                  <option value="Airtel Money">Airtel Money (+265 99...)</option>
                  <option value="TNM Mpamba">TNM Mpamba (+265 88...)</option>
                  <option value="National Bank Account">National Bank of Malawi Account</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#5300b7] hover:bg-[#6d28d9] text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all mt-2"
            >
              {authMode === 'join' ? 'Join as Dolo Partner Now' : 'Sign In to Dolo Dashboard'}
            </button>
          </form>

          {/* Quick Demo Instant Toggle */}
          <div className="mt-5 pt-4 border-t border-[#ccc3d7]/30 text-center">
            <button
              onClick={() => {
                localStorage.setItem('pamsika_is_dolo_member', 'true');
                setIsDoloMember(true);
                onShowToast('Instant Dolo Partner Login activated!');
              }}
              className="text-xs text-[#5300b7] font-bold hover:underline inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">verified</span>
              <span>Quick Demo: Access Dolo Dashboard Directly</span>
            </button>
          </div>
        </section>
      </div>
    );
  }

  // IF USER IS AN ACTIVE DOLO MEMBER -> SHOW DOLO DASHBOARD DIRECTLY (NO PITCH VIEW BANNER)
  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 py-4 pb-28 space-y-6">
      {/* Active Member Dashboard Header Card - styled like Seller Hub */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-[#ccc3d7]/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#5300b7] text-white font-serif-source text-3xl font-bold flex items-center justify-center shadow-md shrink-0">
            {fullName ? fullName.charAt(0).toUpperCase() : 'D'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif-source text-xl font-bold text-[#121c2a]">
                {fullName || doloData.name}
              </h2>
              <span className="bg-[#ebddff] text-[#5300b7] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Active Dolo Member
              </span>
            </div>
            <p className="text-xs text-[#7b7486] font-mono mt-0.5">
              ID: {doloData.doloId}
            </p>
            <p className="text-xs text-[#4a4455]">{contactInfo || doloData.email}</p>

            {!usesRealAuth && (
              <button
                onClick={handleSignOut}
                className="text-[10px] font-bold text-[#7b7486] hover:text-rose-600 transition-colors mt-1 inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[12px]">logout</span>
                <span>Sign Out / Switch Account</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-[#f8f9ff] p-4 rounded-2xl border border-[#ccc3d7]/40 flex flex-col gap-2 min-w-[240px]">
          <span className="text-[10px] font-bold text-[#7b7486] uppercase tracking-wider">
            Available Commission Balance
          </span>
          <div className="flex items-center justify-between gap-4">
            <span className="font-serif-source text-2xl font-bold text-[#5300b7]">
              MWK {doloData.balance.toLocaleString()}
            </span>
            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="bg-[#5300b7] hover:bg-[#6d28d9] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
              Withdraw
            </button>
          </div>
        </div>
      </section>

      {/* KPI Stats Grid - styled like Seller Hub */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#ccc3d7]/30 shadow-sm">
          <span className="material-symbols-outlined text-[#5300b7] mb-1">ads_click</span>
          <p className="text-xs text-[#7b7486] font-medium">Link Clicks</p>
          <h3 className="font-serif-source text-xl font-bold text-[#121c2a]">
            {doloData.linkClicks.toLocaleString()}
          </h3>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#ccc3d7]/30 shadow-sm">
          <span className="material-symbols-outlined text-[#5300b7] mb-1">shopping_bag</span>
          <p className="text-xs text-[#7b7486] font-medium">Sales Made</p>
          <h3 className="font-serif-source text-xl font-bold text-[#121c2a]">
            {doloData.salesMade}
          </h3>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#ccc3d7]/30 shadow-sm">
          <span className="material-symbols-outlined text-[#5300b7] mb-1">payments</span>
          <p className="text-xs text-[#7b7486] font-medium">Balance</p>
          <h3 className="font-serif-source text-xl font-bold text-[#5300b7]">
            MWK {doloData.balance.toLocaleString()}
          </h3>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#ccc3d7]/30 shadow-sm">
          <span className="material-symbols-outlined text-[#5300b7] mb-1">stars</span>
          <p className="text-xs text-[#7b7486] font-medium">Total Earned</p>
          <h3 className="font-serif-source text-xl font-bold text-[#121c2a]">
            MWK {doloData.totalEarned.toLocaleString()}
          </h3>
        </div>
      </section>

      {/* Grow Network & Referral Generator Banner - styled like Seller Hub Header Banner */}
      <section className="bg-[#6d28d9] text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="font-serif-source text-2xl font-bold mb-1">Grow Your Sub-Network</h3>
          <p className="text-xs text-white/90 mb-4 max-w-lg leading-relaxed">
            Invite sub-affiliates and earn an extra <span className="font-bold underline">5% lifetime commission</span> on every sale they generate.
          </p>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 mb-4">
            <code className="flex-1 truncate font-mono text-xs px-2 text-white font-bold">
              {doloData.inviteLink}
            </code>
            <button
              onClick={() => copyToClipboard(`https://${doloData.inviteLink}`)}
              className="bg-white text-[#5300b7] px-3 py-1.5 rounded-xl font-extrabold text-xs hover:bg-[#ebddff] transition-colors flex items-center gap-1 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              <span>Copy</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
            <div>
              <p className="text-[10px] text-white/70 uppercase font-bold">Sub-Affiliates Invited</p>
              <p className="font-serif-source text-2xl font-bold text-white">{doloData.subInvites}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/70 uppercase font-bold">Sub-Earnings</p>
              <p className="font-serif-source text-2xl font-bold text-white">
                MWK {doloData.subEarnings.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 opacity-10 text-white pointer-events-none">
          <span className="material-symbols-outlined text-[160px]">groups</span>
        </div>
      </section>

      {/* Recommended Products for Sharing */}
      <section className="space-y-3">
        <h3 className="font-serif-source text-xl font-bold text-[#121c2a]">
          High Commission Products to Share
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-[#ccc3d7]/30 shadow-sm flex items-center gap-3">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1ROp-KSD_qH_-dcDhd2DSxdHfwcI6wyG02o9vMcwcxHMtxvQNGoQsbVtuBCQhvbov_azOnAwZv2wYtY0RHLvLha7F2N48fX5Z7uzgYJUrVRiLQWSxXE8E7W22rCdosXC-GMSOrQZONaNEnd0cnxw3SjQnqC4OAg1TaRxqXCvt-4q1WTH1wY1zVrFE_8gjpqB5gCndEM2AO3UDsQmQxRdGP8Bg8iYRFW2n_f-vvHlhIbYggGijsYIjW6VqOD1-6DraloSrHF1q7PE"
              alt="Pro Chair"
              className="w-16 h-16 rounded-xl object-cover bg-[#eff4ff] shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs text-[#121c2a] truncate">Pro-Elite Ergonomic Chair</h4>
              <p className="text-[11px] text-[#7b7486]">Price: MWK 125,000</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-bold text-[#059669]">Earn MWK 6,250</span>
                <button
                  onClick={() => copyToClipboard('https://pamsika.com/p/pro-chair?ref=DOLO1024')}
                  className="text-xs font-bold text-[#5300b7] hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">link</span>
                  Copy Link
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#ccc3d7]/30 shadow-sm flex items-center gap-3">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjByb9Ef7SLFaUbI5I_XBVVuSqd_ery1Hj_ZAEFd7OK0VQTHdCaveJzSaO27RMI90FspNKIB5LveWFu_K8d8Cs8k5ob6g6-0Dc9zlFMSMzXnvRuMNPlj2dE6uALEQUlP1plP1emLZ2uauasCIBAaZnpmr0Plgju2mVOmJLPW99v9lupmVqoaqN2n3cHOFmtPZW_BykwcNkppziCZ8LiY4j-CZ8DbHpvaRZO2_p4f41HDi5t8RUovF4CSj3rRGDQMpfeUJm3QvTgnA"
              alt="Solar Inverter"
              className="w-16 h-16 rounded-xl object-cover bg-[#eff4ff] shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs text-[#121c2a] truncate">Solar-Go 5KVA Hybrid</h4>
              <p className="text-[11px] text-[#7b7486]">Price: MWK 450,000</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-bold text-[#059669]">Earn MWK 22,500</span>
                <button
                  onClick={() => copyToClipboard('https://pamsika.com/p/solar-inverter?ref=DOLO1024')}
                  className="text-xs font-bold text-[#5300b7] hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">link</span>
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Withdrawal Modal - styled like Seller Hub Modals */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#ccc3d7]/30 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif-source text-xl font-bold text-[#121c2a]">Withdraw Dolo Earnings</h3>
              <button
                onClick={() => setIsWithdrawOpen(false)}
                className="text-[#7b7486] hover:text-[#121c2a]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleWithdrawSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#4a4455] uppercase mb-1">
                  1. Amount (MWK)
                </label>
                <input
                  type="number"
                  max={doloData.balance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 15000"
                  className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-4 py-2.5 text-sm font-bold text-[#5300b7] focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                  required
                />
                <span className="text-[10px] text-[#7b7486] mt-1 block">
                  Available: MWK {doloData.balance.toLocaleString()} (Min payout: MWK 5,000)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4a4455] uppercase mb-1">
                  2. Method of Withdrawal
                </label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value)}
                  className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-4 py-2.5 text-xs font-semibold text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                >
                  <option value="Airtel Money">Airtel Money Mobile Wallet</option>
                  <option value="TNM Mpamba">TNM Mpamba Mobile Wallet</option>
                  <option value="National Bank of Malawi">National Bank of Malawi (NBM)</option>
                  <option value="Standard Bank Malawi">Standard Bank Malawi</option>
                  <option value="FDH Bank">FDH Bank</option>
                  <option value="First Capital Bank">First Capital Bank</option>
                  <option value="NBS Bank">NBS Bank</option>
                  <option value="MyBucks Banking">MyBucks Banking</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4a4455] uppercase mb-1">
                  3. Phone / Account Number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. +265 990 123 456 or 100234567"
                  className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-4 py-2.5 text-xs font-semibold text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4a4455] uppercase mb-1">
                  4. Account / Recipient Name
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. Chisomo Banda"
                  className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-4 py-2.5 text-xs font-semibold text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#5300b7] hover:bg-[#6d28d9] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
                >
                  Confirm Payout Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

