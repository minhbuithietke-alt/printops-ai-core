/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  PenTool, 
  Sparkles, 
  Share2, 
  Copy, 
  Calendar, 
  Check, 
  ThumbsUp, 
  MessageSquare, 
  Layers, 
  FileCheck,
  Send,
  Boxes
} from 'lucide-react';
import { MarketingContentDraft } from '../types/printOps';

interface Engine3CopywriterProps {
  drafts: MarketingContentDraft[];
  onAddDraft: (draft: MarketingContentDraft) => void;
  onSchedulePost: (draft: MarketingContentDraft) => void;
}

export const Engine3Copywriter: React.FC<Engine3CopywriterProps> = ({
  drafts,
  onAddDraft,
  onSchedulePost,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MarketingContentDraft['category']>('packaging_case_study');
  const [targetProduct, setTargetProduct] = useState('Hộp giấy Ivory 350gsm Ép Kim Mỹ Phẩm');
  const [customKeyPoints, setCustomKeyPoints] = useState('Đanh giấy, đứng dáng sắc cạnh, ép kim vàng 24K, phủ UV định hình, test proof màu 24h');
  const [tone, setTone] = useState<'b2b_pro' | 'technical' | 'viral_brand'>('b2b_pro');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDraft, setActiveDraft] = useState<MarketingContentDraft>(drafts[0]);
  const [copied, setCopied] = useState(false);
  const [scheduledSuccess, setScheduledSuccess] = useState(false);

  const handleGenerateContent = () => {
    setIsGenerating(true);

    setTimeout(() => {
      let newTitle = '';
      let newHook = '';
      let newBody = '';
      let specs: string[] = [];
      let cta = '';
      let hashtags: string[] = [];

      if (targetProduct.includes('Ivory') || targetProduct.includes('Mỹ Phẩm')) {
        newTitle = 'Case Study: Cách Nâng Tầm Mỹ Phẩm Gấp 3 Lần Nhờ Hộp Giấy Ivory 350gsm Ép Kim';
        newHook = '🔥 85% khách hàng quyết định nhấc một thỏi son hay hũ kem lên kệ chỉ vì cảm giác "chạm vào vỏ hộp" trong 3 giây đầu tiên!';
        newBody = `Bạn đang đau đầu vì:
❌ Hộp giấy Duplex thông thường mềm nhũn, dễ móp méo khi vận chuyển xa?
❌ Màu in offset bị xỉn, không tái hiện đúng sắc tố thương hiệu?
❌ Đường gấp gãy mép, làm mất đi giá trị sản phẩm cao cấp?

Xưởng In & Bao Bì PrintOps giải quyết triệt để với giải pháp Bao Bì Ivory FBB 350gsm Chuẩn Quốc Tế:
1. Độ láng mịn & trắng sáng 98%: Giúp công nghệ in Offset 4 màu CMYK lên màu rực rỡ, chuẩn từng gradient thiết kế.
2. Gia công Ép Kim Nhũ Vàng 24K (Hot Foil Stamp) công nghệ nhiệt cao, bám chắc không bong tróc.
3. Cán màng mờ Soft-touch nhung mịn, chống bám vân tay và chống nước bề mặt hiệu quả.
4. Bế hộp tự động với dao khuôn laser siêu chuẩn xác, gập nắp nghe tiếng "tách" giòn tan!`;
        specs = ['Giấy Ivory 350gsm', 'Ép kim vàng 24K', 'Cán màng mờ Soft-touch', 'Bế tự động Bobst'];
        cta = '👉 Để lại kích thước (Dài x Rộng x Cao) hoặc nhắn Zalo xưởng để nhận trọn bộ mẫu thực tế & báo giá chiết khấu 15% cho 1.000 hộp đầu tiên!';
        hashtags = ['#InHopMyPham', '#BaoBiCaoCap', '#InOffset', '#GiayIvory', '#EpKimLogo', '#PrintOps'];
      } else if (targetProduct.includes('Carton') || targetProduct.includes('Sầu Riêng') || targetProduct.includes('Nông Sản')) {
        newTitle = 'Tiêu Chuẩn Thùng Carton Sóng AB 5 Lớp Xuất Khẩu Sầu Riêng Sang Trung Quốc & EU';
        newHook = '📦 Sầu riêng xuất khẩu container lạnh bị bẹp mép, dập quả do thùng hút ẩm? Đây là cách xưởng lớn khắc phục!';
        newBody = `Vận chuyển nông sản trong container lạnh nhiệt độ 13-15°C với độ ẩm 90% là bài test khắc nghiệt nhất cho bao bì:

Tại sao các HTX Nông Sản lớn tại Gia Lai & Tây Nguyên chọn Thùng Carton Sóng AB 5 Lớp PrintOps:
- Định lượng giấy Kraft nhập khẩu 175-250gsm, chống bục và chống ẩm 2 mặt cực tốt.
- Sóng đôi AB (7mm) kết hợp ưu điểm: Sóng A chịu độ đàn hồi giảm sốc + Sóng B chịu lực nén đứng chống bẹp thùng (BCT > 700kgf).
- Đột lỗ thông hơi đối xứng giúp đối lưu khí lạnh đều, ngăn ngừa quá nhiệt gây chín ủng sầu riêng.
- In flexo sắc nét, chuẩn mã QR Code truy xuất nguồn gốc hải quan.`;
        specs = ['Sóng AB 5 lớp dày 7mm', 'Chống hút ẩm 90%', 'Chịu lực nén BCT > 700kgf', 'Bế lỗ thoáng khí đối xứng'];
        cta = '📞 Gọi ngay Hotline Giám đốc Kỹ thuật để nhận mẫu thùng test thực tế và lịch giao hàng container trong tuần!';
        hashtags = ['#ThungSauRieng', '#ThungCarton5Lop', '#NongSanGiaLai', '#XuatKhauSauRieng', '#BaoBiTienPhat'];
      } else {
        newTitle = 'Bí Quyết Chọn Túi Giấy Kraft Eco-Friendly Đựng Hàng Thời Trang & F&B';
        newHook = '🌿 Không chỉ là chiếc túi xách, đây là đại sứ thương hiệu xanh của cửa hàng bạn!';
        newBody = `Túi giấy Kraft Nâu 160-180gsm đang là xu hướng áp đảo nhờ:
- Thân thiện môi trường 100%, tự phân hủy sinh học.
- Đáy gia cố bìa cứng chịu tải trọng từ 3 đến 5kg an toàn.
- Quai dù xỏ mắt cáo kim loại vintage, tạo cảm giác sang trọng và lịch sự khi khách xách trên phố.
- Chi phí chỉ từ 2.xxx đ / túi khi in số lượng từ 2.000 cái!`;
        specs = ['Kraft Nhật 160gsm', 'Quai dù xỏ mắt cáo', 'Chịu lực 5kg', 'In 2 màu vintage'];
        cta = 'Nhận ngay báo giá xưởng và mẫu túi miễn phí khi nhắn tin cho Fanpage xưởng!';
        hashtags = ['#TuiGiayKraft', '#TuiShopThoiTrang', '#BaoBiThanThien', '#InTuiGiayGiaRe'];
      }

      const generatedDraft: MarketingContentDraft = {
        id: 'gen_' + Date.now(),
        title: newTitle,
        category: selectedCategory,
        targetAudience: 'Chủ Brand Mỹ phẩm, HTX Nông sản, Chuỗi Shop thời trang',
        hook: newHook,
        body: newBody,
        specsHighlight: specs,
        cta,
        hashtags,
        status: 'draft',
        socialPlatforms: ['facebook', 'zalo'],
      };

      onAddDraft(generatedDraft);
      setActiveDraft(generatedDraft);
      setIsGenerating(false);
    }, 500);
  };

  const handleCopyText = () => {
    const fullText = `${activeDraft.title}\n\n${activeDraft.hook}\n\n${activeDraft.body}\n\n` +
      activeDraft.specsHighlight.map((s) => `✔ ${s}`).join('\n') +
      `\n\n${activeDraft.cta}\n\n${activeDraft.hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSchedule = () => {
    onSchedulePost(activeDraft);
    setScheduledSuccess(true);
    setTimeout(() => setScheduledSuccess(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Engine Header */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Engine 3: Content & Technical Copywriting Engine</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  AI Domain Copywriter
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sáng tạo nội dung truyền thông kỹ thuật in ấn bao bì: Case Study chuyên sâu, B2B Procurement, Post bán hàng Facebook/Zalo
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Generation Controls & Preset Switcher (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Thiết lập Bài viết Truyền thông Bao bì
            </h3>

            {/* Target Product */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Dòng Sản Phẩm Bao Bì Mục Tiêu
              </label>
              <select
                value={targetProduct}
                onChange={(e) => setTargetProduct(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Hộp giấy Ivory 350gsm Ép Kim Mỹ Phẩm">Hộp giấy Ivory 350gsm Ép Kim Mỹ Phẩm</option>
                <option value="Thùng Carton Sóng AB 5 Lớp Xuất Khẩu Sầu Riêng Gia Lai">Thùng Carton Sóng AB 5 Lớp Sầu Riêng Gia Lai</option>
                <option value="Túi Giấy Kraft Nâu Eco-friendly Shop Thời Trang">Túi Giấy Kraft Nâu Quai Dù Shop Thời Trang</option>
                <option value="Tem Decal Nhựa Sữa PVC Chống Nước F&B Đóng Chai">Tem Decal Nhựa Sữa PVC Chống Nước</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Thể Loại Nội Dung
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'packaging_case_study', label: 'Packaging Case Study' },
                  { id: 'b2b_procurement', label: 'Hướng dẫn B2B Kỹ thuật' },
                  { id: 'facebook_ad', label: 'Post Bán hàng & Ưu đãi' },
                  { id: 'technical_guide', label: 'So sánh Chất liệu In' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id as any)}
                    className={`p-2 rounded-lg border text-left font-medium transition cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone of voice */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Giọng Văn (Tone of Voice)
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setTone('b2b_pro')}
                  className={`p-2 rounded-lg border text-center font-medium transition cursor-pointer ${
                    tone === 'b2b_pro'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Chuyên Gia B2B
                </button>
                <button
                  type="button"
                  onClick={() => setTone('technical')}
                  className={`p-2 rounded-lg border text-center font-medium transition cursor-pointer ${
                    tone === 'technical'
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Chuẩn Kỹ Thuật
                </button>
                <button
                  type="button"
                  onClick={() => setTone('viral_brand')}
                  className={`p-2 rounded-lg border text-center font-medium transition cursor-pointer ${
                    tone === 'viral_brand'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Viral Kể Chuyện
                </button>
              </div>
            </div>

            {/* Key Selling Points */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Điểm Nhấn Kỹ Thuật / Lợi Thế Xưởng
              </label>
              <textarea
                rows={3}
                value={customKeyPoints}
                onChange={(e) => setCustomKeyPoints(e.target.value)}
                placeholder="Ví dụ: máy bế tự động sai số <0.1mm, màng chống trầy, xuất kẽm CTP 2400 DPI..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerateContent}
              disabled={isGenerating}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'AI Đang Soạn Thảo Kỹ Thuật...' : 'Tạo Bài Viết Kỹ Thuật Chuyển Đổi Cao'}
            </button>
          </div>

          {/* Library of Drafts */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-2">
            <span className="text-xs font-bold text-slate-300 block mb-2">
              Kho Bài Viết Sẵn Có ({drafts.length}):
            </span>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {drafts.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setActiveDraft(d)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                    activeDraft.id === d.id
                      ? 'bg-purple-950/40 border-purple-500/60 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="font-semibold truncate">{d.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                    <span className="uppercase">{d.category.replace(/_/g, ' ')}</span>
                    <span>• {d.socialPlatforms.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Facebook / Social Card Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Xem Trước Bài Đăng Fanpage Facebook & Zalo OA</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyText}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Đã sao chép' : 'Copy Nội Dung'}
                </button>
                <button
                  onClick={handleSchedule}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold transition shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {scheduledSuccess ? 'Đã Thêm Lịch!' : 'Lên Lịch Đăng (Engine 4)'}
                </button>
              </div>
            </div>

            {/* Mock Facebook Card */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 max-w-xl mx-auto shadow-2xl">
              {/* Post Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-slate-950 text-sm">
                  PO
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white">PrintOps Packaging Studio</span>
                    <span className="w-3 h-3 rounded-full bg-sky-500 text-[8px] flex items-center justify-center text-white">✓</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Vừa xong • 🌐 Công khai</span>
                </div>
              </div>

              {/* Title & Hook */}
              <div className="space-y-2 mb-3 text-xs leading-relaxed">
                <h4 className="font-extrabold text-sm text-amber-300">
                  {activeDraft.title}
                </h4>
                <p className="font-semibold text-rose-300 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                  {activeDraft.hook}
                </p>
                <div className="text-slate-200 whitespace-pre-line text-xs space-y-2">
                  {activeDraft.body}
                </div>
              </div>

              {/* Specs Pills Highlight */}
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 my-3">
                <span className="text-[11px] font-bold text-amber-400 block mb-1.5">
                  ⭐ Thông số Kỹ thuật Nổi bật:
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {activeDraft.specsHighlight.map((spec, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                      <FileCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call to action & hashtags */}
              <div className="space-y-2 text-xs">
                <p className="font-bold text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                  {activeDraft.cta}
                </p>
                <div className="flex flex-wrap gap-1">
                  {activeDraft.hashtags.map((tag, idx) => (
                    <span key={idx} className="text-sky-400 font-medium text-[11px]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Social interaction footer */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-slate-400 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white">👍</span>
                  <span className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center text-[10px] text-white">❤️</span>
                  <span className="text-[11px]">142 lượt thích</span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span>28 bình luận</span>
                  <span>14 chia sẻ</span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-around text-slate-400 text-xs">
                <button className="flex items-center gap-1.5 hover:text-white py-1">
                  <ThumbsUp className="w-3.5 h-3.5" /> Thích
                </button>
                <button className="flex items-center gap-1.5 hover:text-white py-1">
                  <MessageSquare className="w-3.5 h-3.5" /> Bình luận
                </button>
                <button className="flex items-center gap-1.5 hover:text-white py-1">
                  <Share2 className="w-3.5 h-3.5" /> Chia sẻ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
