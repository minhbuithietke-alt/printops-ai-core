/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFlatDimensions, estimateImposition, calculatePackagingQuote } from './pricingEngine.js';

test('calculateFlatDimensions calculates flat box area correctly', () => {
  const result = calculateFlatDimensions('hop_giay', { lengthMm: 100, widthMm: 50, heightMm: 150 });
  // flatL = 2 * (100 + 50) + 20 = 320mm
  // flatW = 150 + 2 * 50 + 15 = 265mm
  assert.equal(result.flatLengthMm, 320);
  assert.equal(result.flatWidthMm, 265);
  assert.ok(result.areaM2 > 0.08);
});

test('estimateImposition fits items onto standard sheet', () => {
  const imposition = estimateImposition(320, 265, 650, 860);
  assert.ok(imposition >= 4);
});

test('calculatePackagingQuote shows unit price drops as quantity increases (Offset curve)', () => {
  const quoteSmall = calculatePackagingQuote({
    productType: 'hop_giay',
    dimensions: { lengthMm: 120, widthMm: 60, heightMm: 180 },
    material: 'ivory_300',
    printTech: 'offset',
    quantity: 500,
    finishing: {
      lamination: 'matte',
      hotFoilStamp: true,
      spotUV: false,
      embossing: false,
      debossing: false,
      dieCutMould: true,
      windowFilm: false,
      autoGluing: true,
    },
    hasDesignFile: true,
  });

  const quoteLarge = calculatePackagingQuote({
    productType: 'hop_giay',
    dimensions: { lengthMm: 120, widthMm: 60, heightMm: 180 },
    material: 'ivory_300',
    printTech: 'offset',
    quantity: 5000,
    finishing: {
      lamination: 'matte',
      hotFoilStamp: true,
      spotUV: false,
      embossing: false,
      debossing: false,
      dieCutMould: true,
      windowFilm: false,
      autoGluing: true,
    },
    hasDesignFile: true,
  });

  assert.ok(quoteSmall.unitPriceVnd > quoteLarge.unitPriceVnd, 'Unit price for 500 units must be significantly higher than 5000 units due to offset fixed setup costs');
  assert.ok(quoteSmall.ctpPlateCost > 0);
  assert.ok(quoteSmall.totalPriceVnd > 0);
});
