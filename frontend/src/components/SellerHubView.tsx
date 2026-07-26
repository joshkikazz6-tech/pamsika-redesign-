import React, { useState } from 'react';
import { Product, OrderItem } from '../types';

interface SellerHubViewProps {
  products: Product[];
  orders: OrderItem[];
  sellerStatus: 'none' | 'pending' | 'approved' | 'rejected';
  balance: number;
  onAddProduct: (product: {
    name: string;
    category: string;
    price: number;
    stock: number;
    description: string;
  }) => Promise<void>;
  onApply: (data: { business: string; phone: string; location: string; nid: string; description: string }) => Promise<void>;
  onWithdraw: (amount: number) => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const SellerHubView: React.FC<SellerHubViewProps> = ({
  products,
  orders,
  sellerStatus,
  balance,
  onAddProduct,
  onApply,
  onWithdraw,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'apply' | 'pending' | 'chat'>(
    sellerStatus === 'approved' ? 'overview' : sellerStatus === 'pending' ? 'pending' : 'apply'
  );

  // New product form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Product['category']>('Fashion');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('10');
  const [newDescription, setNewDescription] = useState('');

  // Seller application form state
  const [applicantName, setApplicantName] = useState('John Doe');
  const [nationalId, setNationalId] = useState('9921-LL-4421');
  const [phone, setPhone] = useState('990 123 456');
  const [location, setLocation] = useState('Lilongwe');
  const [storeName, setStoreName] = useState("John's Artisanal Crafts");
  const [productsSummary, setProductsSummary] = useState('Hand-carved wooden crafts, leather goods, traditional baskets.');

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice) return;

    onAddProduct({
      name: newTitle.trim(),
      category: newCategory,
      price: parseFloat(newPrice),
      stock: parseInt(newStock) || 10,
      description: newDescription || 'Crafted with premium materials by verified Malawian seller.',
    })
      .then(() => {
        setNewTitle('');
        setNewPrice('');
        setNewDescription('');
        onShowToast('New product submitted for Quality Control review!');
      })
      .catch((err: any) => onShowToast(err?.message || 'Could not submit product'));
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply({
      business: storeName,
      phone,
      location,
      nid: nationalId,
      description: productsSummary,
    })
      .then(() => {
        setActiveTab('pending');
        onShowToast('Merchant application submitted successfully! Review pending.');
      })
      .catch((err: any) => onShowToast(err?.message || 'Could not submit application'));
  };

  const handleWithdrawClick = () => {
    const input = window.prompt(`Enter amount to withdraw (available: MWK ${balance.toLocaleString()})`, String(balance));
    if (!input) return;
    const amount = parseInt(input, 10);
    if (!amount || amount <= 0 || amount > balance) {
      onShowToast('Enter a valid amount within your available balance');
      return;
    }
    onWithdraw(amount)
      .then(() => onShowToast('Store balance payout requested!'))
      .catch((err: any) => onShowToast(err?.message || 'Payout request failed'));
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto px-4 py-4 pb-28 space-y-6">
      {/* Seller Sub-Navigation Bar */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar max-w-full bg-white p-2 rounded-2xl border border-[#ccc3d7]/30 shadow-sm">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'overview' ? 'bg-[#5300b7] text-white shadow-md' : 'text-[#4a4455] hover:bg-[#f4f2fd]'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'products' ? 'bg-[#5300b7] text-white shadow-md' : 'text-[#4a4455] hover:bg-[#f4f2fd]'
          }`}
        >
          Inventory &amp; Add
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'orders' ? 'bg-[#5300b7] text-white shadow-md' : 'text-[#4a4455] hover:bg-[#f4f2fd]'
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab('apply')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'apply' ? 'bg-[#5300b7] text-white shadow-md' : 'text-[#4a4455] hover:bg-[#f4f2fd]'
          }`}
        >
          Merchant Application
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'pending' ? 'bg-[#5300b7] text-white shadow-md' : 'text-[#4a4455] hover:bg-[#f4f2fd]'
          }`}
        >
          Status Tracker
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'chat' ? 'bg-[#5300b7] text-white shadow-md' : 'text-[#4a4455] hover:bg-[#f4f2fd]'
          }`}
        >
          Admin Chat
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <header className="relative overflow-hidden rounded-3xl bg-[#6d28d9] p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="px-3 py-1 rounded-full bg-white/20 text-white font-bold text-[10px] uppercase tracking-widest">
                Active Store
              </span>
              <h1 className="font-serif-source text-3xl font-bold mt-2 mb-1">
                Welcome back, {applicantName}
              </h1>
              <p className="text-xs text-white/80">Business: {storeName}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveTab('products');
                  onShowToast('Navigated to Add Product form');
                }}
                className="bg-white text-[#5300b7] hover:bg-[#ebddff] px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors"
              >
                + New Listing
              </button>
            </div>
          </header>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#ccc3d7]/30 shadow-sm">
              <span className="text-[10px] font-bold text-[#7b7486] uppercase block">Total Products</span>
              <span className="font-serif-source text-2xl font-bold text-[#121c2a]">{products.length}</span>
              <span className="text-[10px] text-[#059669] block font-bold mt-1">✓ Active in Store</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#ccc3d7]/30 shadow-sm">
              <span className="text-[10px] font-bold text-[#7b7486] uppercase block">Store Views</span>
              <span className="font-serif-source text-2xl font-bold text-[#121c2a]">12.4K</span>
              <span className="text-[10px] text-[#5300b7] block font-bold mt-1">+14% this month</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#ccc3d7]/30 shadow-sm">
              <span className="text-[10px] font-bold text-[#7b7486] uppercase block">Completed Orders</span>
              <span className="font-serif-source text-2xl font-bold text-[#121c2a]">{orders.length}</span>
              <span className="text-[10px] text-[#7b7486] block font-bold mt-1">100% Fulfillment</span>
            </div>

            <div className="bg-[#5300b7] text-white p-4 rounded-2xl shadow-lg flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                Available Balance
              </span>
              <span className="font-serif-source text-2xl font-bold my-1">MWK {balance.toLocaleString()}</span>
              <button
                onClick={handleWithdrawClick}
                className="bg-white text-[#5300b7] py-1.5 rounded-lg text-xs font-bold hover:bg-[#ebddff] transition-colors"
              >
                Withdraw
              </button>
            </div>
          </div>

          {/* Recent Store Orders */}
          <div className="bg-white rounded-3xl p-6 border border-[#ccc3d7]/30 shadow-sm">
            <h3 className="font-serif-source text-xl font-bold text-[#121c2a] mb-4">Recent Merchant Sales</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#eff4ff] text-[#4a4455] border-b border-[#ccc3d7]/30">
                    <th className="p-3 uppercase">Order ID</th>
                    <th className="p-3 uppercase">Items</th>
                    <th className="p-3 uppercase">Amount</th>
                    <th className="p-3 uppercase">Status</th>
                    <th className="p-3 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ccc3d7]/20">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#f8f9ff]">
                      <td className="p-3 font-bold text-[#5300b7]">{ord.id}</td>
                      <td className="p-3 text-[#121c2a]">{ord.itemsSummary}</td>
                      <td className="p-3 font-bold text-[#121c2a]">MWK {ord.amount.toLocaleString()}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 bg-[#059669]/10 text-[#059669] font-bold rounded-full uppercase text-[9px]">
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-3 text-[#7b7486]">{ord.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS & ADD PRODUCT TAB */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#ccc3d7]/30 shadow-sm">
            <h3 className="font-serif-source text-xl font-bold text-[#121c2a] mb-4">Store Inventory</h3>
            <div className="space-y-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl bg-[#f8f9ff] border border-[#ccc3d7]/30 flex items-center gap-3"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-14 h-14 rounded-xl object-cover bg-white shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-[#121c2a] truncate">{p.name}</h4>
                    <p className="text-[11px] text-[#7b7486]">{p.category} • Stock: {p.stock || 10}</p>
                    <p className="text-xs font-bold text-[#5300b7] mt-0.5">
                      MWK {p.price.toLocaleString()}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#5300b7]/10 text-[#5300b7] font-bold text-[10px] uppercase">
                    {p.status || 'Approved'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#ccc3d7]/30 shadow-sm h-max">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[#5300b7]">add_business</span>
              <h3 className="font-serif-source text-xl font-bold text-[#121c2a]">Add New Product</h3>
            </div>
            <form onSubmit={handleAddProductSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#4a4455] uppercase mb-1">Product Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Hand-carved Ebony Bowl"
                  required
                  className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#4a4455] uppercase mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Product['category'])}
                    className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                  >
                    <option value="Fashion">Fashion</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Luxury Bags">Luxury Bags</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Home Decor">Home Decor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#4a4455] uppercase mb-1">Price (MWK)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="45000"
                    required
                    className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-3 py-2 text-sm font-bold text-[#5300b7] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#4a4455] uppercase mb-1">Stock Qty</label>
                <input
                  type="number"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#4a4455] uppercase mb-1">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Key features, materials..."
                  rows={3}
                  className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-3 py-2 text-xs focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#5300b7] hover:bg-[#6d28d9] text-white py-3 rounded-xl font-bold uppercase tracking-wider shadow-md mt-2"
              >
                Submit for QC Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 border border-[#ccc3d7]/30 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif-source text-xl font-bold text-[#121c2a]">Store Orders History</h3>
            <button
              onClick={() => onShowToast('Exported CSV statement to downloads!')}
              className="bg-[#5300b7] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#eff4ff] text-[#4a4455] border-b border-[#ccc3d7]/30">
                  <th className="p-3 uppercase">Order Ref</th>
                  <th className="p-3 uppercase">Customer</th>
                  <th className="p-3 uppercase">Items</th>
                  <th className="p-3 uppercase">Amount</th>
                  <th className="p-3 uppercase">Payment</th>
                  <th className="p-3 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ccc3d7]/20">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#f8f9ff]">
                    <td className="p-3 font-bold text-[#5300b7]">{ord.id}</td>
                    <td className="p-3 font-semibold text-[#121c2a]">{ord.customerName}</td>
                    <td className="p-3 text-[#4a4455]">{ord.itemsSummary}</td>
                    <td className="p-3 font-bold text-[#121c2a]">MWK {ord.amount.toLocaleString()}</td>
                    <td className="p-3 text-[#7b7486]">{ord.paymentMethod}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 bg-[#5300b7]/10 text-[#5300b7] font-bold rounded-full uppercase text-[9px]">
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MERCHANT APPLICATION TAB */}
      {activeTab === 'apply' && (
        <div className="bg-white rounded-3xl p-6 border border-[#ccc3d7]/30 shadow-sm max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <span className="px-3 py-1 rounded-full bg-[#ebddff] text-[#5300b7] text-[10px] font-bold uppercase tracking-widest">
              Merchant Onboarding
            </span>
            <h2 className="font-serif-source text-2xl font-bold text-[#121c2a] mt-2">
              Apply to Sell on Pa_mSikA
            </h2>
            <p className="text-xs text-[#4a4455] mt-1">
              Join elite Malawian vendors. Standard 5-10% commission applies on successful sales.
            </p>
          </div>

          <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#4a4455] uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  required
                  className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-[#4a4455] uppercase mb-1">National ID</label>
                <input
                  type="text"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  required
                  className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#4a4455] uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-[#4a4455] uppercase mb-1">Location / City</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none"
                >
                  <option value="Lilongwe">Lilongwe</option>
                  <option value="Blantyre">Blantyre</option>
                  <option value="Mzuzu">Mzuzu</option>
                  <option value="Zomba">Zomba</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#4a4455] uppercase mb-1">Store / Shop Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
                className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-4 py-2.5 text-sm font-bold text-[#5300b7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#4a4455] uppercase mb-1">What will you sell?</label>
              <textarea
                value={productsSummary}
                onChange={(e) => setProductsSummary(e.target.value)}
                rows={3}
                required
                className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-4 py-2.5 text-xs text-[#121c2a] focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#5300b7] hover:bg-[#6d28d9] text-white py-3.5 rounded-xl font-bold uppercase tracking-wider shadow-lg"
            >
              Submit Application
            </button>
          </form>
        </div>
      )}

      {/* STATUS TRACKER TAB */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-3xl p-8 border border-[#ccc3d7]/30 shadow-xl max-w-xl mx-auto text-center space-y-6">
          <div className="w-20 h-20 bg-[#ebddff] rounded-full flex items-center justify-center text-[#5300b7] mx-auto animate-pulse">
            <span className="material-symbols-outlined text-4xl">schedule</span>
          </div>

          <div>
            <h2 className="font-serif-source text-2xl font-bold text-[#121c2a]">
              Application Under Review
            </h2>
            <p className="text-xs text-[#4a4455] mt-2 max-w-md mx-auto leading-relaxed">
              Our review committee is verifying store credentials. Expect approval within 24-48 hours.
            </p>
          </div>

          <div className="bg-[#eff4ff] p-4 rounded-2xl text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#7b7486]">Registered Shop:</span>
              <span className="font-bold text-[#121c2a]">{storeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7b7486]">Location:</span>
              <span className="font-semibold text-[#121c2a]">{location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7b7486]">Current Status:</span>
              <span className="font-bold text-[#5300b7] uppercase">Under Review</span>
            </div>
          </div>

          <button
            onClick={() => onShowToast('WhatsApp support chat opened!')}
            className="w-full bg-[#5300b7] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">chat</span>
            Contact Admin on WhatsApp
          </button>
        </div>
      )}

      {/* ADMIN CHAT TAB */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-3xl p-6 border border-[#ccc3d7]/30 shadow-sm max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#ccc3d7]/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#5300b7] text-white font-bold flex items-center justify-center">
                A
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#121c2a]">Pa_mSikA Admin Helpdesk</h3>
                <span className="text-[10px] text-emerald-600 font-bold uppercase">Online</span>
              </div>
            </div>
          </div>

          <div className="bg-[#f8f9ff] p-4 rounded-2xl space-y-3 min-h-[220px]">
            <div className="bg-[#d9e3f6] p-3 rounded-xl max-w-md text-xs text-[#121c2a]">
              Hello {applicantName}! Welcome to SellerHub support. How can we assist your business today?
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message to support..."
              className="flex-1 bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
            />
            <button
              onClick={() => onShowToast('Message sent to Pa_mSikA Admin!')}
              className="bg-[#5300b7] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
