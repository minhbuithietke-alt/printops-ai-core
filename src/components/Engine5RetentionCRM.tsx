/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  RefreshCcw, 
  Send, 
  Printer, 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  UserCheck, 
  TrendingUp, 
  Building2,
  Calendar,
  X
} from 'lucide-react';
import { RetentionCustomer } from '../types/printOps';
import { generateRetentionMessage } from '../utils/retentionEngine';

interface Engine5RetentionCRMProps {
  customers: RetentionCustomer[];
  onTriggerRetentionMessage: (customerId: string) => void;
}

export const Engine5RetentionCRM: React.FC<Engine5RetentionCRMProps> = ({
  customers,
  onTriggerRetentionMessage,
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<RetentionCustomer | null>(null);
  const [quoteCustomerModal, setQuoteCustomerModal] = useState<RetentionCustomer | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [messageSentSuccess, setMessageSentSuccess] = useState(false);

  const dueSoonCount = customers.filter((c) => c.healthScore === 'DUE_SOON').length;
  const overdueCount = customers.filter((c) => c.healthScore === 'OVERDUE_RISK').length;
  const totalLTV = customers.reduce((sum, c) => sum + c.totalLifetimeValue, 0);

  const handleOpenRetention = (c: RetentionCustomer) => {
    setSelectedCustomer(c);
    setMessageSentSuccess(false);
  };

  const handleSendRetention = () => {
    if (!selectedCustomer) return;
    onTriggerRetentionMessage(selectedCustomer.id);
    setMessageSentSuccess(true);
    setTimeout(() => {
      setMessageSentSuccess(false);
      setSelectedCustomer(null);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Engine Header & Retention Metrics */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <RefreshCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Engine 5: Monthly Automated Retention & CRM Engine</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Lifecycle Packaging Tracker
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Theo dõi chu kỳ tiêu thụ bao bì định kỳ của khách hàng B2B, tự động gửi nhắc lịch tái đặt (Re-order) trước khi cạn tồn kho
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
              <span className="text-slate-400">Khách Đến Hạn Tái Đặt:</span>
              <span className="font-bold text-amber-400 font-mono text-sm">{dueSoonCount} khách</span>
            </div>
            <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
              <span className="text-slate-400">Nguy Cơ Churn:</span>
              <span className="font-bold text-rose-400 font-mono text-sm">{overdueCount} khách</span>
            </div>
            <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
              <span className="text-slate-400">Doanh Số Vòng Đời LTV:</span>
              <span className="font-bold text-emerald-400 font-mono text-sm">{(totalLTV / 1000000).toFixed(0)}M đ</span>
            </div>
          </div>
        </div>

        {/* Informational domain note */}
        <div className="mt-4 p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
          <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
          <span>
            <strong>Quy luật Tiêu thụ Bao bì:</strong> Hộp mỹ phẩm thường dùng hết sau 30 ngày, thùng sầu riêng xuất khẩu theo mùa vụ 45 ngày, bánh bakery 20 ngày. Khi xưởng đã lưu sẵn khuôn bế và kẽm CTP, thời gian in tái bản chỉ mất 2-3 ngày, tỉ lệ chốt đơn Re-order thành công đạt trên <strong>88%</strong> khi được liên hệ trước 3-5 ngày!
          </span>
        </div>
      </div>

      {/* Customer Portfolio Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Danh Sách Khách Hàng Doanh Nghiệp Theo Chu Kỳ Tiêu Thụ
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            {customers.length} Đối tác Doanh nghiệp
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3 px-4">Doanh Nghiệp / Đối Tác</th>
                <th className="py-3 px-4">Quy Cách Đặt Thường Xuyên</th>
                <th className="py-3 px-4">Chu Kỳ</th>
                <th className="py-3 px-4">Tồn Kho Dự Kiến</th>
                <th className="py-3 px-4">Trạng Thái Sức Khỏe</th>
                <th className="py-3 px-4">LTV Doanh Số</th>
                <th className="py-3 px-4 text-right">Hành Động Tái Đặt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {customers.map((c) => {
                const isDue = c.healthScore === 'DUE_SOON';
                const isOverdue = c.healthScore === 'OVERDUE_RISK';
                const isChurned = c.healthScore === 'CHURNED';

                return (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-white block">{c.name}</span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          {c.company}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">SĐT/Zalo: {c.phone}</span>
                      </div>
                    </td>

                    {/* Product */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-amber-300 block">{c.usualProduct}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Lô thông thường: {c.averageBatchQuantity.toLocaleString('vi-VN')} cái
                      </span>
                    </td>

                    {/* Cycle */}
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {c.cycleDays} ngày / chu kỳ
                    </td>

                    {/* Days remaining */}
                    <td className="py-3.5 px-4 font-mono">
                      {c.daysRemaining > 0 ? (
                        <span className={`font-bold ${c.daysRemaining <= 3 ? 'text-rose-400' : 'text-amber-300'}`}>
                          Còn {c.daysRemaining} ngày
                        </span>
                      ) : (
                        <span className="font-bold text-rose-500">
                          Quá hạn {Math.abs(c.daysRemaining)} ngày
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 block">
                        Dự kiến hết: {c.nextReorderExpected}
                      </span>
                    </td>

                    {/* Health score badge */}
                    <td className="py-3.5 px-4">
                      {isDue && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-max">
                          <Clock className="w-3 h-3" />
                          SẮP HẾT HỘP (DUE SOON)
                        </span>
                      )}
                      {isOverdue && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30 flex items-center gap-1 w-max animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          QUÁ CHU KỲ (NGUY CƠ)
                        </span>
                      )}
                      {isChurned && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700 w-max">
                          ĐÃ NGỪNG ĐẶT
                        </span>
                      )}
                      {!isDue && !isOverdue && !isChurned && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" />
                          TỒN KHO DỒI DÀO
                        </span>
                      )}
                    </td>

                    {/* LTV */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">
                      {c.totalLifetimeValue.toLocaleString('vi-VN')} đ
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenRetention(c)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          Nhắc Zalo ZNS
                        </button>
                        <button
                          onClick={() => setQuoteCustomerModal(c)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3 text-amber-400" />
                          Bảng Báo Giá
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Automated Retention Message Trigger */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <RefreshCcw className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Kích Hoạt Tin Nhắn Tái Đặt (Re-order Retention)
                </h3>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Generated message preview */}
            {(() => {
              const ret = generateRetentionMessage(selectedCustomer);
              return (
                <div className="space-y-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-[11px] text-slate-400">
                      Gửi đến: <strong className="text-white">{selectedCustomer.name}</strong> ({selectedCustomer.phone})
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Kênh phát: <strong className="text-emerald-400">{ret.channel}</strong>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Chính sách ưu đãi: <strong className="text-amber-400">{ret.suggestedDiscount}</strong>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Nội dung tin nhắn ZNS / Zalo OA cá nhân hoá:
                    </label>
                    <textarea
                      rows={8}
                      readOnly
                      value={ret.message}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 text-xs leading-relaxed font-sans focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(ret.message);
                        setCopiedMessage(true);
                        setTimeout(() => setCopiedMessage(false), 2000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedMessage ? 'Đã sao chép' : 'Sao chép tin nhắn'}
                    </button>

                    <button
                      onClick={handleSendRetention}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {messageSentSuccess ? 'Đã Gửi Thành Công!' : 'Gửi Tự Động Qua Zalo OA'}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Modal: Formal Printable Quotation Sheet */}
      {quoteCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8">
            {/* Header with Enterprise Branding */}
            <div className="flex items-start justify-between pb-4 border-b-2 border-slate-900">
              <div>
                <h2 className="text-xl font-extrabold text-slate-950 uppercase tracking-tight">
                  XƯỞNG IN & BAO BÌ TIẾN PHÁT (PRINTOPS)
                </h2>
                <p className="text-xs text-slate-600">Nhà máy sản xuất Hộp giấy, Thùng carton sóng, Túi giấy & Tem Decal</p>
                <p className="text-xs text-slate-600">Hotline: 0988.776.655 • Email: baobitienphatgialai@gmail.com</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-amber-500 text-slate-950 font-extrabold text-xs rounded uppercase">
                  BÁO GIÁ SẢN XUẤT
                </span>
                <p className="text-xs font-mono text-slate-500 mt-1">Số: BG-2026/PO-088</p>
                <p className="text-xs text-slate-500">Ngày: {new Date().toLocaleDateString('vi-VN')}</p>
              </div>
            </div>

            {/* Customer info */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-1">
              <p><strong>Kính gửi:</strong> {quoteCustomerModal.name} - {quoteCustomerModal.company}</p>
              <p><strong>Điện thoại:</strong> {quoteCustomerModal.phone} | <strong>Email:</strong> {quoteCustomerModal.email}</p>
              <p><strong>Sản phẩm báo giá:</strong> {quoteCustomerModal.usualProduct}</p>
            </div>

            {/* Price Table with MOQ discount tiers */}
            <table className="w-full text-xs border border-slate-300">
              <thead className="bg-slate-100 border-b border-slate-300 font-bold">
                <tr>
                  <th className="p-2 border-r border-slate-300">Hạng mục / Quy cách</th>
                  <th className="p-2 border-r border-slate-300 text-center">Số lượng</th>
                  <th className="p-2 border-r border-slate-300 text-right">Đơn giá (VNĐ)</th>
                  <th className="p-2 text-right">Thành tiền (VNĐ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2 border-r border-slate-300">
                    <strong>{quoteCustomerModal.usualProduct}</strong>
                    <div className="text-[11px] text-slate-600">
                      Gia công: Cán màng mờ, ép kim nhũ vàng 24K, bế dán hoàn thiện
                    </div>
                  </td>
                  <td className="p-2 border-r border-slate-300 text-center font-mono">1.000 cái</td>
                  <td className="p-2 border-r border-slate-300 text-right font-mono">8.200 đ</td>
                  <td className="p-2 text-right font-mono font-bold">8.200.000 đ</td>
                </tr>
                <tr className="bg-amber-50/60 font-semibold">
                  <td className="p-2 border-r border-slate-300">
                    Tái đặt Lô Tối Ưu (Khuyên Dùng - Tận dụng kẽm & khuôn có sẵn)
                  </td>
                  <td className="p-2 border-r border-slate-300 text-center font-mono text-amber-900">
                    {quoteCustomerModal.averageBatchQuantity.toLocaleString('vi-VN')} cái
                  </td>
                  <td className="p-2 border-r border-slate-300 text-right font-mono text-amber-900">5.400 đ</td>
                  <td className="p-2 text-right font-mono font-bold text-amber-900">
                    {(quoteCustomerModal.averageBatchQuantity * 5400).toLocaleString('vi-VN')} đ
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-300">
                    Lô Số Lượng Lớn (Chiết khấu đại lý cấp 1)
                  </td>
                  <td className="p-2 border-r border-slate-300 text-center font-mono">10.000 cái</td>
                  <td className="p-2 border-r border-slate-300 text-right font-mono">3.950 đ</td>
                  <td className="p-2 text-right font-mono font-bold">39.500.000 đ</td>
                </tr>
              </tbody>
            </table>

            {/* Terms and conditions */}
            <div className="text-[11px] text-slate-600 space-y-1">
              <p><strong>Điều khoản thanh toán:</strong> Tạm ứng 50% khi duyệt mẫu kẽm proof, 50% còn lại thanh toán ngay khi bàn giao hàng hoá.</p>
              <p><strong>Thời gian sản xuất:</strong> 3-4 ngày làm việc kể từ thời điểm chốt lệnh.</p>
              <p><strong>Bảo hành:</strong> Đổi trả 1-1 nếu lỗi quy cách gia công, bế lệch hoặc sai màu sắc so với bản test proof.</p>
            </div>

            {/* Signatures */}
            <div className="flex justify-between pt-6 border-t border-slate-200 text-xs">
              <div className="text-center w-40">
                <p className="font-bold">ĐẠI DIỆN KHÁCH HÀNG</p>
                <p className="text-[10px] text-slate-400 mt-12">(Ký và ghi rõ họ tên)</p>
              </div>
              <div className="text-center w-40">
                <p className="font-bold">ĐẠI DIỆN PRINTOPS</p>
                <p className="text-emerald-700 font-bold mt-8">ĐÃ XÁC THỰC KỸ THUẬT</p>
                <p className="text-[10px] text-slate-500">(Ký số điện tử)</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setQuoteCustomerModal(null)}
                className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4" />
                In Bảng Báo Giá / Xuất PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
