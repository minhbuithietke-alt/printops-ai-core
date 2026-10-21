/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Printer, 
  MessageSquareCode, 
  Radar, 
  PenTool, 
  Layers, 
  RefreshCcw, 
  LayoutDashboard,
  Bell,
  Cpu,
  ShieldCheck,
  Globe
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hotLeadsCount: number;
  ordersOnPressCount: number;
  retentionDueCount: number;
  isFacebookConnected: boolean;
  onOpenAlertsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  hotLeadsCount,
  ordersOnPressCount,
  retentionDueCount,
  isFacebookConnected,
  onOpenAlertsModal,
}) => {
  const navItems = [
    { id: 'dashboard', label: '📊 Tổng quan', icon: LayoutDashboard, badge: null },
    { id: 'chatbot', label: '💬 Engine 1: Chatbot & Báo giá', icon: MessageSquareCode, badge: null },
    { id: 'scanner', label: '🎯 Engine 2: Quét Tín hiệu Lead', icon: Radar, badge: hotLeadsCount > 0 ? `${hotLeadsCount} HOT` : null, badgeColor: 'bg-rose-500' },
    { id: 'copywriter', label: '✒️ Engine 3: Copywriter Bao bì', icon: PenTool, badge: null },
    { id: 'scheduler', label: '📦 Engine 4: Lệnh Sản xuất', icon: Layers, badge: ordersOnPressCount > 0 ? `${ordersOnPressCount} Lệnh` : null, badgeColor: 'bg-sky-500' },
    { id: 'retention', label: '🔄 Engine 5: Retention CRM', icon: RefreshCcw, badge: retentionDueCount > 0 ? `${retentionDueCount} Tái đặt` : null, badgeColor: 'bg-emerald-500' },
    { 
      id: 'facebook', 
      label: '🌐 Kết Nối Facebook', 
      icon: Globe, 
      badge: isFacebookConnected ? 'Live' : 'Mới', 
      badgeColor: isFacebookConnected ? 'bg-blue-600' : 'bg-slate-700' 
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 p-0.5 shadow-lg shadow-orange-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Printer className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  PrintOps <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">AI Core</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1"></span>
                  v2.6 Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate hidden sm:block">
                Hệ thống Quản trị Kỹ thuật In ấn & Tự động hoá Bao bì Doanh nghiệp
              </p>
            </div>
          </div>

          {/* Telemetry quick badges & Alert trigger */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-slate-800/60 rounded-lg px-2.5 py-1.5 border border-slate-700/60 text-xs">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300">Offset Heidelberg XL75:</span>
              <span className="text-emerald-400 font-semibold font-mono">Đang chạy 85%</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 bg-slate-800/60 rounded-lg px-2.5 py-1.5 border border-slate-700/60 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-slate-300">CTP Plate:</span>
              <span className="text-sky-300 font-semibold font-mono">2400 DPI Ready</span>
            </div>

            {/* Notification Bell with pulsating Hot count */}
            <button
              onClick={onOpenAlertsModal}
              aria-label="Cảnh báo tín hiệu Hot Leads"
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {hotLeadsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-slate-900 animate-pulse">
                  {hotLeadsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/80 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-amber-300 border border-orange-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full text-white ${item.badgeColor || 'bg-slate-600'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
