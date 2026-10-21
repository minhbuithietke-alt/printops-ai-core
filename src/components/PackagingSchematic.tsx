/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Box, Sparkles, Eye, Shield, Tag } from 'lucide-react';
import { QuoteCalculationInput } from '../types/printOps';
import { calculateFlatDimensions, estimateImposition } from '../utils/pricingEngine';

interface PackagingSchematicProps {
  input: QuoteCalculationInput;
}

export const PackagingSchematic: React.FC<PackagingSchematicProps> = ({ input }) => {
  const { dimensions, material, finishing, productType, quantity } = input;
  const { flatLengthMm, flatWidthMm, areaM2 } = calculateFlatDimensions(productType, dimensions);
  const itemsPerSheet = estimateImposition(flatLengthMm, flatWidthMm);

  // Normalize scale for 3D box visualization
  const maxDim = Math.max(dimensions.lengthMm, dimensions.widthMm, dimensions.heightMm, 100);
  const scale = 140 / maxDim;
  const boxW = Math.max(40, Math.min(180, dimensions.lengthMm * scale));
  const boxD = Math.max(30, Math.min(120, dimensions.widthMm * scale));
  const boxH = Math.max(40, Math.min(180, dimensions.heightMm * scale));

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 text-slate-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Mô phỏng Kỹ thuật & Bình trang Khổ in
          </h4>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
          {itemsPerSheet} con / khổ kẽm 65x86cm
        </span>
      </div>

      {/* Isometric 3D Mockup Box container */}
      <div className="relative h-44 bg-slate-950/70 rounded-lg flex items-center justify-center overflow-hidden border border-slate-800/60">
        {/* Grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />

        {/* 3D Box container */}
        <div 
          className="relative transition-all duration-300"
          style={{
            transform: 'rotateX(60deg) rotateZ(-45deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Top Face */}
          <div 
            className="absolute border border-amber-400/50 bg-gradient-to-br from-amber-500/40 to-orange-600/40 flex items-center justify-center text-[10px] font-bold text-amber-200 shadow-sm transition-all"
            style={{
              width: `${boxW}px`,
              height: `${boxD}px`,
              transform: `translateZ(${boxH}px)`,
            }}
          >
            {finishing.hotFoilStamp && (
              <span className="flex items-center gap-1 text-[9px] px-1 py-0.5 bg-yellow-400/30 text-yellow-200 rounded border border-yellow-300/40">
                <Sparkles className="w-2.5 h-2.5 text-yellow-300" /> Foil 24K
              </span>
            )}
            {finishing.windowFilm && (
              <span className="flex items-center gap-0.5 text-[8px] px-1 bg-sky-400/20 text-sky-200 rounded border border-sky-400/30 ml-1">
                <Eye className="w-2 h-2 text-sky-300" /> Kiếng PET
              </span>
            )}
          </div>

          {/* Front Face */}
          <div 
            className="absolute border border-amber-500/40 bg-gradient-to-b from-amber-600/50 to-slate-800/80 flex flex-col items-center justify-center p-1 text-[9px] text-white transition-all"
            style={{
              width: `${boxW}px`,
              height: `${boxH}px`,
              transform: `rotateX(-90deg) translateZ(-${boxD}px)`,
              transformOrigin: 'top',
            }}
          >
            <span className="font-bold text-[10px] text-amber-200">PrintOps</span>
            <span className="text-[8px] text-slate-300">{dimensions.lengthMm} x {dimensions.heightMm} mm</span>
          </div>

          {/* Right Face */}
          <div 
            className="absolute border border-orange-500/40 bg-gradient-to-b from-orange-700/60 to-slate-900/90 flex flex-col items-center justify-center p-1 text-[8px] text-slate-300 transition-all"
            style={{
              width: `${boxD}px`,
              height: `${boxH}px`,
              transform: `rotateY(90deg) translateZ(${boxW - boxD}px)`,
              transformOrigin: 'right',
            }}
          >
            <span>Hông: {dimensions.widthMm}mm</span>
          </div>
        </div>

        {/* Live specs chips overlay */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[200px]">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800/90 text-amber-400 border border-slate-700">
            {dimensions.lengthMm} x {dimensions.widthMm} x {dimensions.heightMm} mm
          </span>
          {finishing.lamination !== 'none' && (
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800/90 text-slate-300 border border-slate-700 flex items-center gap-1">
              <Shield className="w-2.5 h-2.5 text-sky-400" />
              Màng {finishing.lamination === 'gloss' ? 'Bóng' : finishing.lamination === 'matte' ? 'Mờ' : 'Chống trầy'}
            </span>
          )}
          {finishing.spotUV && (
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800/90 text-purple-300 border border-slate-700 flex items-center gap-0.5">
              <Tag className="w-2.5 h-2.5 text-purple-400" /> UV Spot
            </span>
          )}
        </div>

        <div className="absolute bottom-2 right-2 text-right">
          <span className="text-[10px] text-slate-400 font-mono block">
            Trải phẳng: <strong className="text-slate-200">{flatLengthMm} x {flatWidthMm} mm</strong>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Diện tích/con: <strong className="text-amber-400">{(areaM2 * 10000).toFixed(1)} cm²</strong>
          </span>
        </div>
      </div>

      {/* Production Quick Pre-flight Checklist */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
        <div className="bg-slate-800/40 p-2 rounded border border-slate-800 flex flex-col justify-between">
          <span className="text-slate-400">Chất liệu chỉ định:</span>
          <span className="font-semibold text-slate-200 truncate">{material.replace(/_/g, ' ').toUpperCase()}</span>
        </div>
        <div className="bg-slate-800/40 p-2 rounded border border-slate-800 flex flex-col justify-between">
          <span className="text-slate-400">Số lượng / Lô sản xuất:</span>
          <span className="font-semibold text-amber-400 font-mono">{quantity.toLocaleString('vi-VN')} cái</span>
        </div>
      </div>
    </div>
  );
};
