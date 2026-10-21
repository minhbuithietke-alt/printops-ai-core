/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { Engine1Chatbot } from './components/Engine1Chatbot';
import { Engine2LeadScanner } from './components/Engine2LeadScanner';
import { Engine3Copywriter } from './components/Engine3Copywriter';
import { Engine4Scheduler } from './components/Engine4Scheduler';
import { Engine5RetentionCRM } from './components/Engine5RetentionCRM';
import { AlertsModal } from './components/AlertsModal';

import { FacebookIntegrationHub } from './components/FacebookIntegrationHub';

import { 
  LeadData, 
  ScrapedSignal, 
  ProductionOrder, 
  RetentionCustomer, 
  MarketingContentDraft,
  FacebookPageConfig,
  FacebookWebhookEvent
} from './types/printOps';

import { 
  INITIAL_LEADS, 
  INITIAL_SIGNALS, 
  INITIAL_PRODUCTION_ORDERS, 
  INITIAL_RETENTION_CUSTOMERS, 
  INITIAL_CONTENT_DRAFTS 
} from './data/seedData';

import { evaluateCustomerRetention } from './utils/retentionEngine';
import { analyzeLeadSignal } from './utils/leadScorer';
import { CheckCircle2, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Application Data States
  const [leads, setLeads] = useState<LeadData[]>(INITIAL_LEADS);
  const [signals, setSignals] = useState<ScrapedSignal[]>(INITIAL_SIGNALS);
  const [orders, setOrders] = useState<ProductionOrder[]>(INITIAL_PRODUCTION_ORDERS);
  const [drafts, setDrafts] = useState<MarketingContentDraft[]>(INITIAL_CONTENT_DRAFTS);
  const [retentionCustomers, setRetentionCustomers] = useState<RetentionCustomer[]>(() =>
    INITIAL_RETENTION_CUSTOMERS.map(evaluateCustomerRetention)
  );

  // Facebook Page Configuration State
  const [facebookConfig, setFacebookConfig] = useState<FacebookPageConfig>({
    pageId: '104589234857412',
    pageName: 'Xưởng In Ấn & Bao Bì Tiến Phát Gia Lai',
    pageAccessToken: 'EAAGk38ZBc9sIBO1ZB2XkLdZCa7w9eQp3mInAnBaoBiTienPhatGiaLaiPermanentAccessToken2026',
    geminiApiKey: 'AIzaSy_PrintOps_Gemini_Injected',
    webhookVerifyToken: 'printops_secure_token_2026',
    isConnected: true,
    connectedAt: '09:15',
    activeFeatures: {
      autoChatbot: true,
      leadScraper: true,
      autoPost: true,
      reorderReminder: true,
    },
    metrics: {
      followers: 48500,
      dailyReach: 12400,
      unreadComments: 3,
      activeConversations: 18,
    },
  });

  const [webhookEvents, setWebhookEvents] = useState<FacebookWebhookEvent[]>([
    {
      id: 'evt_init_1',
      timestamp: '09:24',
      type: 'comment',
      senderName: 'Hoàng Yến Mỹ Phẩm',
      senderId: 'fb_user_891',
      summary: 'Báo giá gấp 2000 hộp kem body 8x8x12cm, Ivory 350 ép kim, SĐT: 0979888999',
      rawPayload: { field: 'feed', item: 'comment' },
      handledByEngine: 'Engine 2: Tín hiệu HOT LEAD bóc tách SĐT & kích thước',
    },
    {
      id: 'evt_init_2',
      timestamp: '08:50',
      type: 'message',
      senderName: 'Vựa Trái Cây Tiến Đạt',
      senderId: 'fb_user_552',
      summary: 'Cần 5000 thùng carton đựng bơ booth sóng 5 lớp giao Gia Lai',
      rawPayload: { field: 'messages', text: '5000 thùng carton...' },
      handledByEngine: 'Engine 1: Auto Chatbot Báo Giá Kỹ Thuật',
    },
  ]);

  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handlers
  const handleSaveLead = (newLead: LeadData) => {
    setLeads((prev) => [newLead, ...prev]);
    showToast(`✓ Đã lưu Lead "${newLead.customer_name}" vào CRM (${newLead.status})`);
  };

  const handleSendToProduction = (newOrder: ProductionOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    showToast(`✓ Đã tạo Lệnh Sản Xuất ${newOrder.orderNumber} chuyển xưởng in!`);
    setActiveTab('scheduler');
  };

  const handleAddSignal = (newSignal: ScrapedSignal) => {
    setSignals((prev) => [newSignal, ...prev]);
    if (newSignal.score === 'HOT') {
      showToast(`🔥 CẢNH BÁO HOT LEAD: ${newSignal.authorName} vừa gửi yêu cầu in ấn gấp!`);
    } else {
      showToast(`✓ Đã ghi nhận tương tác mới từ ${newSignal.authorName}`);
    }
  };

  const handleSelectSignalForChat = (signal: ScrapedSignal) => {
    setActiveTab('chatbot');
    showToast(`Đã chuyển thông số của ${signal.authorName} sang Máy tính Báo giá Kỹ thuật!`);
  };

  const handleUpdateSignalStatus = (id: string, status: ScrapedSignal['status']) => {
    setSignals((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    showToast('Đã cập nhật trạng thái liên hệ khách hàng.');
  };

  const handleUpdateOrderStage = (orderId: string, nextStage: ProductionOrder['stage']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, stage: nextStage } : o))
    );
    showToast(`Lệnh in đã chuyển sang công đoạn: ${nextStage.replace(/_/g, ' ').toUpperCase()}`);
  };

  const handleAddNewOrder = (order: ProductionOrder) => {
    setOrders((prev) => [order, ...prev]);
    showToast(`✓ Đã thêm lệnh in ${order.orderNumber} vào chuyền sản xuất`);
  };

  const handleAddDraft = (draft: MarketingContentDraft) => {
    setDrafts((prev) => [draft, ...prev]);
    showToast('✓ Đã tạo bài viết truyền thông kỹ thuật in ấn!');
  };

  const handleSchedulePost = (draft: MarketingContentDraft) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === draft.id ? { ...d, status: 'scheduled' } : d))
    );
    showToast(`✓ Đã lên lịch tự động đăng bài lên Fanpage vào 18:00!`);
    setActiveTab('scheduler');
  };

  const handlePublishPostNow = (postId: string) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === postId ? { ...d, status: 'published' } : d))
    );
    showToast('✓ Bài viết đã được xuất bản trực tiếp lên Facebook Fanpage & Zalo OA!');
  };

  const handleTriggerRetentionMessage = (customerId: string) => {
    setRetentionCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, autoReminded: true } : c))
    );
    showToast('✓ Đã gửi tin nhắn Zalo OA / ZNS nhắc lịch tái đặt kèm chiết khấu VIP!');
  };

  const handleTriggerTestWebhookEvent = (event: FacebookWebhookEvent) => {
    setWebhookEvents((prev) => [event, ...prev]);
    // Also parse lead into Engine 2 Signals stream
    const analyzed = analyzeLeadSignal(event.summary, event.senderName, 'facebook_comment');
    setSignals((prev) => [analyzed, ...prev]);
    showToast(`⚡ Webhook Graph API: Đã bắt sự kiện mới từ ${event.senderName}!`);
  };

  // Computations
  const hotLeadsCount = signals.filter((s) => s.score === 'HOT').length;
  const ordersOnPressCount = orders.filter((o) => o.stage === 'printing' || o.stage === 'finishing').length;
  const retentionDueCount = retentionCustomers.filter((c) => c.healthScore === 'DUE_SOON').length;

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hotLeadsCount={hotLeadsCount}
        ordersOnPressCount={ordersOnPressCount}
        retentionDueCount={retentionDueCount}
        isFacebookConnected={facebookConfig.isConnected}
        onOpenAlertsModal={() => setIsAlertsModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 py-4">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            onNavigateTab={setActiveTab}
            leads={leads}
            signals={signals}
            orders={orders}
            retentionCustomers={retentionCustomers}
            onOpenAlertsModal={() => setIsAlertsModalOpen(true)}
          />
        )}

        {activeTab === 'chatbot' && (
          <Engine1Chatbot
            onSaveLead={handleSaveLead}
            onSendToProduction={handleSendToProduction}
          />
        )}

        {activeTab === 'scanner' && (
          <Engine2LeadScanner
            signals={signals}
            onAddSignal={handleAddSignal}
            onSelectSignalForChat={handleSelectSignalForChat}
            onUpdateSignalStatus={handleUpdateSignalStatus}
          />
        )}

        {activeTab === 'copywriter' && (
          <Engine3Copywriter
            drafts={drafts}
            onAddDraft={handleAddDraft}
            onSchedulePost={handleSchedulePost}
          />
        )}

        {activeTab === 'scheduler' && (
          <Engine4Scheduler
            orders={orders}
            scheduledPosts={drafts.filter((d) => d.status === 'scheduled' || d.status === 'published')}
            onUpdateOrderStage={handleUpdateOrderStage}
            onAddNewOrder={handleAddNewOrder}
            onPublishPostNow={handlePublishPostNow}
          />
        )}

        {activeTab === 'retention' && (
          <Engine5RetentionCRM
            customers={retentionCustomers}
            onTriggerRetentionMessage={handleTriggerRetentionMessage}
          />
        )}

        {activeTab === 'facebook' && (
          <FacebookIntegrationHub
            config={facebookConfig}
            onUpdateConfig={(newCfg) => {
              setFacebookConfig(newCfg);
              showToast('✓ Đã lưu cấu hình Facebook Graph API & Kích hoạt Webhook!');
            }}
            onTriggerTestEvent={handleTriggerTestWebhookEvent}
            webhookEvents={webhookEvents}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">PrintOps AI Core</span>
            <span>• Hệ Thống Quản Trị In Ấn & Tự Động Hoá Bao Bì Toàn Diện</span>
          </div>
          <div className="font-mono text-[11px] text-slate-600">
            Chất liệu: Ivory, Couche, Kraft, Duplex, Sóng AB/E, Decal • Máy in: Heidelberg XL75, Flexo
          </div>
        </div>
      </footer>

      {/* Urgent Alerts Modal */}
      <AlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        signals={signals}
        onSelectSignalForChat={handleSelectSignalForChat}
        onUpdateSignalStatus={handleUpdateSignalStatus}
      />

      {/* Floating Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white border border-amber-500/40 shadow-2xl shadow-black/80 animate-bounce text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
