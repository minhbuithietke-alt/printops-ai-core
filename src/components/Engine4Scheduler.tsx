/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Layers, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Plus, 
  Printer, 
  Cpu, 
  Truck, 
  FileCheck,
  Send,
  Sliders,
  DollarSign
} from 'lucide-react';
import { ProductionOrder, MarketingContentDraft } from '../types/printOps';

interface Engine4SchedulerProps {
  orders: ProductionOrder[];
  scheduledPosts: MarketingContentDraft[];
  onUpdateOrderStage: (orderId: string, nextStage: ProductionOrder['stage']) => void;
  onAddNewOrder: (order: ProductionOrder) => void;
  onPublishPostNow: (postId: string) => void;
}

const STAGES: { id: ProductionOrder['stage']; label: string; icon: any; color: string }[] = [
  { id: 'preflight', label: '1. Pre-flight & File', icon: FileCheck, color: 'text-sky-400 border-sky-500/30 bg-sky-500/10' },
  { id: 'ctp_plate', label: '2. Kẽm CTP 2400DPI', icon: Cpu, color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' },
  { id: 'printing', label: '3. In Offset / Flexo', icon: Printer, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  { id: 'finishing', label: '4. Gia Công & Bế Dán', icon: Sliders, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
  { id: 'qc_packing', label: '5. KCS & Đóng Thùng', icon: CheckCircle2, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  { id: 'delivered', label: '6. Xuất Xưởng / Giao', icon: Truck, color: 'text-slate-300 border-slate-600 bg-slate-800' },
];

export const Engine4Scheduler: React.FC<Engine4SchedulerProps> = ({
  orders,
  scheduledPosts,
  onUpdateOrderStage,
  onAddNewOrder,
  onPublishPostNow,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'production' | 'publishing'>('production');
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);

  // New Order Form State
  const [newOrderCustomer, setNewOrderCustomer] = useState('');
  const [newOrderProduct, setNewOrderProduct] = useState('');
  const [newOrderQty, setNewOrderQty] = useState(3000);
  const [newOrderPhone, setNewOrderPhone] = useState('');
  const [newOrderAmount, setNewOrderAmount] = useState(15000000);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderCustomer || !newOrderProduct) return;

    const newOrd: ProductionOrder = {
      id: 'ord_' + Date.now(),
      orderNumber: `PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      customerName: newOrderCustomer,
      phone: newOrderPhone || '0901234567',
      productName: newOrderProduct,
      quantity: newOrderQty,
      materialText: 'Ivory 300gsm Cán màng mờ',
      dimensionsText: '150 x 80 x 200 mm',
      stage: 'preflight',
      assignedMachine: 'Heidelberg Speedmaster XL 75',
      priority: 'high',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      finishingTasks: ['Cán màng mờ', 'Bế khuôn laser', 'Dán tự động'],
      proofApproved: false,
      totalAmount: newOrderAmount,
      depositPaid: Math.round(newOrderAmount * 0.5),
    };

    onAddNewOrder(newOrd);
    setIsAddOrderOpen(false);
    setNewOrderCustomer('');
    setNewOrderProduct('');
  };

  const getNextStage = (current: ProductionOrder['stage']): ProductionOrder['stage'] | null => {
    const orderIndex = STAGES.findIndex((s) => s.id === current);
    if (orderIndex >= 0 && orderIndex < STAGES.length - 1) {
      return STAGES[orderIndex + 1].id;
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Engine Header & Subtabs */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Engine 4: Publishing & Workflow Scheduler</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20">
                  Production ERP & Fanpage Dispatcher
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Điều phối toàn diện tiến độ xưởng in (Pre-press → CTP → Offset → Finishing) & Lịch xuất bản mạng xã hội
              </p>
            </div>
          </div>

          {/* Subtab Switcher & Actions */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center">
              <button
                onClick={() => setActiveSubTab('production')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeSubTab === 'production'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                Pipeline Xưởng In ({orders.length})
              </button>
              <button
                onClick={() => setActiveSubTab('publishing')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeSubTab === 'publishing'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Lịch Fanpage ({scheduledPosts.length})
              </button>
            </div>

            {activeSubTab === 'production' && (
              <button
                onClick={() => setIsAddOrderOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm Lệnh In Mới
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SUBTAB 1: PRODUCTION KANBAN PIPELINE */}
      {activeSubTab === 'production' && (
        <div className="space-y-4">
          {/* Machine load banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[11px]">Heidelberg XL 75 (Offset 4C):</span>
                <span className="font-bold text-emerald-400">Đang chạy Lô PO-2026-089</span>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">85% Tải</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[11px]">Máy Xuất Kẽm CTP Kodak:</span>
                <span className="font-bold text-sky-400">Sẵn sàng (Standby)</span>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">2400 DPI</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[11px]">Máy Bế Tự Động Bobst:</span>
                <span className="font-bold text-amber-400">Lên bài ép nhũ vàng 24K</span>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">92% Tải</span>
            </div>
          </div>

          {/* Kanban Columns (Horizontal Scrollable) */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
            {STAGES.map((col) => {
              const colOrders = orders.filter((o) => o.stage === col.id);
              const ColIcon = col.icon;

              return (
                <div key={col.id} className="bg-slate-900/90 rounded-2xl border border-slate-800 p-3 flex flex-col h-[600px]">
                  {/* Column Header */}
                  <div className={`p-2 rounded-xl border mb-3 flex items-center justify-between ${col.color}`}>
                    <div className="flex items-center gap-1.5">
                      <ColIcon className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-bold truncate">{col.label}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950/60">
                      {colOrders.length}
                    </span>
                  </div>

                  {/* Orders in Column */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                    {colOrders.length === 0 ? (
                      <div className="h-32 flex items-center justify-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-[11px]">
                        Trống
                      </div>
                    ) : (
                      colOrders.map((ord) => {
                        const next = getNextStage(ord.stage);
                        const isUrgent = ord.priority === 'urgent';

                        return (
                          <div
                            key={ord.id}
                            className={`p-3 rounded-xl border bg-slate-950/80 space-y-2 transition shadow-sm ${
                              isUrgent ? 'border-rose-500/50' : 'border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[11px] font-bold text-amber-400">
                                {ord.orderNumber}
                              </span>
                              {isUrgent && (
                                <span className="text-[9px] font-bold px-1 rounded bg-rose-500 text-white animate-pulse">
                                  GẤP
                                </span>
                              )}
                            </div>

                            <div>
                              <p className="text-xs font-bold text-white truncate">{ord.customerName}</p>
                              <p className="text-[11px] text-slate-300 font-medium truncate">{ord.productName}</p>
                            </div>

                            <div className="text-[10px] text-slate-400 space-y-0.5 font-mono">
                              <div>SL: <strong className="text-slate-200">{ord.quantity.toLocaleString('vi-VN')}</strong> cái</div>
                              <div>Kích thước: {ord.dimensionsText}</div>
                              <div className="text-amber-400 font-semibold">{ord.totalAmount.toLocaleString('vi-VN')} đ</div>
                            </div>

                            <div className="text-[9px] text-slate-500 truncate">
                              Máy: {ord.assignedMachine}
                            </div>

                            {/* Move Forward Action Button */}
                            {next && (
                              <button
                                onClick={() => onUpdateOrderStage(ord.id, next)}
                                className="w-full py-1.5 mt-1 rounded-lg bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <span>Chuyển tiếp</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: PUBLISHING SCHEDULE (FANPAGE & ZALO) */}
      {activeSubTab === 'publishing' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Danh Sách Bài Viết Đã Lên Lịch Tự Động Đăng Lên Facebook Fanpage & Zalo OA</span>
            <span className="font-mono">Tự Động Xuất Bản Theo Giờ Vàng B2B</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scheduledPosts.map((post) => (
              <div
                key={post.id}
                className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {post.category.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">
                      {post.scheduledTime || 'Hôm nay 18:00'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white line-clamp-2">
                    {post.title}
                  </h4>

                  <p className="text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 line-clamp-3">
                    {post.hook}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex gap-1 text-[10px] text-slate-400 font-mono">
                    {post.socialPlatforms.map((p) => (
                      <span key={p} className="px-1.5 py-0.5 bg-slate-800 rounded">
                        {p}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => onPublishPostNow(post.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    Đăng Ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add New Production Order */}
      {isAddOrderOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Printer className="w-4 h-4 text-emerald-400" />
              Khởi Tạo Lệnh Sản Xuất In Ấn Mới
            </h3>

            <form onSubmit={handleCreateOrder} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Tên Khách Hàng / Thương Hiệu:</label>
                <input
                  type="text"
                  required
                  value={newOrderCustomer}
                  onChange={(e) => setNewOrderCustomer(e.target.value)}
                  placeholder="VD: Cty Mỹ Phẩm Sakura"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tên Quy Cách Sản Phẩm Bao Bì:</label>
                <input
                  type="text"
                  required
                  value={newOrderProduct}
                  onChange={(e) => setNewOrderProduct(e.target.value)}
                  placeholder="VD: Hộp Ivory 350gsm Ép Kim Vàng"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Số Lượng In:</label>
                  <input
                    type="number"
                    value={newOrderQty}
                    onChange={(e) => setNewOrderQty(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-amber-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tổng Giá Trị (VND):</label>
                  <input
                    type="number"
                    value={newOrderAmount}
                    onChange={(e) => setNewOrderAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOrderOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  Tạo Lệnh Sản Xuất
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
