/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Radar, 
  Flame, 
  PhoneCall, 
  MessageCircle, 
  Send, 
  AlertTriangle, 
  Sparkles, 
  Check, 
  Copy, 
  Filter, 
  RefreshCw,
  Clock,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { ScrapedSignal, LeadScore, RouteAlertPayload } from '../types/printOps';
import { analyzeLeadSignal } from '../utils/leadScorer';

interface Engine2LeadScannerProps {
  signals: ScrapedSignal[];
  onAddSignal: (signal: ScrapedSignal) => void;
  onSelectSignalForChat: (signal: ScrapedSignal) => void;
  onUpdateSignalStatus: (id: string, status: ScrapedSignal['status']) => void;
}

export const Engine2LeadScanner: React.FC<Engine2LeadScannerProps> = ({
  signals,
  onAddSignal,
  onSelectSignalForChat,
  onUpdateSignalStatus,
}) => {
  const [filterScore, setFilterScore] = useState<'ALL' | LeadScore>('ALL');
  const [testCommentText, setTestCommentText] = useState('');
  const [authorInput, setAuthorInput] = useState('Khách hàng Facebook');
  const [copiedAlertId, setCopiedAlertId] = useState<string | null>(null);

  // Preset simulation snippets
  const testPresets = [
    {
      label: 'HOT: 5.000 Thùng Sầu Riêng Gia Lai + Cần Gấp',
      author: 'HTX Nông Sản Tây Nguyên',
      text: 'Chào xưởng, bên mình cần đặt gấp 5.000 thùng carton sóng 5 lớp AB size 42x32x28cm đóng sầu riêng xuất khẩu container. Đã sẵn file in vector, gọi mình số 0989123456 báo giá nhanh để duyệt kẽm nhé!',
    },
    {
      label: 'HOT: 2.000 Hộp Kem Body Ivory 350 + SĐT',
      author: 'Thuỳ Trang Cosmetics',
      text: 'Xưởng ơi báo giá cho mình 2000 hộp mỹ phẩm kích thước 10x10x15cm giấy Ivory 350 ép kim nắp với ạ. Zalo mình 0903888777, gửi bảng giá giúp mình nha!',
    },
    {
      label: 'WARM: Hỏi chất liệu Kraft đựng quà',
      author: 'Lan Anh Decor',
      text: 'Bên mình muốn làm túi giấy Kraft đựng nến thơm, định lượng giấy loại nào vừa dày vừa chịu được sức nặng 2kg vậy shop? Thời gian làm hàng mấy ngày?',
    },
    {
      label: 'COLD: Inbox hỏi giá chung',
      author: 'Minh Tuấn',
      text: 'Shop ở đâu thế? Ib mình xin bảng giá in ấn nhé.',
    },
  ];

  const handleSimulateWebhook = (customText?: string, customAuthor?: string) => {
    const text = customText || testCommentText.trim();
    if (!text) return;

    const author = customAuthor || authorInput || 'Khách tương tác Fanpage';
    const analyzedSignal = analyzeLeadSignal(text, author, 'facebook_comment');
    onAddSignal(analyzedSignal);

    if (!customText) {
      setTestCommentText('');
    }
  };

  const filteredSignals = signals.filter((s) => {
    if (filterScore === 'ALL') return true;
    return s.score === filterScore;
  });

  const hotCount = signals.filter((s) => s.score === 'HOT').length;
  const warmCount = signals.filter((s) => s.score === 'WARM').length;
  const coldCount = signals.filter((s) => s.score === 'COLD').length;

  const handleCopyAlert = (alert: RouteAlertPayload, id: string) => {
    navigator.clipboard.writeText(JSON.stringify(alert, null, 2));
    setCopiedAlertId(id);
    setTimeout(() => setCopiedAlertId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Engine Header & Metrics */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
              <Radar className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Engine 2: Lead Scraping & Signal Detector</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Radar Scanning 24/7
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Lắng nghe Webhook Comment/Inbox Fanpage & Hội nhóm, tự động chấm điểm Hot/Warm/Cold và kích hoạt ROUTE_ALERT
              </p>
            </div>
          </div>

          {/* Quick Counter Chips */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterScore('HOT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                filterScore === 'HOT'
                  ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20'
                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-400 fill-current" />
              HOT Leads ({hotCount})
            </button>

            <button
              onClick={() => setFilterScore('WARM')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                filterScore === 'WARM'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              }`}
            >
              WARM Leads ({warmCount})
            </button>

            <button
              onClick={() => setFilterScore('COLD')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                filterScore === 'COLD'
                  ? 'bg-slate-700 text-white border-slate-600'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              COLD ({coldCount})
            </button>

            <button
              onClick={() => setFilterScore('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border ${
                filterScore === 'ALL'
                  ? 'bg-slate-700 text-white border-slate-600'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60'
              }`}
            >
              Tất cả ({signals.length})
            </button>
          </div>
        </div>

        {/* Webhook & Comment Simulator Tester */}
        <div className="mt-4 pt-4 bg-slate-950/80 rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Mô Phỏng Nhận Dữ Liệu Webhook / Quét Comment Facebook:
            </span>
            <span className="text-[11px] text-slate-500">Thử nghiệm các câu chat thực tế để kiểm tra AI Phân tích</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <input
              type="text"
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
              placeholder="Tên khách hàng / Nickname..."
              className="md:col-span-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
            />
            <div className="md:col-span-3 flex gap-2">
              <input
                type="text"
                value={testCommentText}
                onChange={(e) => setTestCommentText(e.target.value)}
                placeholder="Nhập nội dung tương tác (VD: 'Cần in 3000 túi Kraft 20x30cm, zalo mình 0912345678')..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
              <button
                onClick={() => handleSimulateWebhook()}
                className="px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/20 flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                Bắn Webhook
              </button>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] mr-1">Tình huống mẫu:</span>
            {testPresets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSimulateWebhook(p.text, p.author)}
                className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer text-left"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Signals Stream List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Danh sách Tín hiệu đã bắt ({filteredSignals.length} kết quả)</span>
          <span className="font-mono">Tự động gắn thẻ Lead & Điều phối Sales</span>
        </div>

        {filteredSignals.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-xs">
            Không có tín hiệu nào phù hợp với bộ lọc hiện tại. Hãy thử chọn "Tất cả" hoặc bắn một webhook thử nghiệm ở trên!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredSignals.map((signal) => {
              const isHot = signal.score === 'HOT';
              const isWarm = signal.score === 'WARM';

              return (
                <div
                  key={signal.id}
                  className={`bg-slate-900 rounded-2xl border p-5 transition-all shadow-lg ${
                    isHot
                      ? 'border-rose-500/50 bg-gradient-to-r from-rose-950/20 via-slate-900 to-slate-900'
                      : isWarm
                        ? 'border-amber-500/40'
                        : 'border-slate-800'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Left: Author, Source, Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {/* Score Badge */}
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 border ${
                            isHot
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                              : isWarm
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {isHot && <Flame className="w-3 h-3 fill-current text-rose-400" />}
                          {signal.score} LEAD
                        </span>

                        <span className="font-bold text-sm text-white">{signal.authorName}</span>
                        <span className="text-slate-500 text-xs font-mono">• {signal.timestamp}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {signal.source.replace(/_/g, ' ').toUpperCase()}
                        </span>

                        {signal.status === 'contacted' && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            ✓ Đã liên hệ
                          </span>
                        )}
                      </div>

                      {signal.postTitle && (
                        <p className="text-[11px] text-amber-400/90 font-medium italic">
                          {signal.postTitle}
                        </p>
                      )}

                      {/* Comment text */}
                      <p className="text-xs text-slate-200 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                        "{signal.content}"
                      </p>

                      {/* AI Reasoning explanation */}
                      <div className="flex items-start gap-1.5 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-300">Phân tích tín hiệu:</span>
                        <span>{signal.scoreReason}</span>
                      </div>

                      {/* Detected specs chips */}
                      <div className="flex flex-wrap gap-2 pt-1 text-xs">
                        {signal.detectedSpecs.phone && (
                          <span className="px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono font-bold flex items-center gap-1">
                            <PhoneCall className="w-3 h-3 text-emerald-400" />
                            SĐT: {signal.detectedSpecs.phone}
                          </span>
                        )}
                        {signal.detectedSpecs.quantity && (
                          <span className="px-2 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
                            Số lượng: {signal.detectedSpecs.quantity.toLocaleString('vi-VN')} cái
                          </span>
                        )}
                        {signal.detectedSpecs.dimensions && (
                          <span className="px-2 py-1 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-500/30 font-mono">
                            Kích thước: {signal.detectedSpecs.dimensions}
                          </span>
                        )}
                        {signal.detectedSpecs.hasDesign && (
                          <span className="px-2 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold">
                            ✓ Đã có file thiết kế
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions & ROUTE_ALERT Output Format */}
                    <div className="md:w-72 flex-shrink-0 flex flex-col justify-between space-y-3">
                      {/* Action buttons */}
                      <div className="flex flex-col gap-2">
                        {signal.detectedSpecs.phone ? (
                          <a
                            href={`tel:${signal.detectedSpecs.phone}`}
                            onClick={() => onUpdateSignalStatus(signal.id, 'contacted')}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20 cursor-pointer"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            Gọi Ngay: {signal.detectedSpecs.phone}
                          </a>
                        ) : (
                          <button
                            onClick={() => onUpdateSignalStatus(signal.id, 'contacted')}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-sky-400" />
                            Inbox Gửi Bảng Giá Zalo
                          </button>
                        )}

                        <button
                          onClick={() => onSelectSignalForChat(signal)}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          Đẩy sang Engine 1 Báo Giá Kẽm
                          <ArrowUpRight className="w-3 h-3 ml-auto" />
                        </button>
                      </div>

                      {/* If HOT: Display required ROUTE_ALERT JSON Output */}
                      {signal.routedAlert && (
                        <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-500/30 text-[11px] font-mono">
                          <div className="flex items-center justify-between pb-1.5 border-b border-rose-800/40 mb-1.5">
                            <span className="text-rose-300 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-400" />
                              ROUTE_ALERT Payload
                            </span>
                            <button
                              onClick={() => handleCopyAlert(signal.routedAlert!, signal.id)}
                              className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              {copiedAlertId === signal.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                          <div className="text-slate-300 space-y-0.5 text-[10px]">
                            <div>Level: <strong className="text-rose-400">{signal.routedAlert.alert_level}</strong></div>
                            <div>Intent: <span className="text-amber-300">{signal.routedAlert.intent}</span></div>
                            <div className="truncate">Action: <span className="text-emerald-300">{signal.routedAlert.recommended_action}</span></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
