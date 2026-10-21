/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  DollarSign, 
  Flame, 
  Layers, 
  RefreshCcw, 
  ArrowRight, 
  Printer, 
  TrendingUp, 
  Cpu, 
  Radar, 
  PenTool, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Globe
} from 'lucide-react';
import { LeadData, ScrapedSignal, ProductionOrder, RetentionCustomer } from '../types/printOps';

interface DashboardOverviewProps {
  onNavigateTab: (tab: string) => void;
  leads: LeadData[];
  signals: ScrapedSignal[];
  orders: ProductionOrder[];
  retentionCustomers: RetentionCustomer[];
  onOpenAlertsModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigateTab,
  leads,
  signals,
  orders,
  retentionCustomers,
  onOpenAlertsModal,
}) => {
  const hotSignals = signals.filter((s) => s.score === 'HOT');
  const dueCustomers = retentionCustomers.filter((c) => c.healthScore === 'DUE_SOON');
  const totalProductionValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              PrintOps Enterprise Suite — Vận Hành Xưởng In & Tự Động Hoá Bao Bì
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Trung Tâm Điều Hành <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">5 Micro-Engines</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              Tích hợp chặt chẽ giữa <strong>Tư vấn báo giá kỹ thuật 24/7</strong>, <strong>Radar quét tín hiệu Lead mạng xã hội</strong>, <strong>AI Copywriter bao bì</strong>, <strong>Tiến độ chuyền in Heidelberg/Flexo</strong> và <strong>CRM Tái đặt định kỳ</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateTab('chatbot')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Lên Báo Giá Xưởng Mới
            </button>
            <button
              onClick={() => onNavigateTab('scanner')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition flex items-center gap-2 cursor-pointer"
            >
              <Radar className="w-4 h-4 text-rose-400" />
              Xem Tín Hiệu Hot Leads
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Giá Trị Chuyền In Đang Chạy</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {(totalProductionValue / 1000000).toFixed(1)}M <span className="text-xs text-amber-400 font-normal">VNĐ</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>5 lệnh đang chạy trên các máy</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div 
          onClick={onOpenAlertsModal}
          className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-rose-500/50 p-5 shadow-lg relative overflow-hidden transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Tín Hiệu Hot Leads (Radar)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-current" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-400 font-mono">
            {hotSignals.length} <span className="text-xs text-slate-400 font-normal">yêu cầu gấp</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-rose-300">
            <Clock className="w-3.5 h-3.5" />
            <span>Có số điện thoại cần gọi trong 5 phút!</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div 
          onClick={() => onNavigateTab('scheduler')}
          className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-sky-500/50 p-5 shadow-lg relative overflow-hidden transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Lệnh Sản Xuất In Ấn</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-sky-400 font-mono">
            {orders.length} <span className="text-xs text-slate-400 font-normal">đơn hàng</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-sky-300">
            <Cpu className="w-3.5 h-3.5" />
            <span>Offset Heidelberg + Flexo công suất cao</span>
          </div>
        </div>

        {/* Stat 4 */}
        <div 
          onClick={() => onNavigateTab('retention')}
          className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-emerald-500/50 p-5 shadow-lg relative overflow-hidden transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Khách Hàng Sắp Hết Hộp</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <RefreshCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {dueCustomers.length} <span className="text-xs text-slate-400 font-normal">doanh nghiệp</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Khuôn bế lưu sẵn, duyệt in 2-3 ngày</span>
          </div>
        </div>
      </div>

      {/* 5 Micro-Engines Launchpad Grid */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          5 Autonomous Micro-Engines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div 
            onClick={() => onNavigateTab('chatbot')}
            className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition cursor-pointer group shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                <Printer className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition">
                Engine 1: Chatbot Kỹ Thuật & Tính Kẽm CTP
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Tư vấn viên bán hàng thông minh, tự động thu thập 5 thông số cốt lõi và xuất JSON SAVE_LEAD chuẩn backend.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-amber-400">
              <span>Mở Máy Tính Báo Giá</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 2 */}
          <div 
            onClick={() => onNavigateTab('scanner')}
            className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-rose-500/50 transition cursor-pointer group shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
                <Radar className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition">
                Engine 2: Lead Scraping & Signal Detector
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Quét webhook comment/inbox, phân loại Cold/Warm/Hot và kích hoạt cảnh báo ROUTE_ALERT gọi điện trong 5 phút.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-rose-400">
              <span>Quét Tín Hiệu Mới</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 3 */}
          <div 
            onClick={() => onNavigateTab('copywriter')}
            className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition cursor-pointer group shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                <PenTool className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition">
                Engine 3: Content & Packaging Copywriter
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Sáng tạo Case Study bao bì mỹ phẩm, hướng dẫn B2B chọn thùng carton nông sản xuất khẩu, post bán hàng Facebook/TikTok.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-purple-400">
              <span>Soạn Thảo Bài Viết</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 4 */}
          <div 
            onClick={() => onNavigateTab('scheduler')}
            className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-sky-500/50 transition cursor-pointer group shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-sky-400 transition">
                Engine 4: Production Scheduler & Kanban
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Theo dõi 6 công đoạn chuyền xưởng in: Pre-flight → Kẽm CTP → Offset → Gia công ép/bế → KCS → Giao hàng.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-sky-400">
              <span>Kiểm Soát Xưởng In</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 5 */}
          <div 
            onClick={() => onNavigateTab('retention')}
            className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition cursor-pointer group shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                <RefreshCcw className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
                Engine 5: Retention CRM & Báo Giá Tự Động
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Đo chu kỳ dùng hết bao bì theo ngành hàng, gửi Zalo OA nhắc lịch tái đặt và xuất Bảng báo giá in ấn chuẩn format.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-emerald-400">
              <span>Theo Dõi Tồn Kho Khách</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 6: Facebook Integration Hub */}
          <div 
            onClick={() => onNavigateTab('facebook')}
            className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition cursor-pointer group shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition">
                Facebook Integration Hub
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Cấu hình kết nối Facebook Graph API v20.0, kích hoạt Chatbot tự động, AI Quét Lead và Auto-Post định kỳ.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-400">
              <span>Cấu Hình Fanpage</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Hot Leads to Call */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500 fill-current" />
              Tín Hiệu Hot Leads Cần Chốt Ngay
            </h4>
            <button
              onClick={() => onNavigateTab('scanner')}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
            >
              Xem tất cả <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {hotSignals.slice(0, 3).map((sig) => (
              <div
                key={sig.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/30 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{sig.authorName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{sig.timestamp}</span>
                </div>
                <p className="text-slate-300 line-clamp-2">"{sig.content}"</p>
                {sig.detectedSpecs.phone && (
                  <div className="text-[11px] text-emerald-400 font-mono font-bold pt-1">
                    ☎ SĐT: {sig.detectedSpecs.phone}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Orders In Production */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Printer className="w-4 h-4 text-sky-400" />
              Tiến Độ Xưởng Sản Xuất
            </h4>
            <button
              onClick={() => onNavigateTab('scheduler')}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
            >
              Xem Kanban <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {orders.slice(0, 3).map((ord) => (
              <div
                key={ord.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-400">{ord.orderNumber}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
                    {ord.stage.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="font-semibold text-white truncate">{ord.customerName} - {ord.productName}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>SL: {ord.quantity.toLocaleString('vi-VN')} cái</span>
                  <span className="text-white font-bold">{ord.totalAmount.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
