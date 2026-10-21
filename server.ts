/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// 1. Cấu hình các biến môi trường
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN || '';
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'PRINTOPS_VERIFY_SECRET';
const PORT = Number(process.env.PORT) || 3000;

// In-memory buffer for real-time frontend inspection
interface StoredWebhookEvent {
  id: string;
  timestamp: string;
  type: 'message' | 'comment' | 'post' | 'leadgen';
  senderName: string;
  senderId: string;
  summary: string;
  handledByEngine: string;
  rawPayload: any;
}

const webhookEventsLog: StoredWebhookEvent[] = [
  {
    id: 'evt_init_1',
    timestamp: '09:24',
    type: 'comment',
    senderName: 'Hoàng Yến Mỹ Phẩm',
    senderId: 'fb_user_891',
    summary: 'Báo giá gấp 2000 hộp kem body 8x8x12cm, Ivory 350 ép kim, SĐT: 0979888999',
    handledByEngine: 'Engine 2: Tín hiệu HOT LEAD bóc tách SĐT & kích thước',
    rawPayload: { field: 'feed', item: 'comment' },
  },
  {
    id: 'evt_init_2',
    timestamp: '08:50',
    type: 'message',
    senderName: 'Vựa Trái Cây Tiến Đạt',
    senderId: 'fb_user_552',
    summary: 'Cần 5000 thùng carton đựng bơ booth sóng 5 lớp giao Gia Lai',
    handledByEngine: 'Engine 1: Auto Chatbot Báo Giá Kỹ Thuật',
    rawPayload: { field: 'messages', text: '5000 thùng carton...' },
  },
];

// 2. Khởi tạo Gemini AI Core với System Instructions chuyên ngành in ấn bao bì
const PACKAGING_SYSTEM_INSTRUCTION = `Bạn là trợ lý ảo của PrintOps AI Core chuyên ngành In ấn và Bao bì.
Nhiệm vụ: Tư vấn chất liệu (Ivory 300-350gsm mỹ phẩm, Duplex tiết kiệm, Kraft Nhật eco-friendly, Thùng Carton sóng E/B/AB 3-5-7 lớp xuất khẩu, Decal nhựa sữa PVC chống nước), xin kích thước (Dài x Rộng x Cao cm/mm), số lượng đặt in (nhấn mạnh in càng nhiều đơn giá càng rẻ theo quy luật in offset), tình trạng file in và số điện thoại/Zalo của khách để bộ phận xưởng xuất báo giá chi tiết.`;

let aiClient: GoogleGenAI | null = null;
if (GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  } catch (err) {
    console.warn('Cảnh báo khởi tạo Gemini SDK:', err);
  }
}

/**
 * Trả lời thông minh với Gemini API (hoặc bộ quy tắc fallback kỹ thuật nếu chưa cài key)
 */
async function generatePackagingConsultationReply(userText: string): Promise<string> {
  if (aiClient && GEMINI_API_KEY && GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    try {
      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API timeout')), 3000)
      );

      const apiCall = aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userText,
        config: {
          systemInstruction: PACKAGING_SYSTEM_INSTRUCTION,
        },
      });

      const response = await Promise.race([apiCall, timeoutPromise]) as any;

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn('Lỗi gọi Gemini API (hoặc timeout), chuyển sang engine quy tắc:', err.message);
    }
  }

  // Fallback domain response logic
  const lower = userText.toLowerCase();
  if (lower.includes('hộp') || lower.includes('mỹ phẩm') || lower.includes('ivory')) {
    return 'Dạ chào anh/chị! Đối với hộp mỹ phẩm, xưởng PrintOps đề xuất dùng giấy Ivory 300–350gsm cán màng mờ ép kim logo để đạt độ đanh và sang trọng cao nhất. Anh/chị cho em xin kích thước (Dài x Rộng x Cao) và số lượng dự kiến để em tối ưu khổ kẽm CTP và báo giá xưởng nhé!';
  } else if (lower.includes('thùng') || lower.includes('carton') || lower.includes('sầu riêng')) {
    return 'Dạ chào anh/chị! Với hàng nông sản & sầu riêng xuất khẩu, bên em chuyên sản xuất Thùng Carton Sóng AB 5 lớp chống hút ẩm container 90%, chịu nén BCT > 700kgf bế lỗ thông khí chuẩn. Anh/chị cho em xin số lượng thùng và số điện thoại/Zalo để kỹ thuật gửi mẫu test nhé!';
  } else if (lower.includes('túi') || lower.includes('kraft')) {
    return 'Dạ túi giấy Kraft Nâu 160–180gsm quai dù xỏ mắt cáo là giải pháp eco-friendly vừa bền vừa tiết kiệm. Anh/chị cần đựng sản phẩm gì và kích thước túi khoảng bao nhiêu ạ?';
  } else if (lower.includes('decal') || lower.includes('tem') || lower.includes('nhãn')) {
    return 'Dạ bên em có Decal nhựa sữa PVC chống nước 100%, bế demi bóc dán siêu mượt. Anh/chị cần in tem kích thước bao nhiêu mm và số lượng tem ạ?';
  }

  return 'Dạ chào anh/chị! Em là Tư vấn viên Kỹ thuật In ấn PrintOps. Em có thể hỗ trợ anh/chị báo giá xưởng tận gốc cho Hộp giấy, Thùng carton sóng, Túi giấy và Tem decal. Anh/chị cho em xin quy cách sản phẩm hoặc số điện thoại Zalo để gửi bảng giá chi tiết nhé!';
}

// 3. Endpoint xác thực Webhook với Facebook (Hỗ trợ cả /webhook và /api/webhook/facebook)
const handleWebhookVerification = (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✓ Webhook verified thành công với Facebook Graph API!');
    res.status(200).send(challenge);
  } else {
    console.warn('✕ Xác thực Webhook thất bại: Token không khớp.');
    res.sendStatus(403);
  }
};

app.get('/webhook', handleWebhookVerification);
app.get('/api/webhook/facebook', handleWebhookVerification);

// 4. Endpoint nhận tin nhắn & comment từ Facebook
const handleWebhookEvents = async (req: Request, res: Response) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      // 4.1 Xử lý tin nhắn trực tiếp qua Messenger
      if (entry.messaging && entry.messaging[0]) {
        const webhookEvent = entry.messaging[0];
        const senderPsid = webhookEvent.sender ? webhookEvent.sender.id : 'unknown';

        if (webhookEvent.message && webhookEvent.message.text) {
          const userText = webhookEvent.message.text;
          console.log(`[Facebook Webhook] Nhận tin nhắn từ ${senderPsid}: "${userText}"`);

          try {
            // Gửi text sang Gemini xử lý
            const aiReply = await generatePackagingConsultationReply(userText);

            // Gửi phản hồi ngược lại cho khách hàng qua Facebook Graph API
            if (FB_PAGE_ACCESS_TOKEN && FB_PAGE_ACCESS_TOKEN !== 'MY_FB_PAGE_ACCESS_TOKEN') {
              try {
                await axios.post(
                  `https://graph.facebook.com/v20.0/me/messages?access_token=${FB_PAGE_ACCESS_TOKEN}`,
                  {
                    recipient: { id: senderPsid },
                    message: { text: aiReply },
                  },
                  { timeout: 3000 }
                );
                console.log(`✓ Đã gửi tin nhắn phản hồi Graph API tới ${senderPsid}`);
              } catch (axErr: any) {
                console.warn('Lưu ý gửi Graph API:', axErr.message);
              }
            }

            // Ghi vào nhật ký bộ nhớ để giao diện theo dõi
            webhookEventsLog.unshift({
              id: 'evt_' + Date.now(),
              timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
              type: 'message',
              senderName: `Khách Messenger (${senderPsid.substring(0, 6)}...)`,
              senderId: senderPsid,
              summary: userText,
              handledByEngine: 'Engine 1: Auto Chatbot Báo Giá Kỹ Thuật (Gemini AI)',
              rawPayload: webhookEvent,
            });
          } catch (error: any) {
            console.error('Lỗi khi xử lý tin nhắn:', error.message);
          }
        }
      }

      // 4.2 Xử lý comment / tương tác bài viết (Feed changes)
      if (entry.changes && entry.changes[0]) {
        const change = entry.changes[0];
        if (change.field === 'feed' && change.value) {
          const item = change.value.item;
          const message = change.value.message || '';
          const senderName = change.value.from ? change.value.from.name : 'Khách Facebook';
          const senderId = change.value.from ? change.value.from.id : 'unknown';

          console.log(`[Facebook Webhook] Nhận comment feed từ ${senderName}: "${message}"`);

          webhookEventsLog.unshift({
            id: 'evt_' + Date.now(),
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            type: 'comment',
            senderName,
            senderId,
            summary: message,
            handledByEngine: 'Engine 2: Tín hiệu Quét Lead & Phân tích HOT/WARM/COLD',
            rawPayload: change,
          });
        }
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
};

app.post('/webhook', handleWebhookEvents);
app.post('/api/webhook/facebook', handleWebhookEvents);

// 5. API endpoint cho frontend lấy danh sách sự kiện webhook
app.get('/api/webhook/events', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    events: webhookEventsLog.slice(0, 20),
  });
});

// 6. API endpoint cho nút "Bắn Test Webhook" trên giao diện
app.post('/api/webhook/test', async (req: Request, res: Response) => {
  const { senderName, text, type } = req.body;
  const simulatedText = text || 'Xưởng ơi báo giá gấp 2000 hộp Ivory 350 size 10x15x5cm, alo mình 0989123456';
  const simulatedName = senderName || 'Khách Hàng Facebook Test';

  const aiReply = await generatePackagingConsultationReply(simulatedText);

  const newEvent: StoredWebhookEvent = {
    id: 'evt_sim_' + Date.now(),
    timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    type: type || 'comment',
    senderName: simulatedName,
    senderId: 'sim_user_' + Math.floor(1000 + Math.random() * 9000),
    summary: simulatedText,
    handledByEngine: simulatedText.includes('09') || simulatedText.includes('gấp')
      ? 'Engine 2: Tín hiệu HOT LEAD bóc tách SĐT & Kích thước'
      : 'Engine 1: Auto Chatbot Báo Giá Kỹ Thuật (Gemini AI)',
    rawPayload: { simulated: true, userText: simulatedText, aiReply },
  };

  webhookEventsLog.unshift(newEvent);

  res.json({
    status: 'success',
    event: newEvent,
    aiReply,
  });
});

// 7. Health status endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    system: 'PrintOps AI Core Server',
    version: '2.6',
    geminiConfigured: Boolean(GEMINI_API_KEY && GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    facebookTokenConfigured: Boolean(FB_PAGE_ACCESS_TOKEN && FB_PAGE_ACCESS_TOKEN !== 'MY_FB_PAGE_ACCESS_TOKEN'),
    port: PORT,
  });
});

// 8. Tích hợp Vite middleware phục vụ giao diện React SPA
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PrintOps Server đang chạy tại cổng ${PORT}`);
    console.log(`Webhook endpoint sẵn sàng tại: /webhook và /api/webhook/facebook`);
  });
}

startServer().catch((err) => {
  console.error('Lỗi khởi động PrintOps Server:', err);
});
