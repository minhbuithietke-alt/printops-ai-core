/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuoteCalculationInput, QuoteBreakdown, PaperMaterial } from '../types/printOps';

// Base paper sheet prices in VND (based on standard Vietnamese printing market)
const MATERIAL_SHEET_RATES: Record<PaperMaterial, { name: string; costPerSheet: number; sheetSize: string }> = {
  ivory_300: { name: 'Giấy Ivory 300gsm (FBB trắng mịn 2 mặt)', costPerSheet: 3600, sheetSize: '65 x 86 cm' },
  ivory_350: { name: 'Giấy Ivory 350gsm (Dày cao cấp, đứng phom)', costPerSheet: 4300, sheetSize: '65 x 86 cm' },
  couche_150: { name: 'Giấy Couche 150gsm (Láng 2 mặt)', costPerSheet: 1900, sheetSize: '65 x 86 cm' },
  couche_250: { name: 'Giấy Couche 250gsm (Cứng vừa)', costPerSheet: 2900, sheetSize: '65 x 86 cm' },
  couche_300: { name: 'Giấy Couche 300gsm (Dày, in màu rực)', costPerSheet: 3500, sheetSize: '65 x 86 cm' },
  duplex_300: { name: 'Giấy Duplex 300gsm (Lưng xám tiết kiệm)', costPerSheet: 2500, sheetSize: '79 x 109 cm' },
  duplex_400: { name: 'Giấy Duplex 400gsm (Dày chịu lực)', costPerSheet: 3400, sheetSize: '79 x 109 cm' },
  kraft_nau_160: { name: 'Giấy Kraft Nâu Nhật 160gsm (Bảo vệ môi trường)', costPerSheet: 2200, sheetSize: '65 x 86 cm' },
  kraft_nau_250: { name: 'Giấy Kraft Nâu 250gsm (Hộp Kraft đứng dáng)', costPerSheet: 3100, sheetSize: '65 x 86 cm' },
  carton_e_3lop: { name: 'Carton Sóng E 3 lớp (1.5mm cứng cáp ship COD)', costPerSheet: 4800, sheetSize: 'Khổ tấm bế' },
  carton_b_3lop: { name: 'Carton Sóng B 3 lớp (2.5mm chịu va đập)', costPerSheet: 5500, sheetSize: 'Khổ tấm bế' },
  carton_ab_5lop: { name: 'Carton Sóng AB 5 lớp (Xuất khẩu chịu lực lớn)', costPerSheet: 9200, sheetSize: 'Khổ tấm bế' },
  decal_giay: { name: 'Decal Giấy (Đế vàng/trắng có keo sẵn)', costPerSheet: 1400, sheetSize: '33 x 48 cm' },
  decal_nhua_sua: { name: 'Decal Nhựa PVC Sữa (Chống nước 100%, không rách)', costPerSheet: 3200, sheetSize: '33 x 48 cm' },
  decal_xi_bac: { name: 'Decal Xi Bạc / Nhôm (Tem điện tử, máy móc)', costPerSheet: 4800, sheetSize: '33 x 48 cm' },
};

/**
 * Approximate flat layout dimensions for a folding carton box (Dài x Rộng x Cao)
 * Flat Length = 2 * (Length + Width) + Glued Edge (15-20mm) + Bleed (4mm)
 * Flat Width = Height + 2 * Width (Top lid + Bottom flaps) + Bleed (4mm)
 */
export function calculateFlatDimensions(
  productType: string,
  dim: { lengthMm: number; widthMm: number; heightMm: number }
): { flatLengthMm: number; flatWidthMm: number; areaM2: number } {
  let flatL = 0;
  let flatW = 0;

  if (productType === 'hop_giay' || productType === 'thung_carton') {
    flatL = 2 * (dim.lengthMm + dim.widthMm) + 20; // 20mm mép dán
    flatW = dim.heightMm + 2 * dim.widthMm + 15; // tai gài nắp + đáy
  } else if (productType === 'tui_giay') {
    flatL = 2 * (dim.lengthMm + dim.widthMm) + 30; // hông túi + mép dán
    flatW = dim.heightMm + dim.widthMm * 0.7 + 40; // đáy túi + miệng gập
  } else if (productType === 'decal_tem') {
    flatL = dim.lengthMm + 4; // bù xén 2mm mỗi bên
    flatW = dim.widthMm + 4;
  } else {
    flatL = dim.lengthMm + 4;
    flatW = dim.widthMm + 4;
  }

  // Ensure minimum dimensions
  flatL = Math.max(30, flatL);
  flatW = Math.max(30, flatW);

  const areaM2 = (flatL * flatW) / 1000000;
  return { flatLengthMm: flatL, flatWidthMm: flatW, areaM2 };
}

/**
 * Calculates item imposition (số con trên 1 khổ in tiêu chuẩn 650x860mm hoặc tương đương)
 */
export function estimateImposition(
  flatL: number,
  flatW: number,
  sheetL = 650,
  sheetW = 860
): number {
  if (flatL <= 0 || flatW <= 0) return 1;

  // Rotation 1: Sheet L vs Item L
  const fit1 = Math.floor(sheetL / flatL) * Math.floor(sheetW / flatW);
  // Rotation 2: Sheet L vs Item W
  const fit2 = Math.floor(sheetL / flatW) * Math.floor(sheetW / flatL);

  const bestFit = Math.max(fit1, fit2);
  return Math.max(1, Math.min(bestFit, 40)); // Cap reasonable items per sheet
}

/**
 * Pure calculation function for packaging quote estimation
 */
export function calculatePackagingQuote(input: QuoteCalculationInput): QuoteBreakdown {
  const { productType, dimensions, material, printTech, quantity, finishing, hasDesignFile } = input;
  const qty = Math.max(1, quantity);

  // 1. Flat Dimensions & Imposition
  const { flatLengthMm, flatWidthMm, areaM2 } = calculateFlatDimensions(productType, dimensions);
  const itemsPerSheet = estimateImposition(flatLengthMm, flatWidthMm);
  const rawSheetsNeeded = Math.ceil(qty / itemsPerSheet);

  // Spoilage calculation (Bù hao canh bài in offset: ~120 tờ cho chuẩn bị máy + 2% số lượng)
  const spoilageSheets = printTech === 'offset' 
    ? Math.min(250, Math.max(80, Math.round(rawSheetsNeeded * 0.04 + 70)))
    : Math.max(10, Math.round(rawSheetsNeeded * 0.02 + 5));

  const totalSheetsNeeded = rawSheetsNeeded + spoilageSheets;

  // 2. Paper Cost
  const matInfo = MATERIAL_SHEET_RATES[material] || MATERIAL_SHEET_RATES.ivory_300;
  const paperCost = totalSheetsNeeded * matInfo.costPerSheet;

  // 3. CTP Plate / Pre-press Cost
  let ctpPlateCost = 0;
  if (printTech === 'offset') {
    // 4 CTP plates (C, M, Y, K) ~ 90,000 VND / plate
    ctpPlateCost = 360000;
  } else if (printTech === 'flexo') {
    ctpPlateCost = 450000; // Bản polymer
  } else {
    ctpPlateCost = 50000; // File RIP xử lý digital
  }

  // 4. Print Run Cost
  let printRunCost = 0;
  if (printTech === 'offset') {
    // Make-ready fee (phí mở máy 1,000 lượt đầu) = 650,000 VND, sau đó 140,000 VND / 1,000 lượt
    const runs = totalSheetsNeeded;
    if (runs <= 1000) {
      printRunCost = 650000;
    } else {
      printRunCost = 650000 + Math.ceil((runs - 1000) / 1000) * 140000;
    }
  } else if (printTech === 'digital') {
    // Digital fast printing per sheet (A3+): 3,500 VND / sheet
    printRunCost = totalSheetsNeeded * 3500;
  } else {
    printRunCost = Math.max(400000, totalSheetsNeeded * 1200);
  }

  // 5. Finishing Costs
  let laminationCost = 0;
  if (finishing.lamination !== 'none') {
    const ratePerM2 = finishing.lamination === 'gloss' 
      ? 550 
      : finishing.lamination === 'matte' 
        ? 650 
        : 1200; // thermal anti-scratch
    const totalAreaM2 = totalSheetsNeeded * ((650 * 860) / 1000000);
    // Minimum lamination run = 180,000 VND
    laminationCost = Math.max(180000, Math.round(totalAreaM2 * ratePerM2));
  }

  let finishingCost = 0;
  // Hot foil stamping
  if (finishing.hotFoilStamp) {
    const foilMouldCost = 350000; // Khuôn đồng ép kim
    const foilStampRun = qty * 350; // Công ép kim từng con
    finishingCost += (foilMouldCost + Math.max(150000, foilStampRun));
  }
  // Spot UV
  if (finishing.spotUV) {
    const uvScreenCost = 280000; // Khuôn lụa UV
    const uvRun = qty * 400;
    finishingCost += (uvScreenCost + Math.max(180000, uvRun));
  }
  // Embossing / Bế nổi
  if (finishing.embossing || finishing.debossing) {
    const embossMould = 300000; // Khuôn dập nổi
    const embossRun = qty * 250;
    finishingCost += (embossMould + Math.max(120000, embossRun));
  }
  // Window film / Cửa sổ kiếng PVC
  if (finishing.windowFilm) {
    const filmCost = qty * 450 + 150000;
    finishingCost += filmCost;
  }

  // 6. Die-cut Mould & Cutting/Gluing
  let dieMouldCost = 0;
  let dieCutAndGluing = 0;

  if (finishing.dieCutMould || productType === 'hop_giay' || productType === 'thung_carton' || productType === 'tui_giay') {
    // Laser wooden cutting die
    dieMouldCost = productType === 'thung_carton' ? 550000 : 380000;
    // Die cutting run cost
    const cutRun = Math.max(250000, totalSheetsNeeded * 200);
    // Folding & Gluing cost
    const glueRun = finishing.autoGluing ? qty * 200 : qty * 350;
    dieCutAndGluing = cutRun + glueRun;
  } else if (productType === 'decal_tem') {
    // Bế demi tem decal
    dieMouldCost = 250000;
    dieCutAndGluing = Math.max(150000, qty * 60);
  } else {
    // Cắt xén thẳng
    dieCutAndGluing = 100000;
  }

  // 7. Design Pre-flight fee
  const designFee = hasDesignFile ? 0 : 250000; // Tiền thiết kế / chỉnh file vector

  // 8. Totals & Margins
  const subTotal = paperCost + ctpPlateCost + printRunCost + laminationCost + finishingCost + dieMouldCost + dieCutAndGluing + designFee;
  const spoilageAllowance = Math.round(subTotal * 0.05);
  // Tiered profit margin: small qty has higher margin to cover operational overhead
  const marginRate = qty < 500 ? 0.32 : qty < 2000 ? 0.25 : 0.18;
  const profitMargin = Math.round((subTotal + spoilageAllowance) * marginRate);

  const totalPriceVnd = Math.round(subTotal + spoilageAllowance + profitMargin);
  const unitPriceVnd = Math.round(totalPriceVnd / qty);

  // 9. Production Days Estimate
  let productionDays = 4;
  if (printTech === 'digital' && qty <= 500 && !finishing.hotFoilStamp && !finishing.spotUV) {
    productionDays = 1;
  } else if (finishing.hotFoilStamp || finishing.spotUV || finishing.embossing) {
    productionDays = 5;
  } else if (qty > 10000) {
    productionDays = 7;
  }
  if (input.urgentDelivery) {
    productionDays = Math.max(1, productionDays - 2);
  }

  // Recommendation on quantity curve
  let moqRecommendation: string | undefined;
  if (qty < 1000 && printTech === 'offset') {
    const doubleQty = qty * 2;
    const testDoubleInput = { ...input, quantity: doubleQty };
    const doubleCalc = calculatePackagingQuote(testDoubleInput);
    const savingPercent = Math.round((1 - doubleCalc.unitPriceVnd / unitPriceVnd) * 100);
    if (savingPercent > 15) {
      moqRecommendation = `Khuyên tăng lên ${doubleQty.toLocaleString('vi-VN')} cái: Đơn giá giảm ${savingPercent}% (từ ${unitPriceVnd.toLocaleString('vi-VN')}đ xuống còn ${doubleCalc.unitPriceVnd.toLocaleString('vi-VN')}đ/cái) do tối ưu tiền mở máy và kẽm CTP!`;
    }
  }

  return {
    paperCost,
    ctpPlateCost,
    printRunCost,
    laminationCost,
    finishingCost,
    dieMouldCost,
    dieCutAndGluing,
    designFee,
    subTotal,
    spoilageAllowance,
    profitMargin,
    totalPriceVnd,
    unitPriceVnd,
    productionDays,
    moqRecommendation,
  };
}
