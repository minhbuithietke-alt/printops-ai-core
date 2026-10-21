export default async function handler(req, res) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  if (req.method === 'POST') {
    const body = req.body;

    if (body.object === 'page') {
      for (const entry of body.entry || []) {
        const webhookEvent = entry.messaging ? entry.messaging[0] : null;

        if (webhookEvent && webhookEvent.message && !webhookEvent.message.is_echo) {
          const senderPsid = webhookEvent.sender.id;
          const userMessage = webhookEvent.message.text || '';
          console.log(`Khách hỏi (${senderPsid}): ${userMessage}`);

          // 1. Gọi Gemini AI sinh câu trả lời tư vấn bao bì
          const aiReply = await getGeminiResponse(userMessage);

          // 2. Gửi câu trả lời của AI ngược về Messenger
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
    return "Cảm ơn bạn đã nhắn tin cho Tiến Phát In Túi Giấy & Hộp Giấy Gia Lai. Xưởng đang hoàn tất kết nối hệ thống tự động!";
  }

  const systemPrompt = `Bạn là trợ lý tư vấn chuyên nghiệp của xưởng in 'Tiến Phát In Túi Giấy & Hộp Giấy Gia Lai'. 
Nhiệm vụ: Tư vấn quy cách sản xuất bao bì (giấy Ivory 250-400gsm, Kraft, Duplex, carton sóng E/B/3 lớp/5 lớp), gợi ý kích thước (Dài x Rộng x Cao cm) và dặn dò khách để lại số lượng / kích thước để xưởng báo giá chính xác nhất. 
Phong cách: Thân thiện, ngắn gọn (dưới 4 câu), đúng thuật ngữ ngành in ấn.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nKhách hỏi: "${userText}"\nTrả lời:` }]
          }
        ]
      })
    });

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return reply || "Tiến Phát đã nhận được thông tin. Xưởng sẽ liên hệ tư vấn chi tiết cho bạn ngay ạ!";
  } catch (err) {
    console.error("Lỗi gọi Gemini:", err);
    return "Tiến Phát đã ghi nhận yêu cầu và sẽ hỗ trợ quy cách chi tiết cho bạn ngay ạ!";
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
