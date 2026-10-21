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

  try {
    // 1. Lấy trực tiếp danh sách tất cả model từ API Key của bạn
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listRes.json();

    // Lọc các model hỗ trợ generateContent và LOẠI BỎ hoàn toàn 2.5-flash / 1.5-flash đã ngừng hỗ trợ
    const availableModels = (listData.models || [])
      .filter(m => 
        m.supportedGenerationMethods?.includes('generateContent') &&
        !m.name.includes('2.5-flash') &&
        !m.name.includes('1.5-') &&
        !m.name.includes('vision') &&
        !m.name.includes('embedding')
      )
      .map(m => m.name);

    // Ưu tiên các model Gemini 3 mới nhất lên đầu
    const candidateModels = [
      'models/gemini-3-flash-preview',
      'models/gemini-3.0-flash',
      'models/gemini-3.8-flash',
      ...availableModels
    ];

    // Lọc trùng lặp
    const uniqueModels = [...new Set(candidateModels)];
    console.log("Danh sách model sẽ thử:", uniqueModels.slice(0, 6));

    // 2. Thử lần lượt từng model cho đến khi thành công 100%
    for (const modelName of uniqueModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          console.log(`THÀNH CÔNG VỚI MODEL ${modelName}:`, reply);
          return reply.trim();
        }
      } else {
        console.warn(`Model ${modelName} từ chối (${data?.error?.code}): ${data?.error?.message}`);
      }
    }

    return "Tiến Phát đã nhận được thông tin. Xưởng sẽ liên hệ tư vấn chi tiết cho bạn ngay ạ!";
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
