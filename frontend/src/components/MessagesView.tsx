import React, { useState } from 'react';
import { ChatConversation } from '../types';

interface MessagesViewProps {
  conversations: ChatConversation[];
  onSelectConversation: (convId: string) => void;
  onShowToast: (msg: string) => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  conversations,
  onSelectConversation,
  onShowToast
}) => {
  const [filterTab, setFilterTab] = useState<'All' | 'Unread' | 'Sellers' | 'Buyers'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterTab === 'Unread') return c.unreadCount > 0;
    if (filterTab === 'Sellers') return c.type === 'seller';
    if (filterTab === 'Buyers') return c.type === 'buyer';
    return true;
  });

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto px-4 py-4 pb-28 relative min-h-[80vh]">
      {/* Header & Search Bar */}
      <div className="space-y-4 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="font-serif-source text-2xl font-bold text-[#121c2a]">Messages</h2>
          <button
            onClick={() => onShowToast('Compose new message initiated.')}
            className="w-10 h-10 rounded-full bg-[#5300b7]/10 text-[#5300b7] flex items-center justify-center hover:bg-[#5300b7]/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">edit_square</span>
          </button>
        </div>

        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#7b7486] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full h-11 pl-11 pr-4 bg-[#eff4ff] rounded-full border-none focus:ring-2 focus:ring-[#5300b7]/20 text-sm text-[#121c2a] placeholder-[#7b7486] transition-all"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {(['All', 'Unread', 'Sellers', 'Buyers'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filterTab === tab
                  ? 'bg-[#5300b7] text-white shadow-sm'
                  : 'bg-[#dee9fc] text-[#4a4455] hover:bg-[#d9e3f6]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex flex-col space-y-2">
        {filteredConversations.length === 0 ? (
          <div className="pt-16 flex flex-col items-center justify-center text-center opacity-60">
            <span className="material-symbols-outlined text-[#5300b7] text-[48px] mb-2">forum</span>
            <p className="font-semibold text-sm text-[#121c2a]">No conversations found</p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`flex items-center gap-4 p-3 rounded-2xl transition-all text-left relative overflow-hidden group ${
                conv.unreadCount > 0
                  ? 'bg-[#5300b7]/5 hover:bg-[#5300b7]/10'
                  : 'bg-white hover:bg-[#eff4ff] border border-[#ccc3d7]/30'
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-[#d9e3f6]">
                  <img
                    src={conv.avatar}
                    alt={conv.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {conv.online && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-sm text-[#121c2a] truncate pr-2">{conv.name}</h3>
                  <span className={`text-[11px] ${conv.unreadCount > 0 ? 'text-[#5300b7] font-bold' : 'text-[#7b7486]'}`}>
                    {conv.timestamp}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p
                    className={`text-xs truncate pr-4 ${
                      conv.unreadCount > 0 ? 'font-bold text-[#121c2a]' : 'text-[#4a4455]'
                    }`}
                  >
                    {conv.lastMessage}
                  </p>
                  {conv.unreadCount > 0 && (
                    <div className="w-2.5 h-2.5 bg-[#5300b7] rounded-full shrink-0 animate-pulse"></div>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => onShowToast('New message modal active')}
        className="fixed bottom-20 right-6 w-14 h-14 bg-[#5300b7] text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40"
      >
        <span className="material-symbols-outlined text-[24px]">chat</span>
      </button>
    </div>
  );
};
