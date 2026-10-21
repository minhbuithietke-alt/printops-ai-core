/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProductType = 
  | 'hop_giay'       // Hộp giấy gập/nắp gài/hộp quà
  | 'thung_carton'   // Thùng carton 3-5-7 lớp
  | 'tui_giay'       // Túi giấy kraft / couche quai dù
  | 'decal_tem'      // Tem nhãn decal giấy, nhựa sữa, xi bạc
  | 'catalogue_card' // Namecard, catalogue, brochure
  | 'khac';

export type PaperMaterial = 
  | 'ivory_300'      // Ivory 300gsm (mỹ phẩm, dược phẩm)
  | 'ivory_350'      // Ivory 350gsm (hộp cứng cáp)
  | 'couche_150'     // Couche 150gsm (tờ rơi, ruột catalogue)
  | 'couche_250'     // Couche 250gsm (bìa catalogue, túi giấy nhẹ)
  | 'couche_300'     // Couche 300gsm (túi giấy cao cấp, namecard)
  | 'duplex_300'     // Duplex 300gsm lưng xám (tiết kiệm)
  | 'duplex_400'     // Duplex 400gsm lưng xám (hộp bánh kẹo, linh kiện)
  | 'kraft_nau_160'  // Kraft Nâu 160gsm (eco packaging)
  | 'kraft_nau_250'  // Kraft Nâu 250gsm (hộp kraft dày)
  | 'carton_e_3lop'  // Carton sóng E 3 lớp (hộp ship COD, hộp pizza)
  | 'carton_b_3lop'  // Carton sóng B 3 lớp (thùng chịu nén tiêu chuẩn)
  | 'carton_ab_5lop' // Carton sóng AB 5 lớp (thùng xuất khẩu nặng)
  | 'decal_giay'     // Decal giấy dán khô
  | 'decal_nhua_sua' // Decal nhựa PVC sữa (chống nước, xé không rách)
  | 'decal_xi_bac';  // Decal xi bạc (tem máy tính, đồ điện tử)

export type PrintTechnology = 
  | 'offset'     // In Offset 4 màu CMYK (chuyên nghiệp số lượng vừa và lớn)
  | 'digital'    // In kỹ thuật số (in nhanh lấy liền, test mẫu, số lượng ít)
  | 'flexo'      // In Flexo cuộn (decal cuộn, thùng số lượng cực lớn)
  | 'screen';    // In lụa thủ công (1-2 màu đơn sắc)

export interface FinishingOptions {
  lamination: 'none' | 'gloss' | 'matte' | 'thermal_anti_scratch'; // Cán màng: Không / Bóng / Mờ / Chống trầy
  hotFoilStamp: boolean;  // Ép kim (Vàng / Bạc)
  foilColor?: 'gold_24k' | 'silver' | 'rose_gold' | 'hologram';
  spotUV: boolean;        // Phủ UV định hình cục bộ
  embossing: boolean;     // Bế nổi / thúc nổi logo
  debossing: boolean;     // Thúc chìm
  dieCutMould: boolean;   // Khuôn bế định hình theo phom
  windowFilm: boolean;    // Dán màng kiếng supor PVC/PET nhìn thấy sản phẩm
  autoGluing: boolean;    // Dán hộp tự động
}

export interface QuoteCalculationInput {
  productType: ProductType;
  dimensions: {
    lengthMm: number;
    widthMm: number;
    heightMm: number;
  };
  material: PaperMaterial;
  printTech: PrintTechnology;
  quantity: number;
  finishing: FinishingOptions;
  hasDesignFile: boolean;
  urgentDelivery?: boolean;
}

export interface QuoteBreakdown {
  paperCost: number;       // Chi phí nguyên vật liệu giấy/carton
  ctpPlateCost: number;    // Chi phí xuất kẽm CTP
  printRunCost: number;    // Công in offset/digital
  laminationCost: number;  // Cán màng
  finishingCost: number;   // Ép kim, UV, bế nổi, cửa sổ
  dieMouldCost: number;    // Tiền làm khuôn bế dao thép
  dieCutAndGluing: number; // Công bế & dán thành phẩm
  designFee: number;       // Phí bình trang / chỉnh file in (nếu chưa có)
  subTotal: number;
  spoilageAllowance: number; // Hao hụt kỹ thuật 5%
  profitMargin: number;    // Biên lợi nhuận
  totalPriceVnd: number;   // Tổng tiền (VND)
  unitPriceVnd: number;    // Đơn giá 1 sản phẩm
  productionDays: number;  // Thời gian sản xuất dự kiến (ngày)
  moqRecommendation?: string; // Khuyên tăng số lượng để giảm đơn giá
}

export type LeadScore = 'COLD' | 'WARM' | 'HOT';

export interface LeadData {
  customer_name: string;
  phone: string;
  product_type: string;
  dimensions: string;
  material: string;
  quantity: number;
  has_design_file: boolean;
  finishing_notes: string;
  status: 'HOT_LEAD' | 'WARM_LEAD' | 'COLD_LEAD';
  address?: string;
  email?: string;
  estimated_value?: number;
  notes?: string;
}

export interface SaveLeadActionPayload {
  action: 'SAVE_LEAD';
  lead_data: LeadData;
}

export interface RouteAlertPayload {
  action: 'ROUTE_ALERT';
  alert_level: 'URGENT_SALES' | 'STANDARD_SALES' | 'MARKETING_ENGAGE';
  lead_id: string;
  intent: string;
  recommended_action: string;
  confidence: number;
  timestamp: string;
}

export interface ScrapedSignal {
  id: string;
  source: 'facebook_comment' | 'messenger_inbox' | 'facebook_group' | 'zalo_oa' | 'webhook';
  authorName: string;
  authorAvatar?: string;
  content: string;
  timestamp: string;
  postTitle?: string;
  score: LeadScore;
  scoreReason: string;
  detectedSpecs: {
    productType?: ProductType;
    dimensions?: string;
    quantity?: number;
    phone?: string;
    hasDesign?: boolean;
  };
  routedAlert?: RouteAlertPayload;
  status: 'pending' | 'contacted' | 'quoted' | 'closed';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  suggestedSpecs?: Partial<QuoteCalculationInput>;
  quoteBreakdown?: QuoteBreakdown;
  exportedPayload?: SaveLeadActionPayload | RouteAlertPayload;
  quickReplies?: string[];
}

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  productName: string;
  quantity: number;
  materialText: string;
  dimensionsText: string;
  stage: 'preflight' | 'ctp_plate' | 'printing' | 'finishing' | 'qc_packing' | 'delivered';
  assignedMachine: string;
  priority: 'normal' | 'high' | 'urgent';
  startDate: string;
  dueDate: string;
  finishingTasks: string[];
  proofApproved: boolean;
  totalAmount: number;
  depositPaid: number;
}

export interface RetentionCustomer {
  id: string;
  name: string;
  company: string;
  phone: string;
  zalo: string;
  email: string;
  packagingCategory: 'cosmetics' | 'food_beverage' | 'fashion' | 'export_produce' | 'pharma';
  lastOrderDate: string;
  cycleDays: number; // chu kỳ dùng hết bao bì (ví dụ: 30 ngày)
  nextReorderExpected: string;
  daysRemaining: number;
  averageBatchQuantity: number;
  usualProduct: string;
  healthScore: 'EXCELLENT' | 'DUE_SOON' | 'OVERDUE_RISK' | 'CHURNED';
  totalLifetimeValue: number;
  lastQuote?: QuoteBreakdown;
  autoReminded: boolean;
}

export interface MarketingContentDraft {
  id: string;
  title: string;
  category: 'packaging_case_study' | 'facebook_ad' | 'technical_guide' | 'b2b_procurement' | 'eco_solution';
  targetAudience: string;
  hook: string;
  body: string;
  specsHighlight: string[];
  cta: string;
  hashtags: string[];
  status: 'draft' | 'scheduled' | 'published';
  scheduledTime?: string;
  socialPlatforms: ('facebook' | 'zalo' | 'tiktok')[];
}

export interface FacebookPageConfig {
  pageId: string;
  pageName: string;
  pageAccessToken: string;
  geminiApiKey: string;
  webhookVerifyToken: string;
  isConnected: boolean;
  connectedAt?: string;
  activeFeatures: {
    autoChatbot: boolean;
    leadScraper: boolean;
    autoPost: boolean;
    reorderReminder: boolean;
  };
  metrics?: {
    followers: number;
    dailyReach: number;
    unreadComments: number;
    activeConversations: number;
  };
}

export interface FacebookWebhookEvent {
  id: string;
  timestamp: string;
  type: 'comment' | 'message' | 'post' | 'leadgen';
  senderName: string;
  senderId: string;
  summary: string;
  rawPayload: any;
  handledByEngine: string;
}
