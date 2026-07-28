import React, { useState } from 'react';
import { Product, OrderItem } from '../types';

interface SellerHubViewProps {
  products: Product[];
  orders: OrderItem[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onShowToast: (msg: string) => void;
  /** When provided, these drive real backend seller status/balance instead of the local-only demo fallback. */
  sellerStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  balance?: number;
  onApply?: (data: {
    fullName: string;
    nationalId: string;
    phone: string;
    location: string;
    storeName: string;
    productsSummary: string;
  }) => Promise<void> | void;
  onWithdraw?: (amount: number, method: string, details: Record<string, any>) => Promise<void> | void;
  defaultApplicantName?: string;
}

export const SellerHubView: React.FC<SellerHubViewProps> = ({
  products,
  orders,
  onAddProduct,
  onShowToast,
  sellerStatus,
  balance,
  onApply,
  onWithdraw,
  defaultApplicantName = '',
}) => {
  const usesRealAuth = sellerStatus !== undefined;

  // Seller approval state: comes first if user is not yet a seller
  // (only used as a fallback when no real sellerStatus wiring is provided)
  const [isApproved, setIsApproved] = useState<boolean>(() => {
    return localStorage.getItem('pamsika_seller_approved') === 'true';
  });

  const approvedState = usesRealAuth ? sellerStatus === 'approved' : isApproved;
  const isPendingReal = usesRealAuth && sellerStatus === 'pending';

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'apply' | 'pending' | 'chat'>(() => {
    const approved = localStorage.getItem('pamsika_seller_approved') === 'true';
    return approved ? 'overview' : 'apply';
  });

  // Floating upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // New product form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Product['category']>('Fashion');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('10');
  const [newDescription, setNewDescription] = useState('');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Seller application form state
  const [applicantName, setApplicantName] = useState(defaultApplicantName);
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Lilongwe');
  const [storeName, setStoreName] = useState('');
  const [productsSummary, setProductsSummary] = useState('');

  // Handle image files selection (Maximum 5 images)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentCount = imagePreviews.length;
    if (currentCount >= 5) {
      onShowToast('Maximum 5 images allowed per product.');
      return;
    }

    const fileList: File[] = Array.from(files);
    const selectedFiles: File[] = fileList.slice(0, 5 - currentCount);
    if (files.length + currentCount > 5) {
      onShowToast('Maximum 5 images allowed. Only the first selected were added.');
    }

    const filePromises = selectedFiles.map((file: File) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then((base64Urls) => {
      setImagePreviews((prev) => [...prev, ...base64Urls].slice(0, 5));
    });
  };

  const handleRemoveImagePreview = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice) return;

    const defaultImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDAPWiWV47AkKi7TwwOsVy43l182AI4vQca9vjMVLJVE225ahupJyce9rn8uqsezfDgz5R06Qd6ggSv8sXW_jOW3X3KExIBZWmR3bXgQgmj6B4zinsycLYSTD47jRUK-LuALvBgf82ym38JF2r5R_Uvbhsay-VbR_M66b5dJ3J9b2WlUdk99odno1iOdfsb2Q0KSlF_v71BrwAjfxAGLYKpcQDyJf2ps2vcAv51JaYyx-0EcPTLgEIt_Xeajv2p9WRAd8xZRHU9wA';
    const primaryImg = imagePreviews.length > 0 ? imagePreviews[0] : defaultImage;

    onAddProduct({
      name: newTitle.trim(),
      category: newCategory,
      price: parseFloat(newPrice),
      currency: 'MWK',
      image: primaryImg,
      description: newDescription || 'Crafted with premium materials by verified Malawian seller.',
      sellerName: storeName,
      sellerVerified: true,
      stock: parseInt(newStock) || 10,
      status: 'Pending'
    });

    setNewTitle('');
    setNewPrice('');
    setNewDescription('');
    setImagePreviews([]);
    setIsUploadModalOpen(false);
    onShowToast('New product submitted with uploaded images!');
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (onApply) {
      Promise.resolve(
        onApply({
          fullName: applicantName,
          nationalId,
          phone,
          location,
          storeName,
          productsSummary,
        })
      );
      return;
    }

    localStorage.setItem('pamsika_seller_approved', 'true');
    setIsApproved(true);
    setActiveTab('overview');
    onShowToast('Merchant application approved! Welcome to Pa_mSikA Seller Hub.');
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto px-4 py-4 pb-28 space-y-6 relative">
      {/* If NOT approved, show the Onboarding Application Screen First */}
      {!approvedState && isPendingReal ? (
        <div className="bg-white rounded-3xl p-8 border border-[#ccc3d7]/30 shadow-xl max-w-xl mx-auto text-center space-y-6">
          <div className="w-20 h-20 bg-[#ebddff] rounded-full flex items-center justify-center text-[#5300b7] mx-auto animate-pulse">
            <span className="material-symbols-outlined text-4xl">schedule</span>
          </div>
          <div>
            <h2 className="font-serif-source text-2xl font-bold text-[#121c2a]">
              Application Under Review
            </h2>
            <p className="text-xs text-[#4a4455] mt-2 max-w-md mx-auto leading-relaxed">
              Your merchant application has been submitted and is awaiting admin approval. You'll be able to list products once approved.
            </p>
          </div>
        </div>
      ) : !approvedState ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ccc3d7]/30 shadow-xl max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#ebddff] rounded-2xl flex items-center justify-center text-[#5300b7] mx-auto mb-3 shadow-sm">
              <span className="material-symbols-outlined text-3xl">storefront</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#ebddff] text-[#5300b7] text-[10px] font-bold uppercase tracking-widest">
              Merchant Onboarding
            </span>
            <h2 className="font-serif-source text-2xl sm:text-3xl font-bold text-[#121c2a] mt-2">
              Apply to Sell on Pa_mSikA
            </h2>
            <p className="text-xs text-[#4a4455] mt-1 max-w-md mx-auto leading-relaxed">
              Join verified Malawian vendors. Upload products, track sales, and receive direct payments. Standard 5-10% commission applies on successful sales.
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
                  placeholder="e.g. Chikondi Banda"
                  required
                  className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                />
              </div>
              <div>
                <label className="block font-bold text-[#4a4455] uppercase mb-1">National ID</label>
                <input
                  type="text"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="e.g. 9921-LL-4421"
                  required
                  className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
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
                  placeholder="e.g. 990 123 456"
                  required
                  className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                />
              </div>
              <div>
                <label className="block font-bold text-[#4a4455] uppercase mb-1">Location / City</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
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
                placeholder="e.g. Chikondi's Artisanal Crafts"
                required
                className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-4 py-2.5 text-sm font-bold text-[#5300b7] focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
              />
            </div>

            <div>
              <label className="block font-bold text-[#4a4455] uppercase mb-1">What will you sell?</label>
              <textarea
                value={productsSummary}
                onChange={(e) => setProductsSummary(e.target.value)}
                placeholder="e.g. Hand-carved wooden crafts, leather goods, traditional baskets."
                rows={3}
                required
                className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-4 py-2.5 text-xs text-[#121c2a] focus:outline-none resize-none focus:ring-2 focus:ring-[#5300b7]/30"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#5300b7] hover:bg-[#6d28d9] text-white py-3.5 rounded-xl font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all"
            >
              Submit Application &amp; Start Selling
            </button>
          </form>
        </div>
      ) : (
        /* APPROVED SELLER DASHBOARD VIEW */
        <>
          {/* Seller Sub-Navigation Bar (Apply tab is permanently gone) */}
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
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-white text-[#5300b7] hover:bg-[#ebddff] px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
                    <span>Upload Product</span>
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
                  <span className="font-serif-source text-2xl font-bold my-1">
                    MWK {(balance ?? 450000).toLocaleString()}
                  </span>
                  <button
                    onClick={() => {
                      if (onWithdraw) {
                        Promise.resolve(onWithdraw(balance ?? 0, 'mobile_money', {}));
                      } else {
                        onShowToast('Store balance payout requested!');
                      }
                    }}
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

                  {/* File Picker with Max 5 Images */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block font-bold text-[#4a4455] uppercase">
                        Product Photos (Max 5)
                      </label>
                      <span className="text-[10px] font-bold text-[#5300b7]">
                        {imagePreviews.length}/5 Selected
                      </span>
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageFileChange}
                      className="hidden"
                      id="product-file-input"
                    />

                    <label
                      htmlFor="product-file-input"
                      className="w-full bg-[#eff4ff] hover:bg-[#e2ebff] border-2 border-dashed border-[#ccc3d7] rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[#5300b7] text-2xl">add_photo_alternate</span>
                      <span className="text-[11px] font-bold text-[#5300b7] mt-1">
                        Choose Product Images
                      </span>
                      <span className="text-[10px] text-[#7b7486]">PNG, JPG up to 5 images</span>
                    </label>

                    {/* Previews Grid */}
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-5 gap-2 mt-2">
                        {imagePreviews.map((src, idx) => (
                          <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-[#ccc3d7]">
                            <img src={src} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImagePreview(idx)}
                              className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5 text-[10px] hover:bg-rose-600 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[12px] block">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-[#4a4455] uppercase mb-1">Description</label>
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Key features, materials..."
                      rows={2}
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

          {/* STATUS TRACKER TAB */}
          {activeTab === 'pending' && (
            <div className="bg-white rounded-3xl p-8 border border-[#ccc3d7]/30 shadow-xl max-w-xl mx-auto text-center space-y-6">
              <div className="w-20 h-20 bg-[#ebddff] rounded-full flex items-center justify-center text-[#5300b7] mx-auto animate-pulse">
                <span className="material-symbols-outlined text-4xl">schedule</span>
              </div>

              <div>
                <h2 className="font-serif-source text-2xl font-bold text-[#121c2a]">
                  Store Application Status
                </h2>
                <p className="text-xs text-[#4a4455] mt-2 max-w-md mx-auto leading-relaxed">
                  Your store credentials are active. If you need any administrative assistance, contact our team below.
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
                  <span className="text-[#7b7486]">Verification Status:</span>
                  <span className="font-bold text-[#059669] uppercase">Verified Merchant</span>
                </div>
              </div>

              {/* Admin Contact Options: WhatsApp & In-App Web Chat Tab */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => {
                    const msg = `Hello Pa_mSikA Admin, I am contacting you regarding my store "${storeName}".`;
                    const whatsappUrl = `https://wa.me/265890641028?text=${encodeURIComponent(msg)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                  className="w-full bg-[#25D366] hover:bg-[#1ebd59] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  <span>Message Admin on WhatsApp (+265 890 641 028)</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('chat');
                    onShowToast('Opened In-App Web Chat with Admin');
                  }}
                  className="w-full bg-[#eff4ff] hover:bg-[#e2ebff] text-[#5300b7] border border-[#ccc3d7]/50 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">forum</span>
                  <span>Open In-App Chat with Admin</span>
                </button>
              </div>
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
                    <span className="text-[10px] text-[#059669] font-bold uppercase">Online</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const msg = `Hello Pa_mSikA Admin, following up from Seller Hub.`;
                    const whatsappUrl = `https://wa.me/265890641028?text=${encodeURIComponent(msg)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                  className="bg-[#25D366] text-white px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[14px]">chat</span>
                  <span>WhatsApp Admin</span>
                </button>
              </div>

              <div className="bg-[#f8f9ff] p-4 rounded-2xl space-y-3 min-h-[220px]">
                <div className="bg-[#d9e3f6] p-3 rounded-xl max-w-md text-xs text-[#121c2a]">
                  Hello {applicantName}! Welcome to Pa_mSikA Seller Support. How can we assist your business today?
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message to support..."
                  className="flex-1 bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
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

          {/* Floating Action Button (FAB) for Upload Product */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="fixed bottom-20 right-5 sm:bottom-8 sm:right-8 z-40 bg-[#5300b7] hover:bg-[#6d28d9] text-white px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-2 font-extrabold text-xs uppercase tracking-wider active:scale-95 transition-all ring-4 ring-white/50 cursor-pointer"
            title="Upload Product"
          >
            <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
            <span>Upload Product</span>
          </button>

          {/* Floating Product Upload Modal */}
          {isUploadModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#ccc3d7]/30 max-h-[90vh] overflow-y-auto space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-[#ccc3d7]/30">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#5300b7]">add_a_photo</span>
                    <h3 className="font-serif-source text-xl font-bold text-[#121c2a]">Upload Product to Store</h3>
                  </div>
                  <button
                    onClick={() => setIsUploadModalOpen(false)}
                    className="text-[#7b7486] hover:text-[#121c2a]"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <form onSubmit={handleAddProductSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-[#4a4455] uppercase mb-1">Product Title</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Hand-carved Ebony Bowl"
                      required
                      className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#4a4455] uppercase mb-1">Category</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as Product['category'])}
                        className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
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
                        className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#5300b7] focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#4a4455] uppercase mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                      className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                    />
                  </div>

                  {/* File Picker - Up to 5 Images */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block font-bold text-[#4a4455] uppercase">
                        Product Photos (Max 5)
                      </label>
                      <span className="text-[10px] font-bold text-[#5300b7]">
                        {imagePreviews.length}/5 Selected
                      </span>
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageFileChange}
                      className="hidden"
                      id="modal-product-file-input"
                    />

                    <label
                      htmlFor="modal-product-file-input"
                      className="w-full bg-[#eff4ff] hover:bg-[#e2ebff] border-2 border-dashed border-[#ccc3d7] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[#5300b7] text-3xl">add_photo_alternate</span>
                      <span className="text-xs font-bold text-[#5300b7] mt-1">
                        Select Product Images
                      </span>
                      <span className="text-[10px] text-[#7b7486]">Select up to 5 photos from device</span>
                    </label>

                    {/* Previews Grid */}
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-5 gap-2 mt-2">
                        {imagePreviews.map((src, idx) => (
                          <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-[#ccc3d7]">
                            <img src={src} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImagePreview(idx)}
                              className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5 text-[10px] hover:bg-rose-600 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[12px] block">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-[#4a4455] uppercase mb-1">Description</label>
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Describe key features, materials, craftsmanship..."
                      rows={3}
                      className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none resize-none focus:ring-2 focus:ring-[#5300b7]/30"
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(false)}
                      className="flex-1 bg-[#eff4ff] text-[#4a4455] py-3 rounded-xl font-bold text-xs uppercase"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#5300b7] hover:bg-[#6d28d9] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md"
                    >
                      Upload Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

