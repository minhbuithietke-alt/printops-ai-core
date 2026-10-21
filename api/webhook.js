export default async function handler(req, res) {
  // 1. Xác thực Webhook với Facebook (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      console.log('Webhook verified successfully!');
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  // 2. Xử lý tin nhắn đến từ khách hàng (POST)
  if (req.method === 'POST') {
    const body = req.body;
    console.log('Dữ liệu nhận từ Facebook:', JSON.stringify(body));

    if (body.object === 'page') {
      for (const entry of body.entry || []) {
        const webhookEvent = entry.messaging ? entry.messaging[0] : null;

        if (webhookEvent && webhookEvent.message && !webhookEvent.message.is_echo) {
          const senderPsid = webhookEvent.sender.id;
          const userMessage = webhookEvent.message.text || '';
          console.log(`Nhận tin từ ${senderPsid}: ${userMessage}`);

          // Gửi phản hồi lại Messenger
          await sendReply(senderPsid, `Tiến Phát đã nhận được tin nhắn: "${userMessage}". Chúng tôi sẽ tư vấn quy cách ngay!`);
        }
      }
      return res.status(200).send('EVENT_RECEIVED');
    }
    return res.status(404).send('Not Found');
  }

  return res.status(405).send('Method Not Allowed');
}

async function sendReply(recipientId, messageText) {
  const pageToken = (process.env.FB_PAGE_ACCESS_TOKEN || '').trim();
  const url = `https://graph.facebook.com/v21.0/me/messages?access_token=${encodeURIComponent(pageToken)}`;

  const payload = {
    recipient: { id: recipientId },
    message: { text: messageText }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const resData = await response.json();
    console.log('Kết quả từ Facebook Send API:', JSON.stringify(resData));
  } catch (error) {
    console.error('Lỗi khi gọi API Facebook:', error);
  }
}
