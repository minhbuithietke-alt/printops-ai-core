/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LeadScore, ScrapedSignal, RouteAlertPayload, ProductType } from '../types/printOps';

/**
 * Regex patterns for Vietnamese phone numbers
 * e.g., 0903123456, 098.123.4567, 091-234-5678, (+84) 90...
 */
const PHONE_REGEX = /(?:(?:\+84)|0)(?:3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5|8|9]|9[0-9])[0-9\s.-]{7,10}/;

/**
 * Regex for quantities (e.g., "1000 cái", "5.000 hộp", "10k túi", "2000c", "500 pcs")
 */
const QTY_REGEX = /(\d{1,3}(?:[.,]\d{3})*|\d+)\s*(?:k|nghìn|ngan)?\s*(?:cái|hop|hộp|túi|tui|tem|nhãn|con|bộ|bo|thùng|thung|c|pcs|chiếc)/i;

/**
 * Regex for dimensions (e.g. "10x15x5", "10*20*5 cm", "đường kính 5cm", "25 x 35")
 */
const DIM_REGEX = /(\d{1,3}(?:[.,]\d+)?)\s*(?:x|\*)\s*(\d{1,3}(?:[.,]\d+)?)(?:\s*(?:x|\*)\s*(\d{1,3}(?:[.,]\d+)?))?\s*(cm|mm|m)?/i;

/**
 * Analyzes comment / inbox text to extract lead signals and score priority
 */
export function analyzeLeadSignal(rawText: string, authorName = 'Khách hàng', source: ScrapedSignal['source'] = 'facebook_comment'): ScrapedSignal {
  const lowerText = rawText.toLowerCase();

  // 1. Phone extraction
  const phoneMatch = rawText.match(PHONE_REGEX);
  const detectedPhone = phoneMatch ? phoneMatch[0].replace(/[\s.-]/g, '') : undefined;

  // 2. Quantity extraction
  let detectedQty: number | undefined;
  const qtyMatch = rawText.match(QTY_REGEX);
  if (qtyMatch) {
    let numStr = qtyMatch[1].replace(/[.,]/g, '');
    let baseNum = parseInt(numStr, 10);
    if (/k|nghìn|ngan/i.test(qtyMatch[0])) {
      baseNum *= 1000;
    }
    if (!isNaN(baseNum)) {
      detectedQty = baseNum;
    }
  }

  // Fallback for standalone "10000" or "5000"
  if (!detectedQty) {
    const rawNumberMatch = rawText.match(/\b([1-9]\d{2,5})\b/);
    if (rawNumberMatch) {
      detectedQty = parseInt(rawNumberMatch[1], 10);
    }
  }

  // 3. Dimension extraction
  let detectedDimensions: string | undefined;
  const dimMatch = rawText.match(DIM_REGEX);
  if (dimMatch) {
    detectedDimensions = dimMatch[0];
  }

  // 4. Product Type detection
  let detectedProductType: ProductType = 'khac';
  if (/hộp|hop|cứng|nam châm|nap gai|nắp gài/i.test(lowerText)) {
    detectedProductType = 'hop_giay';
  } else if (/carton|thùng|thung|song e|sóng b/i.test(lowerText)) {
    detectedProductType = 'thung_carton';
  } else if (/túi|tui|quai dù/i.test(lowerText)) {
    detectedProductType = 'tui_giay';
  } else if (/decal|tem|nhãn|nhan|sticker/i.test(lowerText)) {
    detectedProductType = 'decal_tem';
  } else if (/card|danh thiếp|catalogue|brochure|tờ rơi/i.test(lowerText)) {
    detectedProductType = 'catalogue_card';
  }

  // 5. File design check
  const hasDesign = /đã có file|co file|file ai|file pdf|file in|sẵn file|thiết kế xong/i.test(lowerText);

  // 6. Urgency markers
  const isUrgent = /gấp|gap|hôm nay|mai giao|cần liền|kịp khai trương|tiến độ/i.test(lowerText);

  // 7. Scoring algorithm based on strict domain rules:
  // HOT: Comment kèm kích thước cụ thể, số lượng lớn (>1.000 cái), để lại SĐT hoặc file in, hỏi tiến độ gấp
  // WARM: Hỏi về chất liệu, thời gian làm hàng, chi phí sơ bộ
  // COLD: Hỏi chung chung ("shop ở đâu", "ib", "giá bn", "chấm", ".")
  let score: LeadScore = 'COLD';
  let scoreReason = '';

  const hasPhone = Boolean(detectedPhone);
  const isBulkQty = detectedQty ? detectedQty >= 1000 : false;
  const hasDims = Boolean(detectedDimensions);
  const mentionsMaterial = /ivory|kraft|duplex|couche|carton|sóng|màng bóng|màng mờ|ép kim|uv/i.test(lowerText);
  const mentionsLeadTime = /mấy ngày|khi nào có|thời gian|bao lâu|làm hàng/i.test(lowerText);
  const mentionsPriceGeneral = /giá|bao nhiêu|ib|inbox|tư vấn|báo giá/i.test(lowerText);

  // Hot conditions
  if (hasPhone || (isBulkQty && hasDims) || (hasDims && hasDesign) || (isBulkQty && isUrgent)) {
    score = 'HOT';
    scoreReason = `Tín hiệu chốt đơn cao: ${hasPhone ? 'Có SĐT, ' : ''}${isBulkQty ? `Số lượng lớn (${detectedQty?.toLocaleString()} cái), ` : ''}${hasDims ? `Kích thước cụ thể (${detectedDimensions}), ` : ''}${hasDesign ? 'Đã có file in vector, ' : ''}${isUrgent ? 'Cần tiến độ gấp' : ''}`.replace(/,\s*$/, '');
  } else if (mentionsMaterial || mentionsLeadTime || hasDims || (detectedQty && detectedQty >= 300) || hasDesign) {
    score = 'WARM';
    scoreReason = `Khách hàng có nhu cầu thật: ${mentionsMaterial ? 'Hỏi thông số chất liệu, ' : ''}${hasDims ? 'Có kích thước, ' : ''}${mentionsLeadTime ? 'Hỏi thời gian làm hàng, ' : ''}${detectedQty ? `SL ${detectedQty} cái` : ''}`.replace(/,\s*$/, '');
  } else {
    score = 'COLD';
    scoreReason = 'Tương tác chung chung, chưa cung cấp thông số kỹ thuật bao bì.';
  }

  const signalId = 'sig_' + Math.random().toString(36).substring(2, 9);

  // Generate Route Alert if HOT
  let routedAlert: RouteAlertPayload | undefined;
  if (score === 'HOT') {
    let intentDesc = 'IN_AN_BAO_BI_GAP';
    if (detectedProductType === 'hop_giay') intentDesc = isBulkQty ? 'IN_HOP_MY_PHAM_SO_LUONG_LON' : 'IN_HOP_GIAY_GAP';
    else if (detectedProductType === 'thung_carton') intentDesc = 'DAT_THUNG_CARTON_XUAT_KHAU';
    else if (detectedProductType === 'tui_giay') intentDesc = 'DAT_TUI_GIAY_THOI_TRANG';
    else if (detectedProductType === 'decal_tem') intentDesc = 'IN_TEM_DECAL_CUON_SO_LUONG_LON';

    routedAlert = {
      action: 'ROUTE_ALERT',
      alert_level: 'URGENT_SALES',
      lead_id: signalId,
      intent: intentDesc,
      recommended_action: hasPhone 
        ? `GỌI ĐIỆN TƯ VẤN NGAY TRONG 5 PHÚT (SĐT: ${detectedPhone})` 
        : 'INBOX GỬI BẢNG GIÁ CHIẾT KHẤU & XIN SỐ ĐIỆN THOẠI KHÁCH',
      confidence: hasPhone ? 0.98 : 0.88,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    id: signalId,
    source,
    authorName,
    content: rawText,
    timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    score,
    scoreReason,
    detectedSpecs: {
      productType: detectedProductType,
      dimensions: detectedDimensions,
      quantity: detectedQty,
      phone: detectedPhone,
      hasDesign,
    },
    routedAlert,
    status: 'pending',
  };
}
