export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedCostumeId?: string;
  costumeName?: string;
}

export interface ChatResponse {
  success: boolean;
  reply: string;
  modelUsed?: string;
  error?: string;
}

/**
 * Sends conversation thread to server-side Gemini chat endpoint.
 */
export async function sendChatMessage(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  lang: 'vi' | 'en' = 'vi'
): Promise<ChatResponse> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          content: m.content,
        })),
        lang,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.reply) {
        return {
          success: true,
          reply: data.reply,
          modelUsed: data.modelUsed,
        };
      }
    }

    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error || 'Failed to reach AI stylist');
  } catch (err: any) {
    console.warn('Chat service network error, fallback triggered:', err);
    // Client-side intelligent fallback response if backend fetch fails
    return {
      success: true,
      reply: getClientFallbackReply(messages[messages.length - 1]?.content || '', lang),
      modelUsed: 'heritage-offline-advisor',
    };
  }
}

function getClientFallbackReply(query: string, lang: 'vi' | 'en'): string {
  const q = query.toLowerCase();
  const isEn = lang === 'en';

  if (q.includes('cưới') || q.includes('hôn lễ') || q.includes('wedding')) {
    return isEn
      ? `👑 **Traditional Wedding Styling Recommendation**:
- **Attire**: For brides, **Áo Nhật Bình** (vermilion red or golden yellow) or **Áo Tấc** with auspicious embroidered dragons/phoenixes brings imperial elegance. For grooms, choose **Áo Tấc** or **Áo Ngũ Thân** in navy blue or deep red with a silk turban.
- **Accessories**: Pair with a carved silver collar necklace (kiềng bạc chạm hoa sen), multi-layered silver waist chain (xà tích), and an embroidered velvet pair of slippers (hài nhung).
- **Hair & Headwear**: An emerald or red pleated turban (khăn vành dây) or gold-lacquered hairpin.`
      : `👑 **Gợi ý phối đồ cho Ngày Cưới & Dạm Ngõ**:
- **Trang phục**: Với cô dâu, tuyệt vời nhất là **Áo Nhật Bình** (sắc đỏ chu sa hoặc vàng hoàng yến) thêu ngũ sắc hoặc **Áo Tấc** tay thụng quý phái. Chú rể diện **Áo Tấc** hoặc **Áo Ngũ Thân** màu xanh lam/tím than phối khăn xếp lụa cùng màu.
- **Phụ kiện**: Đeo **kiềng bạc chạm hoa sen**, chùm **xà tích bạc** bên hông, tay cầm **quạt lụa thêu hoa**, chân mang **hài nhung thêu phụng**.
- **Đầu tóc**: Đội **khăn vành dây** (màu xanh ngọc hoặc đỏ) hoặc tóc vấn trâm ngọc cổ điển.`;
  }

  if (q.includes('phụ kiện') || q.includes('accessory') || q.includes('kiềng') || q.includes('nón') || q.includes('trâm')) {
    return isEn
      ? `✨ **Essential Heritage Accessories Guide**:
1. **Kiềng bạc (Silver Collar)**: Perfect for Áo Dài, Áo Ngũ Thân, and Áo Yếm, adding refined Northern nobility.
2. **Xà tích bạc (Silver Waist Chain)**: Hooked at the right waist sash, typical of Mường women and Nguyen court ladies.
3. **Nón Quai Thao (Wide Palm Hat)**: Graceful for Áo Tứ Thân, folk festivals, and Quan Họ folk-singing attire.
4. **Trâm cài tóc (Hairpins)**: Silver/jade hairpins held in coiled hair (tóc vấn trần) provide timeless poise.
5. **Khăn rằn (Checkered Scarf)**: Iconic pairing with **Áo Bà Ba** for Southern pastoral harmony.`
      : `✨ **Cẩm nang Phụ kiện Việt Phục Truyền thống**:
1. **Kiềng bạc chạm khắc**: Hợp nhất với Áo Dài, Áo Ngũ Thân và Áo Yếm, tôn vinh chiếc cổ thanh tao của phụ nữ Việt.
2. **Xà tích bạc**: Chùm dây bạc đeo trễ bên hông phải, đặc trưng quý phái thời Nguyễn và trang phục phụ nữ Mường.
3. **Nón quai thao (nón ba tầm)**: Có quai thao lụa đào buông dài, phối cùng Áo Tứ Thân hoặc dạo hội xuân Kinh Bắc.
4. **Trâm bạc & trâm ngọc**: Cài vào búi tóc vấn, tạo nét đoan trang cổ điển.
5. **Khăn rằn Nam Bộ**: Phối cùng **Áo Bà Ba**, nón lá mộc mạc và guốc mộc quai nhung.`;
  }

  return isEn
    ? `🌸 **VietPhuc AI Heritage Stylist Advice**:
Vietnamese traditional clothing balances dignity, modesty, and five-element color harmony.
- **Formal Celebrations**: Choose **Áo Nhật Bình** or **Áo Tấc** with wide flowing sleeves and embroidered motifs.
- **Casual & Cultural Walks**: Choose **Áo Ngũ Thân tay chẽn** or **Áo Dài tơ tằm** with a silk hand fan or palm hat.
- **Ethnic Highland Styles**: Explore **Áo Cóm Thái** with silver butterfly buttons or vibrant **H'Mông pleated skirts**.

Feel free to ask me for specific combinations, colors, or accessory recommendations!`
    : `🌸 **Lời khuyên từ Trợ lý Phối đồ Việt Phục AI**:
Nghệ thuật mặc Việt Phục luôn đề cao sự đoan trang, ngũ hành hòa hợp và tôn vinh nếp áo tự nhiên.
- **Nghi lễ trang trọng**: Nên diện **Áo Nhật Bình** hoặc **Áo Tấc** tay thụng với nếp gấp tơ tằm sang trọng.
- **Dạo phố, chụp ảnh du xuân**: Chọn **Áo Ngũ Thân tay chẽn** hoặc **Áo Dài Hà Thành** phối cùng quạt lụa và hài thêu.
- **Sắc màu Tây Bắc & Cao nguyên**: Có thể chọn **Áo Cóm Thái** khuy bướm bạc hoặc váy lanh dập ly sáp ong **H'Mông**.

Bạn muốn được tư vấn cụ thể cho dịp lễ hội nào hoặc muốn phối phụ kiện cho bộ trang phục nào cứ nhắn mình nhé!`;
}
