export default async function handler(req, res) {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "PRINTOPS_VERIFY_SECRET";
  const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;

  // 1. Xác thực Webhook với Facebook
  if (req.method === 'GET') {
    const host = req.headers ? req.headers.host : 'localhost';
    const url = new URL(req.url, `https://${host}`);
    const mode = url.searchParams.get('hub.mode') || (req.query && req.query['hub.mode']);
    const token = url.searchParams.get('hub.verify_token') || (req.query && req.query['hub.verify_token']);
    const challenge = url.searchParams.get('hub.challenge') || (req.query && req.query['hub.challenge']);

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      return res.end(challenge || '');
    }
    res.statusCode = 403;
    return res.end('Forbidden');
  }

  // 2. Tiếp nhận và xử lý tin nhắn từ khách hàng (POST)
  if (req.method === 'POST') {
    const body = req.body;

    if (body && body.object === 'page') {
      // Phản hồi ngay 200 OK cho Facebook để tránh bị timeout
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('EVENT_RECEIVED');

      // Duyệt qua các tin nhắn gửi đến
      for (const entry of body.entry || []) {
        const webhookEvent = entry.messaging && entry.messaging[0];
        if (webhookEvent && webhookEvent.message && !webhookEvent.message.is_echo) {
          const senderPsid = webhookEvent.sender.id;
          const userMessage = webhookEvent.message.text;

          if (userMessage) {
            await handleCustomerMessage(senderPsid, userMessage, PAGE_ACCESS_TOKEN);
          }
        }
      }
      return;
    }
    res.statusCode = 404;
    return res.end('Not Found');
  }

  res.statusCode = 405;
  return res.end('Method Not Allowed');
}

// Hàm gửi tin nhắn phản hồi qua Facebook Send API
async function callSendAPI(senderPsid, responseText, pageAccessToken) {
  const requestBody = {
    recipient: { id: senderPsid },
    message: { text: responseText }
  };

  try {
    await fetch(`https://graph.facebook.com/v21.0/me/messages?access_token=${pageAccessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
  } catch (error) {
    console.error('Lỗi gửi tin nhắn Facebook:', error);
  }
}

// Logic phản hồi tư vấn in ấn bao bì
async function handleCustomerMessage(senderPsid, messageText, pageAccessToken) {
  let reply = "Dạ chào bạn, PrintOps đã nhận được yêu cầu về bao bì in ấn. Chuyên viên kỹ thuật sẽ tư vấn quy cách và báo giá ngay cho bạn!";

  const lower = messageText.toLowerCase();
  if (lower.includes("ivory") || lower.includes("kraft") || lower.includes("duplex")) {
    reply = "Dạ với chất liệu giấy này, bên xưởng hỗ trợ định lượng từ 250gsm - 400gsm kèm cán màng bóng/mờ hoặc ép kim theo yêu cầu. Bạn cần làm kích thước và số lượng bao nhiêu hộp ạ?";
  } else if (lower.includes("carton") || lower.includes("sóng")) {
    reply = "Dạ xưởng sản xuất trực tiếp thùng/hộp carton sóng E, B, sóng 3 lớp và 5 lớp bồi giấy Duplex in Offset sắc nét. Bạn cho xưởng xin kích thước dài x rộng x cao nhé!";
  } else if (lower.includes("báo giá") || lower.includes("giá")) {
    reply = "Dạ để có báo giá xuất xưởng tốt nhất, bạn vui lòng để lại quy cách: Số lượng, Kích thước (Dài x Rộng x Cao) và Số điện thoại nhé!";
  }

  await callSendAPI(senderPsid, reply, pageAccessToken);
}
