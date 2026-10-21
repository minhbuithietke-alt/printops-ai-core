/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RetentionCustomer } from '../types/printOps';

/**
 * Calculates remaining days in packaging cycle and updates health score
 */
export function evaluateCustomerRetention(
  customer: Omit<RetentionCustomer, 'daysRemaining' | 'healthScore'>
): RetentionCustomer {
  const lastDate = new Date(customer.lastOrderDate);
  const now = new Date();
  
  const diffTime = now.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const daysRemaining = customer.cycleDays - diffDays;

  let healthScore: RetentionCustomer['healthScore'] = 'EXCELLENT';
  if (daysRemaining <= 0 && daysRemaining >= -15) {
    healthScore = 'OVERDUE_RISK';
  } else if (daysRemaining < -15) {
    healthScore = 'CHURNED';
  } else if (daysRemaining <= 7) {
    healthScore = 'DUE_SOON';
  } else {
    healthScore = 'EXCELLENT';
  }

  const expectedDate = new Date(lastDate);
  expectedDate.setDate(expectedDate.getDate() + customer.cycleDays);

  return {
    ...customer,
    daysRemaining,
    healthScore,
    nextReorderExpected: expectedDate.toISOString().split('T')[0],
  };
}

/**
 * Generates an automated VIP re-order retention message for Zalo ZNS / SMS / Email
 */
export function generateRetentionMessage(customer: RetentionCustomer): {
  channel: string;
  subject: string;
  message: string;
  suggestedDiscount: string;
} {
  const isUrgent = customer.daysRemaining <= 3;
  const discountText = customer.totalLifetimeValue > 100000000 ? 'Chiết khấu VIP 7% + Miễn phí kẽm CTP' : 'Chiết khấu 5% + Miễn phí vận chuyển nội thành';

  const message = `[PrintOps Alert] Dạ em chào ${customer.name} - bên ${customer.company || 'mình'} ạ! 
Theo chu kỳ tiêu thụ bao bì định kỳ (${customer.cycleDays} ngày), dự kiến lô hàng "${customer.usualProduct}" (SL ~${customer.averageBatchQuantity.toLocaleString()} cái) của bên mình sẽ sắp dùng hết trong khoảng ${customer.daysRemaining > 0 ? customer.daysRemaining + ' ngày nữa' : 'tuần này'}.

Xưởng in bên em đã lưu sẵn khuôn bế và kẽm CTP cho quy cách cũ của ${customer.name}, nếu mình lên lệnh tái đặt (Re-order) hôm nay:
- Thời gian giao hàng chỉ từ 2-3 ngày (không cần làm lại khuôn).
- Áp dụng ngay ưu đãi định kỳ: ${discountText}.

Dạ ${customer.name} có cần chỉnh sửa thêm chi tiết nào trên file in hoặc thay đổi số lượng đợt này không ạ?`;

  return {
    channel: 'Zalo OA / ZNS',
    subject: `Nhắc lịch đặt in tái bản bao bì định kỳ: ${customer.company}`,
    message,
    suggestedDiscount: discountText,
  };
}
