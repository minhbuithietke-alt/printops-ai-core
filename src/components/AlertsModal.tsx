/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Flame, 
  X, 
  PhoneCall, 
  Clock, 
  Check, 
  Copy, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { ScrapedSignal } from '../types/printOps';

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  signals: ScrapedSignal[];
  onSelectSignalForChat: (signal: ScrapedSignal) => void;
  onUpdateSignalStatus: (id: string, status: ScrapedSignal['status']) => void;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({
  isOpen,
  onClose,
  signals,
  onSelectSignalForChat,
  onUpdateSignalStatus,
}) => {
  if (!isOpen) return null;

  const hotSignals = signals.filter((s) => s.score === 'HOT');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Trung Tâm Cảnh Báo ROUTE_ALERT ({hotSignals.length} Hot Leads)
              </h3>
              <p className="text-[11px] text-slate-400">
                Tín hiệu mua hàng số lượng lớn, có số điện thoại hoặc cần tiến độ gấp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of hot leads */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {hotSignals.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Hiện tại không có cảnh báo Hot Lead nào đang chờ.
            </div>
          ) : (
            hotSignals.map((sig) => (
              <div
                key={sig.id}
                className="p-4 rounded-xl bg-slate-950/90 border border-rose-500/40 text-xs space-y-2 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{sig.authorName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                      URGENT SALES
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{sig.timestamp}</span>
                </div>

                <p className="text-slate-200 bg-slate-900 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                  "{sig.content}"
                </p>

                {sig.routedAlert && (
                  <div className="text-[11px] text-emerald-300 font-medium">
                    ⚡ <strong>Hành động đề xuất:</strong> {sig.routedAlert.recommended_action}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="text-amber-400 font-mono text-[11px]">
                    {sig.detectedSpecs.phone && <span>☎ {sig.detectedSpecs.phone}</span>}
                    {sig.detectedSpecs.quantity && <span className="ml-2">• {sig.detectedSpecs.quantity.toLocaleString('vi-VN')} cái</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    {sig.detectedSpecs.phone && (
                      <a
                        href={`tel:${sig.detectedSpecs.phone}`}
                        onClick={() => onUpdateSignalStatus(sig.id, 'contacted')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition shadow-sm"
                      >
                        <PhoneCall className="w-3 h-3" />
                        Gọi Ngay
                      </a>
                    )}
                    <button
                      onClick={() => {
                        onSelectSignalForChat(sig);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition"
                    >
                      Báo Giá Chatbot
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
