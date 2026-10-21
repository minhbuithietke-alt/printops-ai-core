export default async function handler(req, res) {
  // 1. Xác thực Webhook với Facebook (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  // 2. Xử lý tin nhắn từ khách hàng (POST)
  if (req.method === 'POST') {
    const body = req.body;

    if (body.object === 'page') {
      for (const entry of body.entry || []) {
        const webhookEvent = entry.messaging ? entry.messaging[0] : null;

        if (webhookEvent && webhookEvent.message && !webhookEvent.message.is_echo) {
          const senderPsid = webhookEvent.sender.id;
          const userMessage = webhookEvent.message.text || '';
          console.log(`Khách hỏi (${senderPsid}): ${userMessage}`);

          const aiReply = await getGeminiResponse(userMessage);
          await sendReply(senderPsid, aiReply);
        }
      }
      return res.status(200).send('EVENT_RECEIVED');
    }
    return res.status(404).send('Not Found');
  }

  return res.status(405).send('Method Not Allowed');
}

async function getGeminiResponse(userText) {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    console.error("LỖI: Chưa cấu hình GEMINI_API_KEY");
    return "Cảm ơn bạn đã nhắn tin cho Tiến Phát In Túi Giấy & Hộp Giấy Gia Lai. Xưởng sẽ liên hệ tư vấn chi tiết ngay!";
  }

  const systemInstruction = `Bạn là trợ lý tư vấn kỹ thuật của xưởng in 'Tiến Phát In Túi Giấy & Hộp Giấy Gia Lai'.
Nhiệm vụ: Tư vấn quy cách sản xuất bao bì (giấy Ivory 250-400gsm, Kraft, Duplex, carton sóng E/B, hộp cứng), gợi ý kích thước (Dài x Rộng x Cao cm) và dặn khách để lại số lượng / kích thước để xưởng báo giá chính xác.
Phong cách: Thân thiện, ngắn gọn (2-4 câu), đúng thuật ngữ ngành in bao bì.`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemInstruction}\n\nKhách hàng hỏi: "${userText}"\nTrả lời:` }]
      }
    ]
  };

  // Gọi trực tiếp model gemini-3.0-flash theo đúng yêu cầu từ hệ thống Google
  let modelName = 'models/gemini-3.0-flash';
  let url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;

  try {
    let response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    let data = await response.json();

    // Nếu tên model bị báo 404, tự động truy vấn danh sách model hợp lệ của API Key này và gọi lại ngay lập tức
    if (!response.ok && data?.error?.code === 404) {
      console.log("Đang tự động lấy tên model khả dụng từ Google...");
      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const listData = await listRes.json();
      
      const validModel = (listData.models || []).find(m => 
        m.supportedGenerationMethods?.includes('generateContent') && 
        (m.name.includes('flash') || m.name.includes('gemini'))
      );

      if (validModel) {
        console.log("Đã tìm thấy model chuẩn:", validModel.name);
        url = `https://generativelanguage.googleapis.com/v1beta/${validModel.name}:generateContent?key=${apiKey}`;
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        data = await response.json();
      }
    }

    if (!response.ok) {
      console.error("LỖI TỪ GOOGLE GEMINI:", JSON.stringify(data));
      return "Tiến Phát đã nhận được thông tin. Xưởng sẽ liên hệ tư vấn chi tiết cho bạn ngay ạ!";
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("TRẢ LỜI THÀNH CÔNG:", reply);
    return reply ? reply.trim() : "Tiến Phát đã nhận được thông tin. Xưởng sẽ liên hệ tư vấn chi tiết cho bạn ngay ạ!";
  } catch (err) {
    console.error("LỖI FETCH GEMINI:", err);
    return "Tiến Phát đã nhận được thông tin. Xưởng sẽ liên hệ tư vấn chi tiết cho bạn ngay ạ!";
  }
}

async function sendReply(recipientId, messageText) {
  const pageToken = (process.env.FB_PAGE_ACCESS_TOKEN || '').trim();
  const url = `https://graph.facebook.com/v21.0/me/messages?access_token=${encodeURIComponent(pageToken)}`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: messageText }
      })
    });
  } catch (error) {
    console.error('Lỗi khi gửi tin Facebook:', error);
  }
}
