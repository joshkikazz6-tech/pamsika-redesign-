import React, { useState } from 'react';
import { CommunityPost } from '../types';

interface CommunityViewProps {
  posts: CommunityPost[];
  onToggleLike: (postId: string) => void;
  onCreatePost: (content: string, categoryTag?: string, image?: string) => void;
  onShowToast: (msg: string) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  posts,
  onToggleLike,
  onCreatePost,
  onShowToast
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All Posts');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('#Artisans');
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  const categories = ['All Posts', '#Automobiles', '#Fashion', '#MarketUpdate', '#Artisans'];

  const filteredPosts = posts.filter((p) => {
    if (activeCategory === 'All Posts') return true;
    return p.categoryTag?.toLowerCase() === activeCategory.toLowerCase();
  });

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    onCreatePost(newPostContent, newPostCategory);
    setNewPostContent('');
    setIsCreatingPost(false);
    onShowToast('Post published to Community feed!');
  };

  const handleSharePost = (authorName: string) => {
    navigator.clipboard?.writeText(window.location.href);
    onShowToast(`Copied post link by ${authorName}!`);
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto px-4 py-4 pb-28 space-y-6">
      {/* Official Announcement Header */}
      <section className="relative overflow-hidden rounded-2xl bg-[#ebddff] p-6 text-[#250059] shadow-sm">
        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#5300b7]">campaign</span>
            <span className="text-[11px] font-bold text-[#5b00c5] uppercase tracking-widest">
              Official Update
            </span>
          </div>
          <h2 className="font-serif-source text-2xl font-bold text-[#250059] leading-tight">
            Seasonal Marketplace Fair is Live!
          </h2>
          <p className="text-sm text-[#4a4455] max-w-[85%] leading-relaxed">
            Join the local community this weekend in Lilongwe &amp; Blantyre for exclusive deals and fresh artisan arrivals.
          </p>
          <button
            onClick={() => onShowToast('Registered for Seasonal Marketplace Fair!')}
            className="mt-2 w-max px-5 py-2 bg-[#5300b7] hover:bg-[#6d28d9] text-white font-bold text-xs rounded-full shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            Learn More &amp; Register
          </button>
        </div>
        <div className="absolute right-4 top-4 opacity-15">
          <span className="material-symbols-outlined text-[90px] text-[#5300b7]">celebration</span>
        </div>
      </section>

      {/* Create Post Prompt Box */}
      <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#ccc3d7]/30 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#5300b7] flex items-center justify-center text-white font-bold text-sm shrink-0">
            JD
          </div>
          <button
            onClick={() => setIsCreatingPost(true)}
            className="flex-1 bg-[#eff4ff] hover:bg-[#e6eeff] rounded-full px-4 py-2.5 text-left text-sm text-[#4a4455]/70 transition-colors"
          >
            What's on your mind?
          </button>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-[#ccc3d7]/30">
          <div className="flex gap-4">
            <button
              onClick={() => setIsCreatingPost(true)}
              className="flex items-center gap-1.5 text-xs text-[#4a4455] hover:text-[#5300b7] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-[#5300b7]">image</span>
              <span>Photo</span>
            </button>
            <button
              onClick={() => setIsCreatingPost(true)}
              className="flex items-center gap-1.5 text-xs text-[#4a4455] hover:text-[#5300b7] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-[#5300b7]">sell</span>
              <span>Tag Item</span>
            </button>
          </div>
          <button
            onClick={() => setIsCreatingPost(true)}
            className="bg-[#5300b7] hover:bg-[#6d28d9] text-white px-5 py-1.5 rounded-full font-bold text-xs shadow-md active:scale-95 transition-all"
          >
            Post
          </button>
        </div>
      </section>

      {/* Post Modal */}
      {isCreatingPost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif-source text-xl font-bold text-[#121c2a]">Create Community Post</h3>
              <button
                onClick={() => setIsCreatingPost(false)}
                className="text-[#7b7486] hover:text-[#121c2a]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreatePostSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4a4455] uppercase mb-1">
                  Tag Category
                </label>
                <select
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value)}
                  className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                >
                  <option value="#Artisans">#Artisans</option>
                  <option value="#Fashion">#Fashion</option>
                  <option value="#Automobiles">#Automobiles</option>
                  <option value="#MarketUpdate">#MarketUpdate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4a4455] uppercase mb-1">
                  Your Message
                </label>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Share market insights, ask questions, or showcase products..."
                  rows={4}
                  required
                  className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-4 py-3 text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingPost(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#4a4455] hover:bg-[#eff4ff]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#5300b7] hover:bg-[#6d28d9] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Scroll */}
      <div className="overflow-x-auto no-scrollbar py-2 flex gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full font-semibold text-xs whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-[#5300b7] text-white shadow-md'
                : 'bg-[#ebddff] text-[#5300b7] hover:bg-[#5300b7]/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Feed List */}
      <div className="flex flex-col gap-6">
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#ccc3d7]/30"
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="w-10 h-10 rounded-full object-cover shrink-0 bg-[#e6eeff]"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-[#121c2a]">{post.authorName}</h3>
                    {post.authorBadge && (
                      <span className="px-2 py-0.5 bg-[#5300b7]/10 text-[#5300b7] font-bold text-[9px] rounded-full uppercase">
                        {post.authorBadge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#7b7486]">
                    {post.timestamp} {post.categoryTag && `• ${post.categoryTag}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleSharePost(post.authorName)}
                className="text-[#7b7486] hover:text-[#5300b7]"
              >
                <span className="material-symbols-outlined text-[20px]">more_horiz</span>
              </button>
            </div>

            <div className="px-4 pb-3">
              <p className="text-sm text-[#121c2a] leading-relaxed">{post.content}</p>
            </div>

            {post.image && (
              <div className="relative w-full aspect-video bg-[#eff4ff] overflow-hidden">
                <img
                  src={post.image}
                  alt="Post attachment"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-4 flex items-center justify-between border-t border-[#ccc3d7]/20 text-xs">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => onToggleLike(post.id)}
                  className={`flex items-center gap-1.5 transition-colors ${
                    post.isLiked ? 'text-[#ba1a1a] font-bold' : 'text-[#4a4455] hover:text-[#ba1a1a]'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: post.isLiked ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    favorite
                  </span>
                  <span>{post.likes}</span>
                </button>

                <button
                  onClick={() => onShowToast('Comments feature open!')}
                  className="flex items-center gap-1.5 text-[#4a4455] hover:text-[#5300b7] transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                  <span>{post.commentsCount}</span>
                </button>
              </div>

              <button
                onClick={() => handleSharePost(post.authorName)}
                className="flex items-center gap-1.5 text-[#4a4455] hover:text-[#5300b7] font-semibold"
              >
                <span className="material-symbols-outlined text-[18px]">share</span>
                <span>Share</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* End of Feed Pitch */}
      <div className="py-8 flex flex-col items-center text-center px-6 bg-[#ebddff]/40 rounded-3xl border border-[#5300b7]/10">
        <div className="w-14 h-14 bg-[#ebddff] rounded-full flex items-center justify-center mb-3 text-[#5300b7]">
          <span className="material-symbols-outlined text-[28px]">diversity_1</span>
        </div>
        <h4 className="font-serif-source text-xl font-bold text-[#121c2a]">You're all caught up!</h4>
        <p className="text-xs text-[#4a4455] mt-1 mb-4">
          Invite friends to join Pa_mSikA community and share marketplace finds.
        </p>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            onShowToast('Invite link copied to clipboard!');
          }}
          className="bg-[#5300b7] hover:bg-[#6d28d9] text-white px-6 py-2.5 rounded-full font-bold text-xs shadow-md active:scale-95 transition-all"
        >
          Invite Friends
        </button>
      </div>
    </div>
  );
};
