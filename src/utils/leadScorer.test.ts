/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeLeadSignal } from './leadScorer.js';

test('analyzeLeadSignal categorizes Cold lead correctly', () => {
  const signal = analyzeLeadSignal('Shop ở đâu vậy? Cho mình xin giá');
  assert.equal(signal.score, 'COLD');
  assert.equal(signal.status, 'pending');
  assert.equal(signal.routedAlert, undefined);
});

test('analyzeLeadSignal categorizes Warm lead when material/specs mentioned', () => {
  const signal = analyzeLeadSignal('Bên xưởng có làm hộp Ivory 350 không ạ? Thời gian làm hàng bao lâu xong?');
  assert.equal(signal.score, 'WARM');
  assert.ok(signal.scoreReason.includes('chất liệu') || signal.scoreReason.includes('thời gian'));
});

test('analyzeLeadSignal detects Hot lead with phone number and dimensions, generating route alert', () => {
  const signal = analyzeLeadSignal('Cần in 2000 hộp mỹ phẩm kích thước 10x15x5cm giấy Ivory 300, alo mình 0908123456');
  assert.equal(signal.score, 'HOT');
  assert.equal(signal.detectedSpecs.quantity, 2000);
  assert.equal(signal.detectedSpecs.phone, '0908123456');
  assert.ok(signal.routedAlert);
  assert.equal(signal.routedAlert?.action, 'ROUTE_ALERT');
  assert.equal(signal.routedAlert?.alert_level, 'URGENT_SALES');
});
