/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Calculator, 
  FileText, 
  CheckCircle2, 
  Copy, 
  ArrowRight, 
  Sparkles, 
  Sliders,
  DollarSign,
  Info,
  Clock,
  Layers,
  Check
} from 'lucide-react';
import { 
  ChatMessage, 
  QuoteCalculationInput, 
  ProductType, 
  PaperMaterial, 
  PrintTechnology, 
  SaveLeadActionPayload,
  LeadData,
  ProductionOrder
} from '../types/printOps';
import { calculatePackagingQuote } from '../utils/pricingEngine';
import { PackagingSchematic } from './PackagingSchematic';

interface Engine1ChatbotProps {
  onSaveLead: (lead: LeadData) => void;
  onSendToProduction: (order: ProductionOrder) => void;
}

export const Engine1Chatbot: React.FC<Engine1ChatbotProps> = ({
  onSaveLead,
  onSendToProduction,
}) => {
  // Configurable Quote Inputs
  const [quoteInput, setQuoteInput] = useState<QuoteCalculationInput>({
    productType: 'hop_giay',
    dimensions: { lengthMm: 120, widthMm: 60, heightMm: 160 },
    material: 'ivory_300',
    printTech: 'offset',
    quantity: 2000,
    finishing: {
      lamination: 'matte',
      hotFoilStamp: true,
      spotUV: false,
      embossing: false,
      debossing: false,
      dieCutMould: true,
      windowFilm: false,
      autoGluing: true,
    },
    hasDesignFile: true,
    urgentDelivery: false,
  });

  const [customerLead, setCustomerLead] = useState({
    name: 'Anh Trần Hùng (Mỹ Phẩm HERA)',
    phone: '0909123456',
    address: 'Quận 7, TP. HCM',
  });

  const [copiedPayload, setCopiedPayload] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initial chat history simulating professional print packaging sales consultant
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: 'Chào anh/chị! Em là Tư vấn viên Kỹ thuật In ấn & Bao bì PrintOps. Em có thể hỗ trợ anh/chị tính toán chi phí, tối ưu khổ kẽm và báo giá xưởng tận gốc cho các dòng: Hộp giấy mỹ phẩm/dược phẩm, Thùng carton sóng xuất khẩu, Túi giấy Kraft và Decal tem nhãn chống nước.\n\nAnh/chị đang cần triển khai bao bì cho sản phẩm gì ạ?',
      timestamp: '09:00',
      quickReplies: [
        'In hộp mỹ phẩm nắp gài Ivory 300 ép kim',
        'Thùng carton sóng AB 5 lớp sầu riêng 42x32x28cm',
        'In túi giấy Kraft quai dù cho shop thời trang',
        'Tem decal cuộn nhựa PVC chống nước 10000 tem',
      ],
    },
  ]);

  // Recalculate quote in real-time
  const quote = calculatePackagingQuote(quoteInput);

  // Formatted Action Payload required by the brief
  const actionPayload: SaveLeadActionPayload = {
    action: 'SAVE_LEAD',
    lead_data: {
      customer_name: customerLead.name,
      phone: customerLead.phone,
      product_type: quoteInput.productType === 'hop_giay' ? 'Hộp giấy nắp gài' :
                    quoteInput.productType === 'thung_carton' ? 'Thùng carton sóng' :
                    quoteInput.productType === 'tui_giay' ? 'Túi giấy quai xách' : 'Tem Decal',
      dimensions: `${quoteInput.dimensions.lengthMm} x ${quoteInput.dimensions.widthMm} x ${quoteInput.dimensions.heightMm} mm`,
      material: quoteInput.material,
      quantity: quoteInput.quantity,
      has_design_file: quoteInput.hasDesignFile,
      finishing_notes: [
        quoteInput.finishing.lamination !== 'none' ? `Cán màng ${quoteInput.finishing.lamination}` : '',
        quoteInput.finishing.hotFoilStamp ? 'Ép kim vàng 24K' : '',
        quoteInput.finishing.spotUV ? 'UV định hình' : '',
        quoteInput.finishing.embossing ? 'Bế nổi' : '',
        quoteInput.finishing.windowFilm ? 'Cửa sổ kiếng PVC' : '',
        quoteInput.finishing.autoGluing ? 'Dán hộp tự động' : '',
      ].filter(Boolean).join(', ') || 'Cắt bế thành phẩm tiêu chuẩn',
      status: 'HOT_LEAD',
      address: customerLead.address,
      estimated_value: quote.totalPriceVnd,
    },
  };

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');

    // Intelligent domain bot response logic
    setTimeout(() => {
      let botResponse = '';
      let updatedInputs: Partial<QuoteCalculationInput> = {};
      const lower = text.toLowerCase();

      if (lower.includes('mỹ phẩm') || lower.includes('ivory') || lower.includes('ép kim')) {
        updatedInputs = {
          productType: 'hop_giay',
          material: 'ivory_300',
          quantity: 2000,
          finishing: { ...quoteInput.finishing, lamination: 'matte', hotFoilStamp: true },
        };
        botResponse = `Dạ tuyệt vời ạ! Đối với mỹ phẩm, giấy Ivory 300–350gsm là tiêu chuẩn vàng vì đanh giấy, giữ dáng sắc cạnh và bắt màu in offset cực chuẩn. Để tăng tính cao cấp, em đã cấu hình Cán màng mờ chống trầy + Ép kim vàng 24K logo.\n\nQuy tắc xưởng Offset: Khi anh/chị in 2.000 hộp, đơn giá sẽ rẻ hơn gần 40% so với làm 500 hộp do chi phí kẽm CTP và tiền mở máy được phân bổ đều. Anh/chị kiểm tra bảng tính chi tiết bên phải nhé!`;
      } else if (lower.includes('thùng carton') || lower.includes('sầu riêng') || lower.includes('nông sản')) {
        updatedInputs = {
          productType: 'thung_carton',
          material: 'carton_ab_5lop',
          dimensions: { lengthMm: 420, widthMm: 320, heightMm: 280 },
          quantity: 5000,
          finishing: { ...quoteInput.finishing, dieCutMould: true, windowFilm: false },
        };
        botResponse = `Dạ đối với nông sản & sầu riêng xuất khẩu, em đề xuất ngay dòng Carton Sóng AB 5 Lớp chống thấm ẩm container 90%, chịu nén xếp chồng 6 tầng (BCT > 650kgf). Đã lên kích thước tiêu chuẩn 420x320x280mm bế lỗ thông khí hai bên sườn!`;
      } else if (lower.includes('túi') || lower.includes('kraft')) {
        updatedInputs = {
          productType: 'tui_giay',
          material: 'kraft_nau_160',
          dimensions: { lengthMm: 220, widthMm: 100, heightMm: 320 },
          quantity: 3000,
        };
        botResponse = `Dạ túi giấy Kraft Nâu Nhật 160–180gsm vừa mang phong cách mộc mạc eco-friendly, vừa dai dẻo chịu lực 3–5kg với quai dù xỏ mắt cáo. Em đã cập nhật bảng tính giá xưởng cho 3.000 túi ạ!`;
      } else if (lower.includes('decal') || lower.includes('tem') || lower.includes('nhựa')) {
        updatedInputs = {
          productType: 'decal_tem',
          material: 'decal_nhua_sua',
          dimensions: { lengthMm: 50, widthMm: 50, heightMm: 0 },
          quantity: 10000,
        };
        botResponse = `Dạ đối với tem dán chai lọ tiếp xúc nước hoặc tủ đông, Decal nhựa sữa PVC chống nước 100%, bế demi bóc dán siêu mượt là giải pháp chuẩn kỹ thuật nhất ạ!`;
      } else {
        botResponse = `Dạ em đã ghi nhận thông số của anh/chị. Em đã cập nhật trực tiếp vào Bảng Dự Toán Giá Thành Sản Xuất bên phải và tối ưu khổ kẽm CTP. Anh/chị có thể tinh chỉnh kích thước, số lượng hoặc tuỳ chọn gia công ở khung điều khiển để xem đơn giá thay đổi tức thì ạ!`;
      }

      if (Object.keys(updatedInputs).length > 0) {
        setQuoteInput((prev) => ({ ...prev, ...updatedInputs }));
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(actionPayload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleSaveToCRM = () => {
    onSaveLead(actionPayload.lead_data);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTransferToProduction = () => {
    const newOrder: ProductionOrder = {
      id: 'ord_' + Math.random().toString(36).substring(2, 7),
      orderNumber: `PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      customerName: customerLead.name,
      phone: customerLead.phone,
      productName: `${actionPayload.lead_data.product_type} (${quoteInput.dimensions.lengthMm}x${quoteInput.dimensions.widthMm}x${quoteInput.dimensions.heightMm})`,
      quantity: quoteInput.quantity,
      materialText: quoteInput.material.replace(/_/g, ' ').toUpperCase(),
      dimensionsText: `${quoteInput.dimensions.lengthMm}x${quoteInput.dimensions.widthMm}x${quoteInput.dimensions.heightMm}mm`,
      stage: 'preflight',
      assignedMachine: quoteInput.printTech === 'offset' ? 'Heidelberg Speedmaster XL 75 (4 Màu)' : 'Máy Kỹ Thuật Số Nhanh',
      priority: quoteInput.urgentDelivery ? 'urgent' : 'high',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + quote.productionDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      finishingTasks: [
        quoteInput.finishing.lamination !== 'none' ? `Cán màng ${quoteInput.finishing.lamination}` : '',
        quoteInput.finishing.hotFoilStamp ? 'Ép kim logo' : '',
        quoteInput.finishing.spotUV ? 'Phủ UV định hình' : '',
        'Khuôn bế laser & dán tự động',
      ].filter(Boolean),
      proofApproved: false,
      totalAmount: quote.totalPriceVnd,
      depositPaid: Math.round(quote.totalPriceVnd * 0.5),
    };
    onSendToProduction(newOrder);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 max-w-7xl mx-auto">
      {/* LEFT COLUMN: 24/7 Technical Chatbot (5 cols) */}
      <div className="lg:col-span-5 flex flex-col h-[760px] bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white">Chuyên viên Kỹ thuật In ấn</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <p className="text-[11px] text-slate-400">Tư vấn chất liệu, tràn lề & dự toán chi phí tự động</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
            Engine 1 Live
          </span>
        </div>

        {/* Chat Messages */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-amber-400 border border-slate-700'
                }`}
              >
                {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-tr-none shadow-md'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none whitespace-pre-line'
                }`}
              >
                {m.text}

                {/* Quick replies pills */}
                {m.quickReplies && (
                  <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex flex-wrap gap-1.5">
                    {m.quickReplies.map((qr, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(qr)}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-slate-700/70 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-600/70 transition cursor-pointer text-left"
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>

        {/* Chat Input */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập yêu cầu (ví dụ: 'In 3000 hộp trà Ivory 300 size 10x10x15cm')..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              aria-label="Gửi tin nhắn"
              className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive 5-Core Technical Estimator & Output Payload (7 cols) */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        {/* Top bar: Parameter controls & Schematic */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">5 Thông số Kỹ thuật Cốt lõi (Core Parameters)</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Báo giá chuẩn xưởng in Offset/Flexo</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Dimensions */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                1. Kích thước (Dài x Rộng x Cao mm)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400">Dài:</span>
                  <input
                    type="number"
                    value={quoteInput.dimensions.lengthMm}
                    onChange={(e) => setQuoteInput({
                      ...quoteInput,
                      dimensions: { ...quoteInput.dimensions, lengthMm: Number(e.target.value) }
                    })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-amber-300 font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Rộng:</span>
                  <input
                    type="number"
                    value={quoteInput.dimensions.widthMm}
                    onChange={(e) => setQuoteInput({
                      ...quoteInput,
                      dimensions: { ...quoteInput.dimensions, widthMm: Number(e.target.value) }
                    })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-amber-300 font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Cao:</span>
                  <input
                    type="number"
                    value={quoteInput.dimensions.heightMm}
                    onChange={(e) => setQuoteInput({
                      ...quoteInput,
                      dimensions: { ...quoteInput.dimensions, heightMm: Number(e.target.value) }
                    })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-amber-300 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 2. Material & Weight */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                2. Chất liệu & Định lượng giấy
              </label>
              <select
                value={quoteInput.material}
                onChange={(e) => setQuoteInput({ ...quoteInput, material: e.target.value as PaperMaterial })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="ivory_300">Ivory 300gsm (FBB trắng mịn, mỹ phẩm cao cấp)</option>
                <option value="ivory_350">Ivory 350gsm (Dày cứng, đứng dáng tuyệt đối)</option>
                <option value="duplex_300">Duplex 300gsm (Lưng xám tiết kiệm chi phí)</option>
                <option value="duplex_400">Duplex 400gsm (Hộp bánh, phụ kiện nặng)</option>
                <option value="kraft_nau_160">Kraft Nâu 160gsm (Eco-friendly, quai dù)</option>
                <option value="kraft_nau_250">Kraft Nâu 250gsm (Hộp Kraft gập nắp)</option>
                <option value="carton_e_3lop">Carton Sóng E 3 lớp (1.5mm hộp quà/ship COD)</option>
                <option value="carton_b_3lop">Carton Sóng B 3 lớp (2.5mm thùng chịu nén)</option>
                <option value="carton_ab_5lop">Carton Sóng AB 5 lớp (Xuất khẩu container)</option>
                <option value="decal_nhua_sua">Decal Nhựa Sữa PVC (Chống nước 100%)</option>
                <option value="decal_giay">Decal Giấy (Dán chai khô giá rẻ)</option>
                <option value="decal_xi_bac">Decal Xi Bạc (Tem máy móc, linh kiện)</option>
              </select>
            </div>

            {/* 3. Quantity & Offset Curve */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  3. Số lượng in (MOQ Curve):
                </label>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {quoteInput.quantity.toLocaleString('vi-VN')} cái
                </span>
              </div>
              <input
                type="range"
                min="200"
                max="20000"
                step="200"
                value={quoteInput.quantity}
                onChange={(e) => setQuoteInput({ ...quoteInput, quantity: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>500 (KTS/Ít)</span>
                <span>2.000 (Tối ưu)</span>
                <span>5.000 (Rẻ)</span>
                <span>20.000+ (Đại lý)</span>
              </div>
            </div>

            {/* 4. Printing Tech & Design Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                4. Công nghệ in & Tình trạng File
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={quoteInput.printTech}
                  onChange={(e) => setQuoteInput({ ...quoteInput, printTech: e.target.value as PrintTechnology })}
                  className="bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                >
                  <option value="offset">In Offset 4 Màu CMYK</option>
                  <option value="digital">In Kỹ Thuật Số Nhanh</option>
                  <option value="flexo">In Flexo Tốc Độ Cao</option>
                </select>
                <button
                  type="button"
                  onClick={() => setQuoteInput({ ...quoteInput, hasDesignFile: !quoteInput.hasDesignFile })}
                  className={`px-2 py-1.5 rounded text-xs font-semibold border transition cursor-pointer ${
                    quoteInput.hasDesignFile
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {quoteInput.hasDesignFile ? '✓ Đã có file .AI/.PDF' : '✕ Cần Xưởng Thiết Kế'}
                </button>
              </div>
            </div>
          </div>

          {/* 5. Finishing Options (Gia công sau in) */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <span className="block text-xs font-semibold text-slate-300 mb-2">
              5. Quy cách gia công sau in (Finishing):
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              {/* Lamination */}
              <select
                value={quoteInput.finishing.lamination}
                onChange={(e) => setQuoteInput({
                  ...quoteInput,
                  finishing: { ...quoteInput.finishing, lamination: e.target.value as any }
                })}
                className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
              >
                <option value="none">Không cán màng</option>
                <option value="gloss">Cán màng Bóng</option>
                <option value="matte">Cán màng Mờ (Sang trọng)</option>
                <option value="thermal_anti_scratch">Màng nhiệt Chống trầy</option>
              </select>

              {/* Hot Foil */}
              <button
                type="button"
                onClick={() => setQuoteInput({
                  ...quoteInput,
                  finishing: { ...quoteInput.finishing, hotFoilStamp: !quoteInput.finishing.hotFoilStamp }
                })}
                className={`px-2.5 py-1 rounded border transition cursor-pointer flex items-center gap-1 ${
                  quoteInput.finishing.hotFoilStamp
                    ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50 font-bold'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                Ép kim Vàng 24K
              </button>

              {/* Spot UV */}
              <button
                type="button"
                onClick={() => setQuoteInput({
                  ...quoteInput,
                  finishing: { ...quoteInput.finishing, spotUV: !quoteInput.finishing.spotUV }
                })}
                className={`px-2.5 py-1 rounded border transition cursor-pointer ${
                  quoteInput.finishing.spotUV
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                Phủ UV Định Hình
              </button>

              {/* Embossing */}
              <button
                type="button"
                onClick={() => setQuoteInput({
                  ...quoteInput,
                  finishing: { ...quoteInput.finishing, embossing: !quoteInput.finishing.embossing }
                })}
                className={`px-2.5 py-1 rounded border transition cursor-pointer ${
                  quoteInput.finishing.embossing
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 font-bold'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                Bế Nổi / Thúc Nổi Logo
              </button>

              {/* Window PVC */}
              <button
                type="button"
                onClick={() => setQuoteInput({
                  ...quoteInput,
                  finishing: { ...quoteInput.finishing, windowFilm: !quoteInput.finishing.windowFilm }
                })}
                className={`px-2.5 py-1 rounded border transition cursor-pointer ${
                  quoteInput.finishing.windowFilm
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                Cửa Sổ Kiếng Supor
              </button>
            </div>
          </div>
        </div>

        {/* 3D Box & Imposition Schematic */}
        <PackagingSchematic input={quoteInput} />

        {/* Live Quotation Summary Card */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Bảng Dự Toán Chi Phí Sản Xuất Chi Tiết</h3>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Thời gian: <strong className="text-white">{quote.productionDays} ngày</strong>
              </span>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-xs">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Tiền Giấy & Carton:</span>
              <span className="font-mono font-semibold text-slate-200">
                {quote.paperCost.toLocaleString('vi-VN')} đ
              </span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Kẽm CTP & Bình Trang:</span>
              <span className="font-mono font-semibold text-slate-200">
                {quote.ctpPlateCost.toLocaleString('vi-VN')} đ
              </span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Công In Offset 4 Màu:</span>
              <span className="font-mono font-semibold text-slate-200">
                {quote.printRunCost.toLocaleString('vi-VN')} đ
              </span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Khuôn Bế & Gia Công:</span>
              <span className="font-mono font-semibold text-slate-200">
                {(quote.dieMouldCost + quote.dieCutAndGluing + quote.finishingCost + quote.laminationCost).toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>

          {/* Bottom Totals */}
          <div className="p-3 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent rounded-xl border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs text-amber-300 font-medium block">
                Tổng giá trị đơn hàng ({quoteInput.quantity.toLocaleString('vi-VN')} cái):
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-white font-mono">
                  {quote.totalPriceVnd.toLocaleString('vi-VN')} <span className="text-sm font-normal text-amber-400">VNĐ</span>
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                  {quote.unitPriceVnd.toLocaleString('vi-VN')} đ / cái
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveToCRM}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-md shadow-amber-500/20 cursor-pointer"
              >
                {savedSuccess ? <Check className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                {savedSuccess ? 'Đã lưu vào CRM!' : 'Lưu Lead vào CRM'}
              </button>
              <button
                onClick={handleTransferToProduction}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-md shadow-sky-600/20 cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                Lên Lệnh Xưởng
              </button>
            </div>
          </div>

          {quote.moqRecommendation && (
            <div className="mt-3 p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs flex items-start gap-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-sky-400" />
              <span>{quote.moqRecommendation}</span>
            </div>
          )}
        </div>

        {/* Output Format (Brief Requirement): SAVE_LEAD JSON Payload */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              Backend Output Format: <strong className="text-amber-300">SAVE_LEAD JSON Payload</strong>
            </span>
            <button
              onClick={handleCopyPayload}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer"
            >
              {copiedPayload ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedPayload ? 'Đã sao chép' : 'Copy JSON'}
            </button>
          </div>
          <pre className="text-slate-300 text-[11px] overflow-x-auto max-h-40 leading-relaxed">
            {JSON.stringify(actionPayload, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
