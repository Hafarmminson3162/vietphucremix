import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../i18n/translations';
import { COSTUMES_DATA, Costume } from '../data/costumes';
import { getLocalizedCostume } from '../i18n/costumeTranslations';
import { sendChatMessage, ChatMessage } from '../services/chatService';

interface ChatbotWidgetProps {
  lang: Language;
  onSelectCostumeForAI?: (costume: Costume) => void;
  onViewCostumeDetail?: (costume: Costume) => void;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  lang,
  onSelectCostumeForAI,
  onViewCostumeDetail,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const initialWelcomeTextVi = `Xin chào! Tôi là **Trợ lý Phối đồ Việt Phục AI** 🌸

Tôi sẵn sàng hỗ trợ bạn hoàn thiện phong cách cổ phục truyền thống:
• **Phụ kiện tinh tế**: Kiềng bạc hoa sen, xà tích bạc, trâm cài tóc, nón quai thao, quạt lụa, hài thêu, khăn rằn...
• **Kiểu dáng & Nếp áo**: Áo Nhật Bình cung đình, Áo Tấc trang nghiêm, Áo Ngũ Thân thanh lịch, Áo Giao Lĩnh, Áo Cóm Thái...
• **Ngữ cảnh & Dịp lễ**: Phối đồ cưới hỏi, du xuân, chụp ảnh nghệ thuật, lễ chùa, kỷ yếu...

Hãy chọn câu hỏi gợi ý bên dưới hoặc nhập yêu cầu của bạn nhé!`;

  const initialWelcomeTextEn = `Hello! I am your **VietPhuc AI Heritage Stylist** 🌸

I'm here to help you style authentic Vietnamese traditional attire:
• **Accessories**: Silver collar (kiềng bạc), waist chains (xà tích), hairpin (trâm), flat palm hat (nón quai thao), silk fans, embroidered slippers...
• **Silhouettes**: Imperial Áo Nhật Bình, ceremonial Áo Tấc, elegant Áo Ngũ Thân, ancient Áo Giao Lĩnh, Thái Áo Cóm...
• **Occasions**: Weddings, spring festivals, temple visits, artistic photoshoots...

Pick a suggestion below or ask me anything!`;

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: lang === 'en' ? initialWelcomeTextEn : initialWelcomeTextVi,
      timestamp: new Date().toLocaleTimeString(lang === 'en' ? 'en-US' : 'vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sync welcome text if conversation is at start and language switches
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'welcome') {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: lang === 'en' ? initialWelcomeTextEn : initialWelcomeTextVi,
          timestamp: new Date().toLocaleTimeString(lang === 'en' ? 'en-US' : 'vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
    }
  }, [lang]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  const quickChips = [
    {
      label: lang === 'en' ? '👑 Wedding & Engagement' : '👑 Trang phục cưới & dạm ngõ',
      prompt: lang === 'en' ? 'Gợi ý trang phục và phụ kiện trang trọng cho ngày cưới truyền thống Việt Nam' : 'Gợi ý trang phục và phụ kiện trang trọng cho ngày cưới & lễ ăn hỏi truyền thống',
    },
    {
      label: lang === 'en' ? '✨ Áo Nhật Bình Accessories' : '✨ Phụ kiện phối Áo Nhật Bình',
      prompt: lang === 'en' ? 'Áo Nhật Bình nên phối cùng những phụ kiện, trang sức và giày dép nào để chuẩn quý tộc triều Nguyễn?' : 'Áo Nhật Bình nên phối cùng những phụ kiện, trang sức và giày dép nào để chuẩn quý tộc triều Nguyễn?',
    },
    {
      label: lang === 'en' ? '🎋 Nón Quai Thao Styling' : '🎋 Nón quai thao phối với gì?',
      prompt: lang === 'en' ? 'Nón quai thao (nón ba tầm) thường đi kèm với kiểu áo và trang sức nào?' : 'Nón quai thao (nón ba tầm) thường đi kèm với kiểu áo và trang phục nào duyên dáng nhất?',
    },
    {
      label: lang === 'en' ? '🌿 Áo Ngũ Thân Everyday' : '🌿 Phối Áo Ngũ Thân thanh lịch',
      prompt: lang === 'en' ? 'Cách chọn Áo Ngũ Thân tay chẽn cho nam và nữ để đi dạo phố hoặc dự sự kiện' : 'Cách chọn và phối Áo Ngũ Thân tay chẽn cho nam và nữ để đi dạo phố hoặc dự sự kiện thanh lịch',
    },
    {
      label: lang === 'en' ? '🌸 Lotus Lake Photoshoot' : '🌸 Chụp ảnh sen Hồ Gươm',
      prompt: lang === 'en' ? 'Đi chụp ảnh bên hoa sen hoặc di tích cổ nên mặc áo gì, mang phụ kiện gì?' : 'Đi chụp ảnh bên hoa sen hoặc di tích cổ nên mặc trang phục gì, mang phụ kiện gì phù hợp?',
    },
    {
      label: lang === 'en' ? '🎨 Five Elements Colors' : '🎨 Màu sắc theo Ngũ Hành',
      prompt: lang === 'en' ? 'Quy tắc phối màu sắc ngũ hành truyền thống trong Việt Phục là gì?' : 'Quy tắc phối màu sắc ngũ hành truyền thống trong trang phục cổ phong Việt Nam là gì?',
    },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString(lang === 'en' ? 'en-US' : 'vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await sendChatMessage(chatHistory, lang);

      // Check if message references any specific costume in our database
      const matchedCostume = COSTUMES_DATA.find((c) => {
        const cLower = c.name.toLowerCase();
        const repLower = res.reply.toLowerCase();
        return (
          repLower.includes(cLower) ||
          repLower.includes(c.id.replace(/^[fm]_/, '').replace(/_/g, ' '))
        );
      });

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString(lang === 'en' ? 'en-US' : 'vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        suggestedCostumeId: matchedCostume?.id,
        costumeName: matchedCostume ? getLocalizedCostume(matchedCostume, lang).name : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          lang === 'en'
            ? 'Sorry, I encountered a temporary connection issue. Please try asking again!'
            : 'Rất tiếc đã có gián đoạn kết nối tạm thời. Bạn vui lòng thử lại nhé!',
        timestamp: new Date().toLocaleTimeString(lang === 'en' ? 'en-US' : 'vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: lang === 'en' ? initialWelcomeTextEn : initialWelcomeTextVi,
        timestamp: new Date().toLocaleTimeString(lang === 'en' ? 'en-US' : 'vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* ========================================================= */}
      {/* 1. FLOATING CHAT BUTTON (BOTTOM RIGHT)                    */}
      {/* ========================================================= */}
      <div className="fixed bottom-5 sm:bottom-6 right-5 sm:right-6 z-40 flex items-center gap-3">
        {/* Tooltip / Hint on initial load */}
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="hidden md:flex items-center gap-2 bg-white/95 text-slate-800 text-xs font-semibold px-3 py-2 rounded-2xl shadow-xl border border-[#D97706]/40 cursor-pointer hover:border-[#8B1E1E] transition-all hover:scale-105 animate-fadeIn backdrop-blur-xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{lang === 'en' ? 'Ask AI Stylist' : 'Trợ lý Phối đồ AI'}</span>
          </div>
        )}

        {/* Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={lang === 'en' ? 'Open AI Stylist Chatbot' : 'Mở Trợ lý Phối đồ AI'}
          className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform active:scale-95 cursor-pointer border-2 ${
            isOpen
              ? 'bg-[#8B1E1E] border-amber-300 text-white rotate-90 scale-100'
              : 'bg-gradient-to-tr from-[#631313] via-[#8B1E1E] to-[#A82828] border-amber-400 text-amber-200 hover:scale-110 hover:shadow-[#D97706]/40'
          }`}
        >
          {isOpen ? (
            <i className="fa-solid fa-xmark text-2xl text-white"></i>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <i className="fa-solid fa-comments text-2xl sm:text-2xl text-[#FDE68A]"></i>
              <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#FDE68A] mt-0.5 leading-none">
                AI
              </span>
            </div>
          )}

          {/* Unread badge indicator */}
          {!isOpen && hasUnread && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-white animate-ping" />
          )}
        </button>
      </div>

      {/* ========================================================= */}
      {/* 2. CHAT POP-UP WINDOW                                     */}
      {/* ========================================================= */}
      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-24 right-3 sm:right-6 w-[94vw] sm:w-[420px] max-w-[440px] h-[78vh] sm:h-[600px] max-h-[640px] z-50 flex flex-col rounded-3xl shadow-2xl border-2 border-[#D97706]/50 bg-[#FDFBF7] overflow-hidden animate-scaleUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#631313] via-[#8B1E1E] to-[#7B1B1B] text-white p-4 flex items-center justify-between border-b border-amber-400/40 shadow-sm relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-black/25 border border-amber-300/50 flex items-center justify-center text-amber-300 text-lg shadow-inner flex-shrink-0">
                <i className="fa-solid fa-wand-magic-sparkles animate-pulse"></i>
              </div>
              <div className="min-w-0">
                <h3 className="font-serif text-sm sm:text-base font-bold text-white truncate flex items-center gap-1.5">
                  <span>{lang === 'en' ? 'VietPhuc AI Stylist' : 'Trợ lý Phối đồ AI'}</span>
                  <span className="text-[10px] font-sans px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Online
                  </span>
                </h3>
                <p className="text-[11px] text-amber-200/90 truncate">
                  {lang === 'en'
                    ? 'Heritage Accessories & Style Advisor'
                    : 'Cố vấn phụ kiện & nếp áo di sản'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleClearChat}
                className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-amber-200 flex items-center justify-center text-xs transition-colors cursor-pointer"
                title={lang === 'en' ? 'Clear conversation' : 'Xóa lịch sử trò chuyện'}
              >
                <i className="fa-solid fa-rotate-left"></i>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
                title={lang === 'en' ? 'Close chat' : 'Đóng cửa sổ'}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>

          {/* Messages Thread Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FDFBF7]">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fadeIn`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-gradient-to-r from-[#8B1E1E] to-[#A82828] text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-[#D97706]/25 rounded-tl-xs'
                    }`}
                  >
                    {/* Message Header */}
                    {!isUser && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#8B1E1E] mb-1 uppercase tracking-wider">
                        <i className="fa-solid fa-feather text-[#D97706]"></i>
                        <span>{lang === 'en' ? 'Stylist Advisor' : 'Cố vấn Việt Phục'}</span>
                      </div>
                    )}

                    {/* Formatted Message Body */}
                    <div className="space-y-1.5 whitespace-pre-line">
                      {msg.content.split('\n').map((line, idx) => {
                        const trimmed = line.trim();
                        // Bold markdown parser: **text**
                        const renderFormattedLine = (txt: string) => {
                          const parts = txt.split(/(\*\*[^*]+\*\*)/g);
                          return parts.map((p, i) => {
                            if (p.startsWith('**') && p.endsWith('**')) {
                              return (
                                <strong key={i} className={isUser ? 'font-bold text-white' : 'font-bold text-[#8B1E1E]'}>
                                  {p.slice(2, -2)}
                                </strong>
                              );
                            }
                            return p;
                          });
                        };

                        if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
                          return (
                            <div key={idx} className="flex items-start gap-1.5 pl-1">
                              <span className={isUser ? 'text-amber-200' : 'text-[#D97706]'}>•</span>
                              <span>{renderFormattedLine(trimmed.replace(/^[•-]\s*/, ''))}</span>
                            </div>
                          );
                        }
                        return <p key={idx}>{renderFormattedLine(line)}</p>;
                      })}
                    </div>

                    {/* Interactive Costume Recommendation Card if mentioned */}
                    {msg.suggestedCostumeId && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 bg-[#FAF6EE] p-2 rounded-xl">
                        <span className="text-[11px] font-bold text-[#8B1E1E] truncate">
                          ✨ {msg.costumeName || msg.suggestedCostumeId}
                        </span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {onSelectCostumeForAI && (
                            <button
                              type="button"
                              onClick={() => {
                                const target = COSTUMES_DATA.find((c) => c.id === msg.suggestedCostumeId);
                                if (target) {
                                  onSelectCostumeForAI(target);
                                  setIsOpen(false);
                                }
                              }}
                              className="px-2 py-1 rounded-lg bg-[#8B1E1E] hover:bg-[#631313] text-white text-[10px] font-bold cursor-pointer transition-colors shadow-2xs"
                              title={lang === 'en' ? 'Try this in Virtual Studio' : 'Thử đồ với trang phục này'}
                            >
                              <i className="fa-solid fa-wand-magic-sparkles mr-1"></i>
                              {lang === 'en' ? 'Try-On' : 'Thử đồ'}
                            </button>
                          )}
                          {onViewCostumeDetail && (
                            <button
                              type="button"
                              onClick={() => {
                                const target = COSTUMES_DATA.find((c) => c.id === msg.suggestedCostumeId);
                                if (target) {
                                  onViewCostumeDetail(target);
                                  setIsOpen(false);
                                }
                              }}
                              className="px-2 py-1 rounded-lg border border-[#D97706] text-[#8B1E1E] hover:bg-amber-100 text-[10px] font-bold cursor-pointer transition-colors"
                              title={lang === 'en' ? 'View costume archive' : 'Xem chi tiết di sản'}
                            >
                              {lang === 'en' ? 'Archive' : 'Chi tiết'}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span className="text-[9px] text-slate-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2 animate-fadeIn">
                <div className="bg-white border border-[#D97706]/30 rounded-2xl p-3 shadow-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#8B1E1E] animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-[#D97706] animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-xs text-slate-500 font-serif italic ml-1">
                    {lang === 'en' ? 'Stylist is pondering...' : 'AI đang suy nghĩ lời cố vấn...'}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2 border-t border-slate-200/80 bg-[#FAF7F2] overflow-x-auto">
            <div className="flex items-center gap-1.5 text-[10px] pb-1">
              <span className="font-bold text-slate-500 uppercase tracking-wider flex-shrink-0 text-[9px]">
                {lang === 'en' ? 'Quick Topics:' : 'Chủ đề gợi ý:'}
              </span>
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSendMessage(chip.prompt)}
                  className="px-2.5 py-1 rounded-full bg-white border border-[#D97706]/30 hover:border-[#8B1E1E] hover:bg-amber-50 text-slate-700 hover:text-[#8B1E1E] whitespace-nowrap text-[11px] font-medium transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box Footer */}
          <div className="p-3 border-t border-slate-200 bg-white">
            <div className="flex items-end gap-2 bg-[#FDFBF7] p-1.5 rounded-2xl border border-slate-300 focus-within:border-[#8B1E1E] focus-within:ring-1 focus-within:ring-[#8B1E1E] transition-all">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={
                  lang === 'en'
                    ? 'Ask about accessories, styles, combinations...'
                    : 'Hỏi về phụ kiện, kiểu dáng, cách phối đồ...'
                }
                className="w-full text-xs sm:text-sm bg-transparent resize-none p-2 focus:outline-none text-slate-800 placeholder-slate-400 max-h-24 min-h-[36px]"
              />

              <button
                type="button"
                disabled={!inputMessage.trim() || isLoading}
                onClick={() => handleSendMessage()}
                className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#8B1E1E] to-[#A82828] hover:from-[#631313] hover:to-[#8B1E1E] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all cursor-pointer shadow-xs flex-shrink-0"
                title={lang === 'en' ? 'Send message' : 'Gửi câu hỏi'}
              >
                <i className={`fa-solid ${isLoading ? 'fa-spinner fa-spin' : 'fa-paper-plane'} text-xs`}></i>
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 px-1">
              <span>{lang === 'en' ? 'Press Enter to send' : 'Nhấn Enter để gửi'}</span>
              <span className="flex items-center gap-1">
                <i className="fa-solid fa-sparkles text-amber-500 text-[9px]"></i>
                <span>Gemini 3.5 Flash</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
