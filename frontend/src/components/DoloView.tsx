import React, { useState } from 'react';
import { DoloAffiliate } from '../types';

interface DoloViewProps {
  doloData: DoloAffiliate;
  isAffiliate: boolean;
  onShowToast: (msg: string) => void;
  onJoin: () => Promise<void>;
  onWithdraw: (amount: number, method: string) => Promise<void>;
}

export const DoloView: React.FC<DoloViewProps> = ({ doloData, isAffiliate, onShowToast, onJoin, onWithdraw }) => {
  const [subView, setSubView] = useState<'dashboard' | 'join' | 'signedOut'>(isAffiliate ? 'dashboard' : 'join');
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('15000');
  const [withdrawMethod, setWithdrawMethod] = useState('Airtel Money');

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    onShowToast(`Copied "${text}" to clipboard!`);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(withdrawAmount, 10) || 0;
    onWithdraw(amount, withdrawMethod)
      .then(() => {
        setIsWithdrawOpen(false);
        onShowToast(`Withdrawal of MWK ${amount.toLocaleString()} submitted via ${withdrawMethod}!`);
      })
      .catch((err: any) => onShowToast(err?.message || 'Withdrawal request failed'));
  };

  if (subView === 'join') {
    return (
      <div className="flex flex-col w-full max-w-xl mx-auto px-4 py-8 pb-28 items-center text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-[#6d28d9]/10 rounded-full flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-[#5300b7] text-[40px]">handshake</span>
          </div>
        </div>
        <h1 className="font-serif-source text-3xl font-bold text-[#121c2a] mb-3">
          Become a <span className="text-[#5300b7]">Dolo Pa_mSikA</span>
        </h1>
        <p className="text-sm text-[#4a4455] mb-6 max-w-sm leading-relaxed">
          Share what you love. Earn <span className="text-[#5300b7] font-bold">5% commission</span> on every referral. Zero setup fees, instant payout access.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <span className="bg-[#dee9fc] px-4 py-2 rounded-full text-xs font-bold text-[#5300b7]">
            ✓ Free to Join
          </span>
          <span className="bg-[#dee9fc] px-4 py-2 rounded-full text-xs font-bold text-[#5300b7]">
            ✓ Instant Referral Links
          </span>
        </div>

        <button
          onClick={() => {
            onJoin()
              .then(() => {
                setSubView('dashboard');
                onShowToast('Welcome to your Dolo Partner Dashboard!');
              })
              .catch((err: any) => onShowToast(err?.message || 'Could not join the Dolo programme'));
          }}
          className="w-full max-w-sm bg-[#5300b7] hover:bg-[#6d28d9] text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all mb-4"
        >
          Join as Dolo Pa_mSikA Now
        </button>

        <button
          onClick={() => setSubView('dashboard')}
          className="text-xs text-[#5300b7] font-semibold underline"
        >
          Already an affiliate? Go to Dashboard
        </button>
      </div>
    );
  }

  if (subView === 'signedOut') {
    return (
      <div className="flex flex-col w-full max-w-md mx-auto px-4 py-12 pb-28 items-center text-center">
        <div className="w-20 h-20 rounded-full bg-[#ebddff] flex items-center justify-center text-[#5300b7] mb-6">
          <span className="material-symbols-outlined text-4xl">lock</span>
        </div>
        <h2 className="font-serif-source text-2xl font-bold text-[#121c2a] mb-2">
          Sign in to <span className="text-[#5300b7]">Dolo Programme</span>
        </h2>
        <p className="text-xs text-[#4a4455] mb-8 leading-relaxed">
          Access your referral link metrics, sub-earnings, and weekly commission payouts.
        </p>
        <button
          onClick={() => {
            setSubView('dashboard');
            onShowToast('Signed into Dolo Account');
          }}
          className="w-full bg-[#5300b7] hover:bg-[#6d28d9] text-white py-3.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-md mb-3"
        >
          Sign In to My Dolo Account
        </button>
        <button
          onClick={() => setSubView('join')}
          className="w-full bg-white border-2 border-[#5300b7] text-[#5300b7] py-3.5 rounded-full font-bold text-xs uppercase tracking-wider"
        >
          Create New Partner Profile
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 py-4 pb-28 space-y-6">
      {/* View Switcher Top Pills */}
      <div className="flex justify-end gap-2 text-xs">
        <button
          onClick={() => setSubView('dashboard')}
          className="px-3 py-1 bg-[#5300b7] text-white rounded-lg font-bold"
        >
          Dashboard
        </button>
        <button
          onClick={() => setSubView('join')}
          className="px-3 py-1 bg-[#dee9fc] text-[#4a4455] hover:bg-[#d9e3f6] rounded-lg font-semibold"
        >
          Pitch View
        </button>
        <button
          onClick={() => setSubView('signedOut')}
          className="px-3 py-1 bg-[#dee9fc] text-[#4a4455] hover:bg-[#d9e3f6] rounded-lg font-semibold"
        >
          Sign-in View
        </button>
      </div>

      {/* Header Card Section */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-[#ccc3d7]/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#5300b7] text-white font-serif-source text-3xl font-bold flex items-center justify-center shadow-md">
            J
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif-source text-xl font-bold text-[#121c2a]">
                {doloData.name}
              </h2>
              <span className="bg-[#ebddff] text-[#5300b7] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                Dolo Member
              </span>
            </div>
            <p className="text-xs text-[#7b7486] font-mono mt-0.5">ID: {doloData.doloId}</p>
            <p className="text-xs text-[#4a4455]">{doloData.email}</p>
          </div>
        </div>

        <div className="bg-[#f8f9ff] p-4 rounded-2xl border border-[#ccc3d7]/40 flex flex-col gap-2 min-w-[240px]">
          <span className="text-[10px] font-bold text-[#7b7486] uppercase tracking-wider">
            Available Balance
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

      {/* KPI Stats Grid */}
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

      {/* Grow Network & Referral Generator */}
      <section className="bg-[#6d28d9] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="font-serif-source text-2xl font-bold mb-1">Grow Your Network</h3>
          <p className="text-xs text-white/90 mb-4 max-w-lg leading-relaxed">
            Invite sub-affiliates and earn an extra <span className="font-bold underline">5% lifetime commission</span> on every sale they generate.
          </p>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 mb-4">
            <code className="flex-1 truncate font-mono text-xs px-2 text-white">
              {doloData.inviteLink}
            </code>
            <button
              onClick={() => copyToClipboard(`https://${doloData.inviteLink}`)}
              className="bg-white text-[#5300b7] p-2 rounded-xl font-bold text-xs hover:bg-[#ebddff] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">content_copy</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
            <div>
              <p className="text-[10px] text-white/70 uppercase">Sub-Affiliates Invited</p>
              <p className="font-serif-source text-2xl font-bold">{doloData.subInvites}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/70 uppercase">Sub-Earnings</p>
              <p className="font-serif-source text-2xl font-bold">
                MWK {doloData.subEarnings.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[160px]">groups</span>
        </div>
      </section>

      {/* Recommended Products for Sharing */}
      <section className="space-y-3">
        <h3 className="font-serif-source text-xl font-bold text-[#121c2a]">
          High Commission Products to Share
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-2xl border border-[#ccc3d7]/30 shadow-sm flex items-center gap-3">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1ROp-KSD_qH_-dcDhd2DSxdHfwcI6wyG02o9vMcwcxHMtxvQNGoQsbVtuBCQhvbov_azOnAwZv2wYtY0RHLvLha7F2N48fX5Z7uzgYJUrVRiLQWSxXE8E7W22rCdosXC-GMSOrQZONaNEnd0cnxw3SjQnqC4OAg1TaRxqXCvt-4q1WTH1wY1zVrFE_8gjpqB5gCndEM2AO3UDsQmQxRdGP8Bg8iYRFW2n_f-vvHlhIbYggGijsYIjW6VqOD1-6DraloSrHF1q7PE"
              alt="Pro Chair"
              className="w-16 h-16 rounded-xl object-cover bg-[#eff4ff]"
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

          <div className="bg-white p-3 rounded-2xl border border-[#ccc3d7]/30 shadow-sm flex items-center gap-3">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjByb9Ef7SLFaUbI5I_XBVVuSqd_ery1Hj_ZAEFd7OK0VQTHdCaveJzSaO27RMI90FspNKIB5LveWFu_K8d8Cs8k5ob6g6-0Dc9zlFMSMzXnvRuMNPlj2dE6uALEQUlP1plP1emLZ2uauasCIBAaZnpmr0Plgju2mVOmJLPW99v9lupmVqoaqN2n3cHOFmtPZW_BykwcNkppziCZ8LiY4j-CZ8DbHpvaRZO2_p4f41HDi5t8RUovF4CSj3rRGDQMpfeUJm3QvTgnA"
              alt="Solar Inverter"
              className="w-16 h-16 rounded-xl object-cover bg-[#eff4ff]"
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

      {/* Withdrawal Modal */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif-source text-xl font-bold text-[#121c2a]">Withdraw Dolo Earnings</h3>
              <button
                onClick={() => setIsWithdrawOpen(false)}
                className="text-[#7b7486] hover:text-[#121c2a]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4a4455] uppercase mb-1">
                  Amount (MWK)
                </label>
                <input
                  type="number"
                  max={doloData.balance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-4 py-2.5 text-sm font-bold text-[#5300b7] focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                  required
                />
                <span className="text-[10px] text-[#7b7486] mt-1 block">
                  Available: MWK {doloData.balance.toLocaleString()} (Min payout: MWK 5,000)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4a4455] uppercase mb-1">
                  Transfer Method
                </label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value)}
                  className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                >
                  <option value="Airtel Money">Airtel Money (+265 990...)</option>
                  <option value="TNM Mpamba">TNM Mpamba (+265 888...)</option>
                  <option value="National Bank Account">National Bank of Malawi Account</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#5300b7] hover:bg-[#6d28d9] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg"
                >
                  Request Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
