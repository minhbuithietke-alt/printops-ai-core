async function getGeminiResponse(userText) {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    console.error("LỖI: Chưa tìm thấy GEMINI_API_KEY trên Vercel");
    return "Cảm ơn bạn đã nhắn tin cho Tiến Phát In Túi Giấy & Hộp Giấy Gia Lai. Xưởng sẽ liên hệ tư vấn chi tiết ngay!";
  }

  const systemInstruction = `Bạn là trợ lý tư vấn kỹ thuật của xưởng in 'Tiến Phát In Túi Giấy & Hộp Giấy Gia Lai'.
Nhiệm vụ: Tư vấn quy cách sản xuất bao bì (giấy Ivory 250-400gsm, Kraft, Duplex, carton sóng E/B), gợi ý kích thước (Dài x Rộng x Cao cm) và dặn khách để lại số lượng / kích thước để xưởng báo giá chính xác.
Phong cách: Thân thiện, ngắn gọn (2-4 câu), đúng thuật ngữ ngành in bao bì.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\nKhách hàng hỏi: "${userText}"\nTrả lời:` }]
          }
        ]
      })
    });

    const data = await response.json();
    console.log("DỮ LIỆU GEMINI TRẢ VỀ:", JSON.stringify(data));

    if (!response.ok) {
      console.error("LỖI TỪ GOOGLE GEMINI:", data);
      return "Tiến Phát đã nhận được thông tin. Xưởng sẽ liên hệ tư vấn chi tiết cho bạn ngay ạ!";
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return reply ? reply.trim() : "Tiến Phát đã nhận được thông tin. Xưởng sẽ liên hệ tư vấn chi tiết cho bạn ngay ạ!";
  } catch (err) {
    console.error("LỖI FETCH GEMINI:", err);
    return "Tiến Phát đã nhận được thông tin. Xưởng sẽ liên hệ tư vấn chi tiết cho bạn ngay ạ!";
  }
}
