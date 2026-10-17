import React, { useState } from 'react';
import { ElementData } from '../types/chemistry';
import { CATEGORY_COLORS } from '../data/elements';
import { FAMOUS_SCIENTISTS, DISCOVERY_ERAS } from '../data/scientists';
import { 
  BookOpen, Scale, ArrowRight, ShieldCheck, 
  Layers, Sparkles, Check, Atom, Flame, HelpCircle,
  GraduationCap, Calendar, Search, Award, Volume2
} from 'lucide-react';
import { speakElementName, stopSpeech } from '../utils/speech';

interface KnowledgeBaseProps {
  elements: ElementData[];
  onSelectElement: (el: ElementData) => void;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ elements, onSelectElement }) => {
  const [activeTopic, setActiveTopic] = useState<'trends' | 'compare' | 'scientists' | 'orbitals' | 'safety'>('scientists');

  // Element comparison states
  const [elem1Number, setElem1Number] = useState<number>(11); // Na
  const [elem2Number, setElem2Number] = useState<number>(17); // Cl

  // Scientist search filter state
  const [scientistFilter, setScientistFilter] = useState<string>('');
  const [selectedEra, setSelectedEra] = useState<string>('all');
  const [speakingNumber, setSpeakingNumber] = useState<number | null>(null);

  const handleSpeak = (text: string, lang: 'en' | 'vi', num: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (speakingNumber === num) {
      stopSpeech();
      setSpeakingNumber(null);
      return;
    }
    speakElementName(
      text,
      lang,
      () => setSpeakingNumber(num),
      () => setSpeakingNumber(null)
    );
  };

  const elem1 = elements.find((e) => e.number === elem1Number) || elements[0];
  const elem2 = elements.find((e) => e.number === elem2Number) || elements[16];

  // Map element by number for quick lookup
  const elementMap = new Map<number, ElementData>();
  elements.forEach((e) => elementMap.set(e.number, e));

  const filteredScientists = FAMOUS_SCIENTISTS.filter((s) => {
    const matchesText = 
      s.name.toLowerCase().includes(scientistFilter.toLowerCase()) ||
      s.descriptionVi.toLowerCase().includes(scientistFilter.toLowerCase()) ||
      s.elementsDiscovered.some((ed) => 
        ed.nameVi.toLowerCase().includes(scientistFilter.toLowerCase()) ||
        ed.symbol.toLowerCase().includes(scientistFilter.toLowerCase())
      );
    return matchesText;
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Selector Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Kho Tri Thức & Lịch Sử Khám Phá Hóa Học</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Cẩm Nang Hóa Học & Các Nhà Khoa Học</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTopic('scientists')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
              activeTopic === 'scientists'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-cyan-300" />
            <span>Nhà khoa học & Lịch sử ({FAMOUS_SCIENTISTS.length})</span>
          </button>
          <button
            onClick={() => setActiveTopic('trends')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
              activeTopic === 'trends'
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Quy luật tuần hoàn
          </button>
          <button
            onClick={() => setActiveTopic('compare')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
              activeTopic === 'compare'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>So sánh 2 nguyên tố</span>
          </button>
          <button
            onClick={() => setActiveTopic('orbitals')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
              activeTopic === 'orbitals'
                ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Cấu trúc Orbital s/p/d/f
          </button>
          <button
            onClick={() => setActiveTopic('safety')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
              activeTopic === 'safety'
                ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            An toàn phòng thí nghiệm
          </button>
        </div>
      </div>

      {/* TOPIC 0: SCIENTISTS & DISCOVERY HISTORY OF ELEMENTS */}
      {activeTopic === 'scientists' && (
        <div className="flex flex-col gap-6">
          {/* Historical Discovery Eras Timeline Cards */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Biên Niên Sử Các Thời Kỳ Khám Phá 118 Nguyên Tố Hóa Học</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">118 Nguyên Tố Hoàn Thiện</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
              {DISCOVERY_ERAS.map((era) => (
                <div
                  key={era.id}
                  className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-300">{era.titleVi}</span>
                      <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30">
                        {era.elementCount} nguyên tố
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-mono block mt-1">{era.timeRange}</span>
                    <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                      {era.descriptionVi}
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium pt-2 border-t border-slate-800/80 mt-2">
                    Tiêu biểu: <span className="text-slate-300">{era.keyScientists.slice(0, 2).join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Famous Scientists Gallery Header & Search Filter */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-400" />
                  <span>Các Nhà Khoa Học Tiên Phong Tìm Ra Nguyên Tố</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Khám phá cuộc đời, phương pháp nghiên cứu và danh sách các nguyên tố do từng nhà bác học phát hiện.
                </p>
              </div>

              {/* Filter input */}
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={scientistFilter}
                  onChange={(e) => setScientistFilter(e.target.value)}
                  placeholder="Tìm theo tên nhà khoa học hoặc nguyên tố..."
                  className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl pl-8 pr-3 py-2 border border-slate-800 outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Grid of Scientist Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredScientists.map((s) => (
                <div
                  key={s.id}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between gap-3 shadow-lg group"
                >
                  <div className="flex flex-col gap-2.5">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2 rounded-xl bg-slate-900 border border-slate-800">
                          {s.avatarIcon}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                            {s.name}
                          </h4>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                            <span>{s.nationality}</span>
                            <span>•</span>
                            <span>{s.years}</span>
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 whitespace-nowrap">
                        {s.elementsDiscovered.length} nguyên tố
                      </span>
                    </div>

                    {/* Scientific Significance */}
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                      {s.descriptionVi}
                    </p>

                    <div className="text-[11px] text-amber-300/90 font-medium">
                      ★ {s.historicalSignificance}
                    </div>
                  </div>

                  {/* Elements Discovered Pills */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">
                      Các nguyên tố đã tìm ra (nhấp để xem chi tiết 3D):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {s.elementsDiscovered.map((ed) => {
                        const targetEl = elementMap.get(ed.number);
                        const catStyle = targetEl ? CATEGORY_COLORS[targetEl.category] : null;
                        return (
                          <div
                            key={ed.number}
                            className={`px-2 py-1 rounded-lg text-xs font-mono transition flex items-center gap-1.5 border ${
                              catStyle
                                ? `${catStyle.bg} ${catStyle.border} shadow-sm`
                                : 'bg-slate-900 text-slate-300 border-slate-700'
                            }`}
                          >
                            <span
                              onClick={() => {
                                if (targetEl) onSelectElement(targetEl);
                              }}
                              className="cursor-pointer hover:underline flex items-center gap-1"
                              title={`Xem mô hình 3D và thông tin khoa học nguyên tố ${ed.nameVi}`}
                            >
                              <b className="text-white">{ed.symbol}</b>
                              <span className="text-[11px] font-sans text-slate-300">{ed.nameVi}</span>
                              <span className="text-[10px] text-slate-400 font-mono font-normal">({ed.year})</span>
                            </span>

                            {ed.nameEn && (
                              <button
                                onClick={(e) => handleSpeak(ed.nameEn!, 'en', ed.number, e)}
                                title={`Nghe phát âm tên khoa học IUPAC: ${ed.nameEn}`}
                                className={`p-0.5 rounded text-slate-400 hover:text-white transition ${
                                  speakingNumber === ed.number ? 'text-cyan-400 animate-pulse' : ''
                                }`}
                              >
                                <Volume2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TOPIC 1: PERIODIC TRENDS */}
      {activeTopic === 'trends' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400" />
              <span>1. Quy luật Bán Kính Nguyên Tử (Atomic Radius)</span>
            </h3>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 flex flex-col gap-2">
              <p>
                <b>Trong một Chu kỳ (từ trái qua phải):</b> Bán kính nguyên tử <b>giảm dần</b>. Do số lớp electron không đổi nhưng điện tích hạt nhân Z tăng, lực hút tĩnh điện giữa hạt nhân và electron lớp ngoài cùng tăng làm bán kính co lại.
              </p>
              <p>
                <b>Trong một Nhóm A (từ trên xuống dưới):</b> Bán kính nguyên tử <b>tăng dần</b>. Do số lớp electron tăng dần, electron lớp ngoài cùng ở xa hạt nhân hơn và bị các lớp trong chắn bớt lực hút.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-400" />
              <span>2. Quy luật Độ Âm Điện (Electronegativity)</span>
            </h3>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 flex flex-col gap-2">
              <p>
                <b>Định nghĩa:</b> Thước đo định lượng khả năng hút cặp electron dùng chung của nguyên tử khi hình thành liên kết hóa học.
              </p>
              <p>
                <b>Trong Chu kỳ:</b> Tăng dần từ trái sang phải (nguyên tố có độ âm điện lớn nhất là Flo với giá trị 3.98 theo thang Pauling).
              </p>
              <p>
                <b>Trong Nhóm A:</b> Giảm dần từ trên xuống dưới (Xesi và Franxi có độ âm điện nhỏ nhất ~0.7).
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span>3. Tính Kim Loại & Tính Phi Kim</span>
            </h3>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 flex flex-col gap-2">
              <p>
                <b>Tính kim loại:</b> Là tính chất dễ nhường electron (tính khử). Trong một chu kỳ, tính kim loại giảm dần từ trái sang phải; trong một nhóm, tăng dần từ trên xuống dưới.
              </p>
              <p>
                <b>Tính phi kim:</b> Là tính chất dễ nhận electron (tính oxi hóa). Trong một chu kỳ, tính phi kim tăng dần từ trái sang phải; trong một nhóm, giảm dần từ trên xuống dưới.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span>4. Năng Lượng Ion Hóa Thứ Nhất (I₁)</span>
            </h3>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 flex flex-col gap-2">
              <p>
                <b>Định nghĩa:</b> Năng lượng tối thiểu cần thiết để bứt 1 electron liên kết yếu nhất ra khỏi một nguyên tử trung hòa ở trạng thái khí cơ bản: X(k) → X⁺(k) + 1e⁻.
              </p>
              <p>
                <b>Quy luật:</b> Thường tăng dần theo chu kỳ (khí hiếm có I₁ cực đại vì có cấu hình bền vững ns²np⁶) và giảm dần trong nhóm từ trên xuống dưới.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TOPIC 2: ELEMENT COMPARATOR */}
      {activeTopic === 'compare' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">So Sánh Trực Quan Giữa Hai Nguyên Tố</h3>
              <p className="text-xs text-slate-400">Chọn 2 nguyên tố bất kỳ để khảo sát mối tương quan tính chất:</p>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={elem1Number}
                onChange={(e) => setElem1Number(parseInt(e.target.value, 10))}
                className="bg-slate-950 text-slate-200 border border-slate-700 text-xs rounded-xl px-3 py-2 outline-none"
              >
                {elements.map((el) => (
                  <option key={el.number} value={el.number}>
                    {el.number}. {el.nameVi} ({el.symbol})
                  </option>
                ))}
              </select>

              <span className="font-bold text-cyan-400 text-sm">VS</span>

              <select
                value={elem2Number}
                onChange={(e) => setElem2Number(parseInt(e.target.value, 10))}
                className="bg-slate-950 text-slate-200 border border-slate-700 text-xs rounded-xl px-3 py-2 outline-none"
              >
                {elements.map((el) => (
                  <option key={el.number} value={el.number}>
                    {el.number}. {el.nameVi} ({el.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl border ${CATEGORY_COLORS[elem1.category].badge}`}>
                  {elem1.symbol}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{elem1.nameVi} ({elem1.nameEn})</h4>
                  <span className="text-xs text-slate-400 font-mono">Z = {elem1.number} | {CATEGORY_COLORS[elem1.category].nameVi}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 font-mono text-xs mt-2 divide-y divide-slate-800/80">
                <div className="flex justify-between py-1.5"><span className="text-slate-400">Chu kỳ & Nhóm:</span><b>Chu kỳ {elem1.period}, Nhóm {elem1.group ?? 'Lantan/Actini'}</b></div>
                <div className="flex justify-between py-1.5"><span className="text-slate-400">Khối lượng nguyên tử:</span><b>{elem1.atomicMass} u</b></div>
                <div className="flex justify-between py-1.5"><span className="text-slate-400">Cấu hình electron:</span><b className="text-cyan-400">{elem1.electronConfiguration}</b></div>
                <div className="flex justify-between py-1.5"><span className="text-slate-400">Độ âm điện:</span><b className="text-amber-400">{elem1.electronegativity ?? 'Chưa rõ'}</b></div>
                <div className="flex justify-between py-1.5"><span className="text-slate-400">Bán kính nguyên tử:</span><b>{elem1.atomicRadius ? `${elem1.atomicRadius} pm` : 'Chưa rõ'}</b></div>
                <div className="flex justify-between py-1.5"><span className="text-slate-400">Nhiệt độ nóng chảy:</span><b>{elem1.meltingPoint !== null ? `${elem1.meltingPoint} °C` : 'Chưa rõ'}</b></div>
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl border ${CATEGORY_COLORS[elem2.category].badge}`}>
                  {elem2.symbol}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{elem2.nameVi} ({elem2.nameEn})</h4>
                  <span className="text-xs text-slate-400 font-mono">Z = {elem2.number} | {CATEGORY_COLORS[elem2.category].nameVi}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 font-mono text-xs mt-2 divide-y divide-slate-800/80">
                <div className="flex justify-between py-1.5"><span className="text-slate-400">Chu kỳ & Nhóm:</span><b>Chu kỳ {elem2.period}, Nhóm {elem2.group ?? 'Lantan/Actini'}</b></div>
                <div className="flex justify-between py-1.5"><span className="text-slate-400">Khối lượng nguyên tử:</span><b>{elem2.atomicMass} u</b></div>
                <div className="flex justify-between py-1.5"><span className="text-slate-400">Cấu hình electron:</span><b className="text-cyan-400">{elem2.electronConfiguration}</b></div>
                <div className="flex justify-between py-1.5"><span className="text-slate-400">Độ âm điện:</span><b className="text-amber-400">{elem2.electronegativity ?? 'Chưa rõ'}</b></div>
                <div className="flex justify-between py-1.5"><span className="text-slate-400">Bán kính nguyên tử:</span><b>{elem2.atomicRadius ? `${elem2.atomicRadius} pm` : 'Chưa rõ'}</b></div>
                <div className="flex justify-between py-1.5"><span className="text-slate-400">Nhiệt độ nóng chảy:</span><b>{elem2.meltingPoint !== null ? `${elem2.meltingPoint} °C` : 'Chưa rõ'}</b></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOPIC 3: QUANTUM ORBITALS S, P, D, F */}
      {activeTopic === 'orbitals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-3">
            <h3 className="text-base font-bold text-cyan-300 flex items-center gap-2">
              <Atom className="w-5 h-5" />
              <span>Orbital s (Spherical - Hình cầu đối xứng)</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
              Orbital s có dạng hình cầu đối xứng qua tâm hạt nhân. Mỗi phân lớp s chỉ gồm 1 orbital s duy nhất và chứa tối đa <b>2 electron</b> ghép đôi ngược chiều spin theo nguyên lý loại trừ Pauli.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-3">
            <h3 className="text-base font-bold text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>Orbital p (Dumbbell - Hình số 8 nổi)</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
              Orbital p có hình số 8 nổi (hình tạ đôi) định hướng dọc theo 3 trục tọa độ vuông góc trong không gian: px, py, pz. Mỗi phân lớp p gồm 3 orbital và chứa tối đa <b>6 electron</b>.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-3">
            <h3 className="text-base font-bold text-purple-300 flex items-center gap-2">
              <Layers className="w-5 h-5" />
              <span>Orbital d & f (Hình hoa thị 4 cánh và phức hợp)</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
              Phân lớp d gồm 5 orbital (chứa tối đa <b>10 electron</b>) tạo nên các kim loại chuyển tiếp. Phân lớp f gồm 7 orbital (chứa tối đa <b>14 electron</b>) tạo nên hai họ Lantan và Actini.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-3">
            <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Nguyên lý Aufbau & Quy tắc Hund</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <b>Nguyên lý vững bền Aufbau:</b> Electron lần lượt chiếm các mức năng lượng từ thấp đến cao: 1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p 6s 4f 5d 6p 7s 5f 6d 7p.<br/>
              <b>Quy tắc Hund:</b> Trong một phân lớp, các electron có xu hướng phân bố sao cho số electron độc thân là tối đa và có chiều tự quay spin cùng hướng.
            </p>
          </div>
        </div>
      )}

      {/* TOPIC 4: LABORATORY SAFETY */}
      {activeTopic === 'safety' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Quy Tắc An Toàn Phòng Thí Nghiệm Chuẩn Quốc Tế GHS</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-1.5">
              <span className="font-bold text-rose-400">1. Trang bị bảo hộ cá nhân (PPE)</span>
              <p className="text-slate-300">Luôn mang kính bảo hộ chống văng hóa chất, mặc áo blouse trắng và đeo găng tay nitrile khi tiếp xúc axit/kiềm.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-1.5">
              <span className="font-bold text-rose-400">2. Tuyệt đối không nếm hoặc hít trực tiếp</span>
              <p className="text-slate-300">Không nếm bất kỳ hóa chất nào. Khi muốn ngửi mùi, dùng tay phẩy nhẹ luồng khí trên miệng bình về phía mũi (thao tác quạt khí).</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-1.5">
              <span className="font-bold text-rose-400">3. Pha loãng axit đặc</span>
              <p className="text-slate-300">Luôn luôn rót axit vào nước, không bao giờ làm ngược lại để tránh nổ nhiệt và bắn giọt axit.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-1.5">
              <span className="font-bold text-rose-400">4. Thao tác với chất dễ cháy</span>
              <p className="text-slate-300">Không đun cồn, ete, axeton trực tiếp trên ngọn lửa trần. Phải dùng nồi cách thủy (water bath).</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-1.5">
              <span className="font-bold text-rose-400">5. Xử lý sự cố hóa chất</span>
              <p className="text-slate-300">Nếu axit hoặc kiềm dính vào da, lập tức xối rửa dưới vòi nước sạch chảy liên tục tối thiểu 15 phút rồi báo giáo viên phụ trách.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-1.5">
              <span className="font-bold text-rose-400">6. Thu gom chất thải độc hại</span>
              <p className="text-slate-300">Không đổ kim loại nặng (Pb, Hg, Cd) hay dung môi hữu cơ trực tiếp xuống bồn rửa thông thường.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
