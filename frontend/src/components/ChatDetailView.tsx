import React, { useState, useEffect, useRef } from 'react';
import { ChatConversation } from '../types';

interface ChatDetailViewProps {
  conversation: ChatConversation;
  onBack: () => void;
  onSendMessage: (convId: string, text: string) => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const ChatDetailView: React.FC<ChatDetailViewProps> = ({
  conversation,
  onBack,
  onSendMessage,
  onShowToast
}) => {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages, isSending]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSending) return;

    const messageText = text.trim();
    setText('');
    setIsSending(true);
    onSendMessage(conversation.id, messageText)
      .catch((err: any) => onShowToast(err?.message || 'Message failed to send'))
      .finally(() => setIsSending(false));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-3xl mx-auto bg-white border-x border-[#ccc3d7]/30">
      {/* Contact Header */}
      <div className="bg-[#f8f9ff] px-4 py-3 border-b border-[#ccc3d7]/30 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full hover:bg-[#e6eeff] flex items-center justify-center text-[#121c2a]"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="relative">
            <img
              src={conversation.avatar}
              alt={conversation.name}
              className="w-10 h-10 rounded-full object-cover shrink-0 bg-[#d9e3f6]"
            />
            {conversation.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#121c2a] leading-tight">{conversation.name}</h3>
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
              {conversation.online ? 'Active Now' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onShowToast(`Calling ${conversation.name}...`)}
            className="w-9 h-9 rounded-full text-[#5300b7] hover:bg-[#5300b7]/10 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">call</span>
          </button>
          <button
            onClick={() => onShowToast('Conversation settings open.')}
            className="w-9 h-9 rounded-full text-[#4a4455] hover:bg-[#eff4ff] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">more_vert</span>
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f9ff]">
        <div className="flex justify-center my-2">
          <span className="px-3 py-1 bg-[#e6eeff] text-[#4a4455] text-[11px] font-semibold rounded-full">
            Today
          </span>
        </div>

        {conversation.messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 max-w-[85%] ${
                isUser ? 'self-end items-end ml-auto' : 'self-start items-start'
              }`}
            >
              {/* Optional Product Reference Card */}
              {msg.productRef && (
                <div className="bg-white rounded-2xl overflow-hidden border border-[#ccc3d7]/30 shadow-sm mb-1 max-w-xs">
                  <img
                    src={msg.productRef.image}
                    alt={msg.productRef.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3">
                    <span className="text-[10px] font-bold text-[#5300b7] uppercase">Product Listing</span>
                    <h4 className="font-bold text-xs text-[#121c2a] line-clamp-1">{msg.productRef.name}</h4>
                    <p className="text-xs font-bold text-[#5300b7] mt-0.5">
                      MWK {msg.productRef.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-[#5300b7] text-white rounded-tr-none'
                    : 'bg-[#d9e3f6] text-[#121c2a] rounded-tl-none'
                }`}
              >
                <p>{msg.text}</p>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-[#7b7486] px-1">
                <span>{msg.timestamp}</span>
                {isUser && (
                  <span className="material-symbols-outlined text-[14px] text-[#5300b7]">
                    done_all
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Sending Indicator */}
        {isSending && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#d9e3f6] rounded-full w-max text-xs text-[#4a4455]">
            <span className="font-semibold">Sending...</span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-[#5300b7] rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-[#5300b7] rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-[#5300b7] rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-white border-t border-[#ccc3d7]/30 shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2 bg-[#eff4ff] rounded-full px-3 py-1.5 border border-[#ccc3d7]/40">
          <button
            type="button"
            onClick={() => onShowToast('Attachment picker opened')}
            className="text-[#4a4455] hover:text-[#5300b7] p-1"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
          </button>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:outline-none text-sm text-[#121c2a] px-2"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-all ${
              text.trim()
                ? 'bg-[#5300b7] hover:bg-[#6d28d9] shadow-md scale-100'
                : 'bg-[#ccc3d7] cursor-not-allowed scale-95'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
