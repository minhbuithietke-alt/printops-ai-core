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

  const systemInstruction = `Bạn là chuyên viên kỹ thuật tư vấn và báo giá của xưởng in 'Tiến Phát In Túi Giấy & Hộp Giấy Gia Lai'.
Bạn PHẢI tư vấn chính xác theo tiêu chuẩn kỹ thuật thực tế của xưởng Tiến Phát dưới đây:

1. HỘP CAO CẤP (Hộp trà cao cấp, hộp yến sào, hộp quà Tết, hộp rượu, hộp trang sức):
   - Chất liệu bắt buộc: Hộp cứng làm từ bìa Carton lạnh định lượng 1200gsm (dày ~2mm, cứng cáp, vuông thành sắc cạnh), bên ngoài bồi giấy Couche 140gsm (C140) hoặc giấy Mỹ thuật.
   - Gia công bề mặt: In offset sắc nét, cán màng mờ/bóng, hoàn toàn có thể ép kim (nhũ vàng/bạc), thúc nổi logo, phủ UV định hình và làm khay định hình bên trong.

2. HỘP MỀM THÔNG DỤNG (Hộp mỹ phẩm, son môi, kem body, dược phẩm, bánh kẹo, cà phê):
   - Chất liệu: Giấy Ivory 300gsm - 350gsm (trắng mịn 2 mặt, cứng cáp) hoặc giấy Kraft 250gsm - 300gsm (phong cách mộc/vintage).
   - Gia công: Cán màng mờ hoặc bóng, bế dán thành phẩm, có thể ép kim hoặc cán vân.

3. HỘP SHIP COD / HỘP ĐÓNG HÀNG / HỘP GIÀY / NÔNG SẢN:
   - Chất liệu: Carton sóng E hoặc sóng B (3 lớp), bồi giấy Duplex 250gsm hoặc giấy Kraft.

4. TÚI GIẤY (Túi shop thời trang, túi quà tặng, túi mỹ phẩm, túi đựng hộp trà/yến):
   - Chất liệu: Giấy Ivory 250gsm - 300gsm, giấy Couche 250gsm - 300gsm, hoặc giấy Kraft trắng/nâu 170gsm - 250gsm.
   - Gia công: Cán màng, đóng mắt cáo, xỏ dây dù / dây ruy băng / dây xoắn giấy.

NGUYÊN TẮC TRẢ LỜI:
- Đi thẳng vào quy cách kỹ thuật chuẩn của xưởng tương ứng với sản phẩm khách hỏi (ví dụ khách hỏi hộp trà cao cấp là phải nói ngay dùng carton lạnh 1200gsm bồi giấy C140, có nhận ép kim/thúc nổi).
- Luôn hỏi khách 2 thông tin cuối câu: Kích thước mong muốn (Dài x Rộng x Cao cm) và Số lượng dự kiến in để Tiến Phát tính giá tốt nhất tại xưởng.
- Văn phong lịch sự, chuyên nghiệp, ngắn gọn (3-4 câu), xưng "Tiến Phát" hoặc "xưởng em" và gọi khách là "anh/chị" hoặc "bạn".`;

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
