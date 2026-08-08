import React, { useState, useRef } from 'react';
import { CommunityPost, Product } from '../types';
import { Dialog } from './Dialog';

interface CommunityViewProps {
  posts: CommunityPost[];
  products?: Product[];
  registeredUserName?: string;
  onToggleLike: (postId: string) => void;
  onAddComment?: (postId: string, text: string, authorName?: string) => void;
  onToggleLikeComment?: (postId: string, commentId: string) => void;
  onDeleteComment?: (postId: string, commentId: string) => void;
  onCreateAdminPost?: (
    content: string,
    categoryTag?: string,
    image?: string,
    taggedProduct?: Product
  ) => void;
  onShowToast: (msg: string) => void;
  onViewProduct?: (product: Product) => void;
  onOrderNow?: (product: Product) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  posts,
  products = [],
  registeredUserName = 'Guest',
  onToggleLike,
  onAddComment,
  onToggleLikeComment,
  onDeleteComment,
  onCreateAdminPost,
  onShowToast,
  onViewProduct,
  onOrderNow
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All Posts');

  // Themed confirmation dialog state for deleting a comment (replaces window.confirm)
  const [commentToDelete, setCommentToDelete] = useState<{
    postId: string;
    commentId: string;
    authorName: string;
  } | null>(null);

  // Feed sorting mode: 'newest' | 'recommended' | 'popular' | 'shuffled'
  const [sortMode, setSortMode] = useState<'newest' | 'recommended' | 'popular' | 'shuffled'>('newest');
  const [shuffledPosts, setShuffledPosts] = useState<CommunityPost[] | null>(null);

  // Admin post creation form state
  const [adminPostContent, setAdminPostContent] = useState('');
  const [adminPostCategory, setAdminPostCategory] = useState('#MarketUpdate');
  const [adminPostImage, setAdminPostImage] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [isCreatingPostModal, setIsCreatingPostModal] = useState(false);

  // Ref for local image file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Expanded comments section per post: map postId -> boolean
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  // Comment input per post: map postId -> string
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const categories = ['All Posts', '#MarketUpdate', '#Artisans', '#Automobiles', '#Fashion', '#Promotions'];

  // Calculate user's liked category frequency for personalization
  const likedCategories = React.useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((p) => {
      if (p.isLiked && p.categoryTag) {
        const tag = p.categoryTag.toLowerCase();
        counts[tag] = (counts[tag] || 0) + 1;
      }
    });
    return counts;
  }, [posts]);

  // System Shuffle trigger
  const handleSystemShuffle = () => {
    const shuffled = [...posts].sort(() => Math.random() - 0.5);
    setShuffledPosts(shuffled);
    setSortMode('shuffled');
    onShowToast('?? System Shuffle applied! Fresh feed order generated.');
  };

  // Base list depending on shuffle or main posts
  const basePosts = sortMode === 'shuffled' && shuffledPosts ? shuffledPosts : posts;

  // Filter posts by active category tag
  const categoryFilteredPosts = basePosts.filter((p) => {
    if (activeCategory === 'All Posts') return true;
    return p.categoryTag?.toLowerCase() === activeCategory.toLowerCase();
  });

  // Apply intelligent feed sorting & recommendation algorithms
  const sortedPosts = React.useMemo(() => {
    if (sortMode === 'shuffled') {
      return categoryFilteredPosts;
    }

    return [...categoryFilteredPosts].sort((a, b) => {
      if (sortMode === 'newest') {
        const timeA = a.id.startsWith('post-') ? parseInt(a.id.replace('post-', ''), 10) || 0 : 0;
        const timeB = b.id.startsWith('post-') ? parseInt(b.id.replace('post-', ''), 10) || 0 : 0;
        if (timeA !== timeB) return timeB - timeA;
        return posts.indexOf(b) - posts.indexOf(a);
      }

      if (sortMode === 'popular') {
        const scoreA = a.likes + (a.commentsCount || 0) * 2;
        const scoreB = b.likes + (b.commentsCount || 0) * 2;
        return scoreB - scoreA;
      }

      if (sortMode === 'recommended') {
        const tagA = a.categoryTag ? a.categoryTag.toLowerCase() : '';
        const tagB = b.categoryTag ? b.categoryTag.toLowerCase() : '';
        const affinityA = (likedCategories[tagA] || 0) * 100;
        const affinityB = (likedCategories[tagB] || 0) * 100;

        const timeA = a.id.startsWith('post-') ? parseInt(a.id.replace('post-', ''), 10) || 0 : 0;
        const timeB = b.id.startsWith('post-') ? parseInt(b.id.replace('post-', ''), 10) || 0 : 0;

        const scoreA = affinityA + a.likes * 2 + (a.isAdminPost ? 30 : 0) + (timeA ? timeA / 1000000000 : 0);
        const scoreB = affinityB + b.likes * 2 + (b.isAdminPost ? 30 : 0) + (timeB ? timeB / 1000000000 : 0);

        return scoreB - scoreA;
      }

      return 0;
    });
  }, [categoryFilteredPosts, sortMode, likedCategories, posts]);

  const toggleCommentsView = (postId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleCommentSubmit = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const text = commentInputs[postId] || '';
    if (!text.trim()) return;

    if (onAddComment) {
      onAddComment(postId, text.trim(), registeredUserName);
    }
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    // Ensure comments drawer stays open
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        onShowToast('Image file size is too large (maximum 15MB allowed)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setAdminPostImage(reader.result as string);
          onShowToast('Local image loaded successfully!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdminPostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPostContent.trim()) return;

    const taggedProd = products.find((p) => p.id === selectedProductId);

    if (onCreateAdminPost) {
      onCreateAdminPost(
        adminPostContent.trim(),
        adminPostCategory,
        adminPostImage.trim() || undefined,
        taggedProd
      );
    }
    setAdminPostContent('');
    setAdminPostImage('');
    setSelectedProductId('');
    setIsCreatingPostModal(false);
  };

  const handleSharePost = (authorName: string) => {
    navigator.clipboard?.writeText(window.location.href);
    onShowToast(`Copied feed broadcast link by ${authorName}!`);
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto px-4 py-4 pb-28 space-y-6">
      {/* Official Announcement Header with Permanent Compact Top Shuffle Bar */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-5 sm:p-6 text-white shadow-xl border border-purple-500/20 space-y-3">
        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-amber-400 text-purple-950 font-extrabold text-[10px] rounded-full uppercase tracking-wider shadow-sm">
                OFFICIAL FEED
              </span>
              <span className="text-xs text-purple-200 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Admin Updates
              </span>
            </div>
          </div>

          <h2 className="font-serif-source text-xl sm:text-2xl font-bold leading-tight">
            Pa_mSikA Official Marketplace Broadcasts
          </h2>
        </div>

        {/* Permanent Compact Top Feed Sorting & System Shuffle Control Bar */}
        <div className="relative z-10 pt-3 border-t border-purple-700/50 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-black/30 backdrop-blur-md p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setSortMode('newest')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all ${
                sortMode === 'newest'
                  ? 'bg-white text-purple-950 shadow-sm'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              <span>Newest</span>
            </button>

            <button
              onClick={() => setSortMode('recommended')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all ${
                sortMode === 'recommended'
                  ? 'bg-amber-400 text-purple-950 shadow-sm'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              <span>For You</span>
            </button>

            <button
              onClick={() => setSortMode('popular')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all ${
                sortMode === 'popular'
                  ? 'bg-white text-purple-950 shadow-sm'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
              <span>Popular</span>
            </button>
          </div>

          {/* Compact Permanent Shuffle Button */}
          <button
            onClick={handleSystemShuffle}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-purple-950 rounded-xl font-extrabold text-[11px] flex items-center gap-1 shadow-sm active:scale-95 transition-all ml-auto"
            title="Reshuffle feed posts dynamically"
          >
            <span className="material-symbols-outlined text-[15px]">shuffle</span>
            <span>Shuffle</span>
          </button>
        </div>
      </section>

      {/* Floating Admin Plus (+) FAB Button */}
      <button
        onClick={() => setIsCreatingPostModal(true)}
        className="fixed bottom-5 sm:bottom-6 right-5 sm:right-8 z-50 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white p-3.5 sm:p-4 rounded-full shadow-2xl border-2 border-purple-300 dark:border-purple-500 flex items-center justify-center gap-2 group transition-all"
        title="Create Official Admin Broadcast"
      >
        <span className="material-symbols-outlined text-[26px]">add</span>
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold">
          New Broadcast
        </span>
      </button>

      {/* Admin Post Creation Modal */}
      {isCreatingPostModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600 text-2xl">campaign</span>
                <div>
                  <h3 className="font-serif-source text-lg font-bold text-slate-900 dark:text-white">
                    Create Official Admin Broadcast
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Will be posted as Pa_mSikA Official Admin
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreatingPostModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAdminPostSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1">
                  Category Tag
                </label>
                <select
                  value={adminPostCategory}
                  onChange={(e) => setAdminPostCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="#MarketUpdate">#MarketUpdate (Official News)</option>
                  <option value="#Artisans">#Artisans (Crafts &amp; Woodwork)</option>
                  <option value="#Automobiles">#Automobiles (Spares &amp; Vehicles)</option>
                  <option value="#Fashion">#Fashion (Apparel &amp; Footwear)</option>
                  <option value="#Promotions">#Promotions (Discounts &amp; Deals)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1">
                  Broadcast Message Content
                </label>
                <textarea
                  value={adminPostContent}
                  onChange={(e) => setAdminPostContent(e.target.value)}
                  placeholder="Type official broadcast announcement, restock notification, or seller feature details..."
                  rows={4}
                  required
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Attachment Image Field with File Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1">
                  Attachment Image (Local File or URL)
                </label>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Local File Selector Button */}
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/80 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700/60 rounded-xl px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs active:scale-98"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
                    <span>Upload Image from Device</span>
                  </button>
                </div>

                {/* Image URL Input Field */}
                <input
                  type="url"
                  value={adminPostImage.startsWith('data:') ? '' : adminPostImage}
                  onChange={(e) => setAdminPostImage(e.target.value)}
                  placeholder={adminPostImage.startsWith('data:') ? 'Local file attached (clear to enter URL)' : 'Or paste image URL (https://...)'}
                  disabled={adminPostImage.startsWith('data:')}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
                />

                {/* Preset Options */}
                <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1 no-scrollbar">
                  <span className="text-[10px] text-slate-500 shrink-0 font-semibold">Presets:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setAdminPostImage(
                        'https://lh3.googleusercontent.com/aida/AP1WRLsomHc4ZcdkJK7SUfjaD2kRGG40_Iz3rR5ePms3Pb7f6uAJ5shwJ53cKabNYhb37nbRDknnehQ71JZKhYhGk_vPiYiKxV2GVg4IHAgEyV7vYjAFk5qDZ-TgSEXE-qIHvomMY7zuRpjg3paTFQG34bof7ie6HILPuiWjiVGMIxIxva8ozqzMQWQFtY4gKv45oiyprgPrdmakKx8wnvd3PFthAvZ8cA5s8D3ypFzv9d32pQm1PphwFj8MITk'
                      )
                    }
                    className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 text-[10px] font-semibold text-slate-700 dark:text-zinc-300 rounded-lg hover:bg-purple-100 shrink-0"
                  >
                    Artisans
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setAdminPostImage(
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuDjByb9Ef7SLFaUbI5I_XBVVuSqd_ery1Hj_ZAEFd7OK0VQTHdCaveJzSaO27RMI90FspNKIB5LveWFu_K8d8Cs8k5ob6g6-0Dc9zlFMSMzXnvRuMNPlj2dE6uALEQUlP1plP1emLZ2uauasCIBAaZnpmr0Plgju2mVOmJLPW99v9lupmVqoaqN2n3cHOFmtPZW_BykwcNkppziCZ8LiY4j-CZ8DbHpvaRZO2_p4f41HDi5t8RUovF4CSj3rRGDQMpfeUJm3QvTgnA'
                      )
                    }
                    className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 text-[10px] font-semibold text-slate-700 dark:text-zinc-300 rounded-lg hover:bg-purple-100 shrink-0"
                  >
                    Inverters
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setAdminPostImage(
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuDFI8sThj51C9-yE9u7X5A-eUvhgD5Q-JqL78b4r0Xf4qP1-5_I'
                      )
                    }
                    className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 text-[10px] font-semibold text-slate-700 dark:text-zinc-300 rounded-lg hover:bg-purple-100 shrink-0"
                  >
                    Automobiles
                  </button>
                </div>

                {/* Attached Image Thumbnail Preview */}
                {adminPostImage && (
                  <div className="relative mt-3 w-full h-40 rounded-2xl overflow-hidden border border-purple-300 dark:border-purple-700 bg-slate-100 dark:bg-zinc-800">
                    <img src={adminPostImage} alt="Attachment preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setAdminPostImage('')}
                      className="absolute top-2 right-2 bg-black/70 hover:bg-rose-600 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors"
                      title="Remove image attachment"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                    <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                      {adminPostImage.startsWith('data:') ? '?? Local Device Photo Attached' : '?? Image URL Attached'}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1">
                  Tag Marketplace Product (Optional)
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- No Tagged Product --</option>
                  {products.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} (MWK {prod.price.toLocaleString()}) - {prod.sellerName || 'Merchant'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingPostModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>Broadcast Post</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="space-y-2">
        <div className="overflow-x-auto no-scrollbar py-1 flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full font-bold text-xs whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-purple-700 text-white shadow-md'
                  : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Mode Info Badge */}
        {sortMode === 'recommended' && (
          <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-xl px-3 py-1.5 text-[11px] text-purple-700 dark:text-purple-300 font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">psychology</span>
            <span>
              Smart Feed algorithm active: prioritized based on your liked category tags
              {Object.keys(likedCategories).length > 0
                ? ` (${Object.keys(likedCategories).map((t) => t.toUpperCase()).join(', ')})`
                : ''}
            </span>
          </div>
        )}
      </div>

      {/* Feed List */}
      <div className="flex flex-col gap-6">
        {sortedPosts.map((post) => {
          const isCommentsOpen = !!expandedComments[post.id];
          const commentsList = post.comments || [];

          return (
            <article
              key={post.id}
              className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-zinc-800 transition-all hover:shadow-md"
            >
              {/* Author & Header */}
              <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      className="w-11 h-11 rounded-2xl object-cover shrink-0 border border-purple-200 dark:border-purple-800/60 shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-600 text-white rounded-full flex items-center justify-center text-[10px]">
                      <span className="material-symbols-outlined text-[11px]">verified</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {post.authorName}
                      </h3>
                      <span className="px-2 py-0.5 bg-purple-600 text-white font-extrabold text-[9px] rounded-full uppercase tracking-wider shadow-sm flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[10px]">shield</span>
                        {post.authorBadge || 'ADMIN'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5">
                      <span>{post.timestamp}</span>
                      {post.categoryTag && (
                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                          • {post.categoryTag}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleSharePost(post.authorName)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">share</span>
                </button>
              </div>

              {/* Broadcast Content */}
              <div className="p-4 pt-3 space-y-3">
                <p className="text-xs sm:text-sm text-slate-800 dark:text-zinc-200 leading-relaxed font-normal whitespace-pre-line">
                  {post.content}
                </p>

                {/* Tagged Product Highlight Card */}
                {post.taggedProduct && (
                  <div
                    onClick={() => onViewProduct && onViewProduct(post.taggedProduct!)}
                    className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800/50 flex items-center gap-3 cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 transition-all group shadow-2xs"
                  >
                    <img
                      src={post.taggedProduct.image}
                      alt={post.taggedProduct.name}
                      className="w-14 h-14 object-cover rounded-xl shrink-0 border border-purple-200 dark:border-purple-800 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block">
                        Featured Item In Broadcast
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400">
                        {post.taggedProduct.name}
                      </h4>
                      <p className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">
                        MWK {post.taggedProduct.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {onOrderNow && (
                        <button
                          onClick={() => onOrderNow(post.taggedProduct!)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[11px] font-bold uppercase shadow-sm active:scale-95 transition-all"
                        >
                          Order
                        </button>
                      )}
                      {onViewProduct && (
                        <button
                          onClick={() => onViewProduct(post.taggedProduct!)}
                          className="px-3 py-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-[10px] font-bold hover:bg-slate-50 dark:hover:bg-zinc-700 active:scale-95 transition-all"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Attachment Image */}
              {post.image && (
                <div className="relative w-full aspect-video bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                  <img
                    src={post.image}
                    alt="Post attachment"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Interaction Bar (Like, Comment, Share) */}
              <div className="p-3 px-4 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800 text-xs">
                <div className="flex items-center gap-6">
                  {/* Like Button */}
                  <button
                    onClick={() => onToggleLike(post.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all active:scale-90 ${
                      post.isLiked
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 font-bold'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: post.isLiked ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      favorite
                    </span>
                    <span>{post.likes} Likes</span>
                  </button>

                  {/* Comment Toggle Button */}
                  <button
                    onClick={() => toggleCommentsView(post.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                      isCommentsOpen
                        ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                    <span>{post.commentsCount || commentsList.length} Comments</span>
                  </button>
                </div>

                <button
                  onClick={() => handleSharePost(post.authorName)}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-purple-600 font-semibold"
                >
                  <span className="material-symbols-outlined text-[18px]">share</span>
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>

              {/* Expanded Comments Section */}
              {isCommentsOpen && (
                <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 border-t border-slate-200 dark:border-zinc-800 space-y-4 animate-in fade-in duration-200">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                    <span>Comments ({commentsList.length})</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      All members can reply &amp; comment
                    </span>
                  </h4>

                  {/* Comments List */}
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {commentsList.length === 0 ? (
                      <p className="text-xs text-slate-500 dark:text-zinc-400 italic py-2">
                        No comments yet. Be the first member to reply to this Admin update!
                      </p>
                    ) : (
                      commentsList.map((comm) => (
                        <div
                          key={comm.id}
                          className="flex gap-2.5 p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs"
                        >
                          <img
                            src={comm.authorAvatar}
                            alt={comm.authorName}
                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200 dark:border-zinc-700"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-slate-900 dark:text-white">
                                  {comm.authorName}
                                </span>
                                {comm.authorBadge && (
                                  <span
                                    className={`px-1.5 py-0.2 text-[9px] font-extrabold rounded uppercase ${
                                      comm.authorBadge === 'ADMIN'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                                    }`}
                                  >
                                    {comm.authorBadge}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400">{comm.timestamp}</span>
                                {onDeleteComment && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCommentToDelete({ postId: post.id, commentId: comm.id, authorName: comm.authorName });
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors flex items-center gap-0.5"
                                    title="Admin Moderator: Delete Comment"
                                  >
                                    <span className="material-symbols-outlined text-[15px]">delete</span>
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-zinc-300 mt-1 leading-relaxed">
                              {comm.text}
                            </p>

                            {/* Comment Like button */}
                            <div className="flex items-center gap-3 mt-1.5">
                              <button
                                onClick={() =>
                                  onToggleLikeComment && onToggleLikeComment(post.id, comm.id)
                                }
                                className={`text-[10px] font-bold flex items-center gap-1 transition-colors ${
                                  comm.isLiked
                                    ? 'text-rose-600'
                                    : 'text-slate-400 hover:text-rose-600'
                                }`}
                              >
                                <span
                                  className="material-symbols-outlined text-[14px]"
                                  style={{ fontVariationSettings: comm.isLiked ? "'FILL' 1" : "'FILL' 0" }}
                                >
                                  favorite
                                </span>
                                <span>{comm.likes || 0}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Comment Input Form */}
                  <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="pt-2 border-t border-slate-200 dark:border-zinc-700/60">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold">Commenting as:</span>
                      <span className="inline-flex items-center gap-1.5 font-bold text-xs text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/70 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{registeredUserName}</span>
                        <span className="material-symbols-outlined text-[13px] text-purple-600 dark:text-purple-400">verified</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        placeholder="Write an official comment or inquiry..."
                        required
                        className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-full px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold text-xs uppercase shadow-sm active:scale-95 transition-all flex items-center gap-1 shrink-0"
                      >
                        <span className="material-symbols-outlined text-[14px]">send</span>
                        <span>Reply</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* End of Feed */}
      <div className="py-8 flex flex-col items-center text-center px-6 bg-purple-50 dark:bg-purple-950/30 rounded-3xl border border-purple-200 dark:border-purple-900/40">
        <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center mb-3 shadow-md">
          <span className="material-symbols-outlined text-[24px]">verified</span>
        </div>
        <h4 className="font-serif-source text-lg font-bold text-slate-900 dark:text-white">
          You're all caught up on official broadcasts!
        </h4>
        <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 mb-4">
          Stay tuned for real-time announcements from Pa_mSikA Admin.
        </p>
      </div>

      {/* Themed confirmation dialog for deleting a comment */}
      <Dialog
        open={!!commentToDelete}
        onClose={() => setCommentToDelete(null)}
        variant="warning"
        title="Delete this comment?"
        description={
          commentToDelete
            ? `Admin Moderator: this will permanently remove the comment by "${commentToDelete.authorName}".`
            : undefined
        }
        destructive
        primaryAction={{
          label: 'Delete',
          onClick: () => {
            if (commentToDelete) {
              onDeleteComment?.(commentToDelete.postId, commentToDelete.commentId);
            }
            setCommentToDelete(null);
          },
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setCommentToDelete(null),
        }}
      />
    </div>
  );
};