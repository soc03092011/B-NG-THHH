import React, { useState, useEffect } from 'react';
import { ElementData, Isotope, CommonIon } from '../types/chemistry';
import { CATEGORY_COLORS } from '../data/elements';
import { Atom3DViewer } from './Atom3DViewer';
import { 
  X, Star, Bookmark, Atom, Flame, BookOpen, AlertTriangle, 
  FlaskConical, Check, Share2, Layers, ShieldAlert, Cpu,
  Volume2, VolumeX
} from 'lucide-react';
import { speakElementName, stopSpeech } from '../utils/speech';

interface ElementDetailsProps {
  element: ElementData;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (num: number) => void;
  userNote: string;
  onSaveNote: (num: number, note: string) => void;
  onOpenLabWithElement?: (element: ElementData) => void;
}

export const ElementDetails: React.FC<ElementDetailsProps> = ({
  element,
  onClose,
  isFavorite,
  onToggleFavorite,
  userNote,
  onSaveNote,
  onOpenLabWithElement,
}) => {
  const [activeTab, setActiveTab] = useState<'3d' | 'physics' | 'isotopes' | 'reactions' | 'notes'>('3d');
  const [selectedIsotope, setSelectedIsotope] = useState<Isotope>(element.isotopes[0]);
  const [selectedIon, setSelectedIon] = useState<CommonIon | null>(null);
  const [noteInput, setNoteInput] = useState<string>(userNote || '');
  const [noteSaved, setNoteSaved] = useState<boolean>(false);
  const [speakingLang, setSpeakingLang] = useState<'en' | 'vi' | null>(null);

  // Update isotope and note when element changes
  useEffect(() => {
    setSelectedIsotope(element.isotopes[0]);
    setSelectedIon(null);
    setNoteInput(userNote || '');
    setSpeakingLang(null);
    stopSpeech();
  }, [element, userNote]);

  const catStyle = CATEGORY_COLORS[element.category];

  const handleSpeak = (lang: 'en' | 'vi') => {
    if (speakingLang === lang) {
      stopSpeech();
      setSpeakingLang(null);
      return;
    }

    const textToSpeak = lang === 'en' ? element.nameEn : element.nameVi;
    speakElementName(
      textToSpeak,
      lang,
      () => setSpeakingLang(lang),
      () => setSpeakingLang(null)
    );
  };

  const handleSaveNote = () => {
    onSaveNote(element.number, noteInput);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xl border ${catStyle.badge}`}>
              {element.symbol}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight">{element.nameVi}</h2>
                
                {/* Vietnamese Name Pronunciation Button */}
                <button
                  onClick={() => handleSpeak('vi')}
                  title="Đọc tên tiếng Việt"
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-medium transition ${
                    speakingLang === 'vi'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 animate-pulse'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Volume2 className={`w-3.5 h-3.5 ${speakingLang === 'vi' ? 'text-cyan-400' : ''}`} />
                  <span>Đọc tên Việt</span>
                </button>

                {/* Scientific Name (IUPAC / English) with Voice Pronounce Button */}
                <div className="flex items-center gap-1.5 bg-slate-950/80 px-2 py-0.5 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-300 font-mono font-semibold">
                    {element.nameEn}
                  </span>
                  <button
                    onClick={() => handleSpeak('en')}
                    title="Đọc phát âm tên khoa học chuẩn IUPAC (Tiếng Anh)"
                    className={`p-1 rounded-md transition ${
                      speakingLang === 'en'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm animate-pulse'
                        : 'text-cyan-400 hover:text-cyan-300 hover:bg-slate-800'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] text-slate-500 font-sans">IUPAC</span>
                </div>

                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${catStyle.badge}`}>
                  {catStyle.nameVi}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                <span>Số hiệu nguyên tử: <b className="text-cyan-400">{element.number}</b></span>
                <span>•</span>
                <span>Chu kỳ: <b>{element.period}</b></span>
                <span>•</span>
                <span>Nhóm: <b>{element.group ?? 'Lantan/Actini'} {element.traditionalGroup ? `(${element.traditionalGroup})` : ''}</b></span>
                <span>•</span>
                <span>Khối: <b className="text-amber-400">{element.block}</b></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(element.number)}
              title={isFavorite ? 'Bỏ lưu yêu thích' : 'Lưu vào mục yêu thích'}
              className={`p-2 rounded-xl border transition ${
                isFavorite 
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <Star className={`w-5 h-5 ${isFavorite ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:bg-slate-700 transition"
              title="Đóng (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800/80 bg-slate-900/60 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('3d')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-medium transition border-b-2 ${
              activeTab === '3d'
                ? 'border-cyan-400 text-cyan-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Atom className="w-4 h-4" />
            <span>Mô hình 3D & Hạt nhân</span>
          </button>

          <button
            onClick={() => setActiveTab('physics')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-medium transition border-b-2 ${
              activeTab === 'physics'
                ? 'border-cyan-400 text-cyan-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Tính chất Vật lý & Hóa học</span>
          </button>

          <button
            onClick={() => setActiveTab('isotopes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-medium transition border-b-2 ${
              activeTab === 'isotopes'
                ? 'border-cyan-400 text-cyan-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Đồng vị ({element.isotopes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reactions')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-medium transition border-b-2 ${
              activeTab === 'reactions'
                ? 'border-cyan-400 text-cyan-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Phản ứng & Ứng dụng</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-medium transition border-b-2 ${
              activeTab === 'notes'
                ? 'border-cyan-400 text-cyan-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Ghi chú cá nhân</span>
          </button>
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/40">
          
          {/* TAB 1: 3D MODEL & CORE SPECS */}
          {activeTab === '3d' && (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left: 3D Interactive Atom Viewer */}
              <div className="flex-1">
                <Atom3DViewer
                  element={element}
                  selectedIsotope={selectedIsotope}
                  selectedIon={selectedIon}
                  onSelectIsotope={setSelectedIsotope}
                  onSelectIon={setSelectedIon}
                />
              </div>

              {/* Right: Core Atomic Parameters Quick Card */}
              <div className="w-full lg:w-80 flex flex-col gap-4">
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Atom className="w-4 h-4 text-cyan-400" />
                    <span>Cấu trúc nguyên tử chi tiết</span>
                  </h3>

                  <div className="flex flex-col gap-2 font-mono text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Số Proton (p⁺):</span>
                      <span className="font-bold text-rose-400">{element.number}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Số Neutron (n⁰):</span>
                      <span className="font-bold text-slate-300">{selectedIsotope.neutrons}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Số Electron (e⁻):</span>
                      <span className="font-bold text-sky-400">
                        {selectedIon ? selectedIon.electrons : element.number}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Số khối A = Z + N:</span>
                      <span className="font-bold text-amber-400">{selectedIsotope.massNumber}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Khối lượng nguyên tử:</span>
                      <span className="font-bold text-slate-200">{element.atomicMass} u</span>
                    </div>
                  </div>

                  {/* Electron Configuration Banner */}
                  <div className="mt-2 bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col gap-1.5">
                    <span className="text-[11px] text-slate-400">Cấu hình electron chuẩn:</span>
                    <span className="text-sm font-mono font-bold text-cyan-300 tracking-wide">
                      {element.electronConfiguration}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Phân bố theo lớp: <span className="font-mono text-slate-200">{element.electronsPerShell.join(', ')}</span>
                    </div>
                  </div>

                  {/* Summary paragraph */}
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    {element.summaryVi}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PHYSICAL & CHEMICAL PROPERTIES */}
          {activeTab === 'physics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Physical Properties */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Tính chất nhiệt & Vật lý (ở 25°C, 1 atm)</span>
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">Trạng thái vật chất:</span>
                    <span className="font-bold text-slate-200 text-sm capitalize">
                      {element.phase === 'gas' ? 'Thể Khí' : element.phase === 'liquid' ? 'Thể Lỏng' : element.phase === 'solid' ? 'Thể Rắn' : 'Chưa xác định (Siêu nặng)'}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">Khối lượng riêng:</span>
                    <span className="font-bold text-slate-200 text-sm font-mono">
                      {element.density !== null ? `${element.density} g/cm³` : 'Chưa có dữ liệu'}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">Nhiệt độ nóng chảy:</span>
                    <span className="font-bold text-slate-200 text-sm font-mono">
                      {element.meltingPoint !== null ? `${element.meltingPoint} °C` : 'Chưa có dữ liệu'}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">Nhiệt độ sôi:</span>
                    <span className="font-bold text-slate-200 text-sm font-mono">
                      {element.boilingPoint !== null ? `${element.boilingPoint} °C` : 'Chưa có dữ liệu'}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">Bán kính nguyên tử:</span>
                    <span className="font-bold text-slate-200 text-sm font-mono">
                      {element.atomicRadius !== null ? `${element.atomicRadius} pm` : 'Chưa có dữ liệu'}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">Năm phát hiện:</span>
                    <span className="font-bold text-slate-200 text-sm">
                      {element.yearDiscovered} ({element.discoveredBy})
                    </span>
                  </div>
                </div>
              </div>

              {/* Chemical Properties & Valences */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Atom className="w-4 h-4 text-cyan-400" />
                  <span>Tính chất hóa học, Hóa trị & Số oxi hóa</span>
                </h3>

                <div className="flex flex-col gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Độ âm điện (Pauling):</span>
                      <span className="font-bold text-cyan-300 text-base font-mono">
                        {element.electronegativity ?? 'Không xác định'}
                      </span>
                    </div>
                    <div className="text-right text-[11px] text-slate-400 max-w-[200px]">
                      Thước đo khả năng hút electron trong liên kết hóa học.
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Năng lượng ion hóa (I₁):</span>
                      <span className="font-bold text-amber-300 text-base font-mono">
                        {element.ionizationEnergy !== null ? `${element.ionizationEnergy} kJ/mol` : 'Chưa có dữ liệu'}
                      </span>
                    </div>
                    <div className="text-right text-[11px] text-slate-400 max-w-[200px]">
                      Năng lượng cần để tách 1 electron lớp ngoài cùng.
                    </div>
                  </div>

                  {/* Distinction between Valency and Oxidation States */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Số oxi hóa thường gặp:</span>
                      <span className="font-bold text-emerald-400 font-mono text-sm">{element.oxidationStates}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Hóa trị thường gặp:</span>
                      <span className="font-bold text-indigo-400 font-mono text-sm">{element.valences}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800/80">
                      Lưu ý: Hóa trị là số liên kết hóa học một nguyên tử tạo thành (chữ số La Mã, không dấu), trong khi Số oxi hóa là điện tích giả định khi giả sử liên kết là ion hoàn toàn (có dấu +/-).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ISOTOPES & NUCLEAR DATA */}
          {activeTab === 'isotopes' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Danh sách các đồng vị chính của <b className="text-white">{element.nameVi}</b> trong tự nhiên và đồng vị phóng xạ tiêu biểu:
                </p>
                <span className="text-[11px] text-cyan-400 font-mono">
                  Công thức tính: Số khối A = Z (p) + N (n)
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono">
                    <tr>
                      <th className="py-3 px-4">Đồng vị</th>
                      <th className="py-3 px-4">Số khối (A)</th>
                      <th className="py-3 px-4">Proton (Z)</th>
                      <th className="py-3 px-4">Neutron (N)</th>
                      <th className="py-3 px-4">Độ phổ biến tự nhiên</th>
                      <th className="py-3 px-4">Tính bền & Chu kỳ bán rã</th>
                      <th className="py-3 px-4 text-right">Mô phỏng 3D</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {element.isotopes.map((iso) => (
                      <tr 
                        key={iso.massNumber} 
                        className={`hover:bg-slate-800/50 transition ${
                          selectedIsotope.massNumber === iso.massNumber ? 'bg-cyan-950/40' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                          <span>{iso.symbol}</span>
                          {selectedIsotope.massNumber === iso.massNumber && (
                            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30">
                              Đang xem
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-amber-300">{iso.massNumber}</td>
                        <td className="py-3 px-4 text-rose-400">{element.number}</td>
                        <td className="py-3 px-4 text-slate-300">{iso.neutrons}</td>
                        <td className="py-3 px-4 text-slate-300 font-sans">{iso.abundance}</td>
                        <td className="py-3 px-4 font-sans">
                          {iso.isStable ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              Bền vững
                            </span>
                          ) : (
                            <span className="text-amber-400 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-amber-400" />
                              Phóng xạ ({iso.halfLife ?? 'Không rõ'})
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedIsotope(iso);
                              setActiveTab('3d');
                            }}
                            className="px-2.5 py-1 bg-cyan-600/30 hover:bg-cyan-600 text-cyan-200 hover:text-white rounded-lg border border-cyan-500/40 text-[11px] font-sans transition"
                          >
                            Xem 3D
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: TYPICAL REACTIONS & APPLICATIONS */}
          {activeTab === 'reactions' && (
            <div className="flex flex-col gap-6">
              {/* Typical Chemical Reactions */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col gap-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-800">
                  <FlaskConical className="w-4 h-4 text-cyan-400" />
                  <span>Phương trình hóa học & Phản ứng đặc trưng</span>
                </h3>

                {element.typicalReactions.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {element.typicalReactions.map((rxn, idx) => (
                      <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-cyan-300">{rxn.title}</span>
                        <div className="font-mono text-xs sm:text-sm bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-emerald-300 overflow-x-auto">
                          {rxn.equation}
                        </div>
                        <span className="text-[11px] text-slate-400 italic">{rxn.note}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Nguyên tố này là khí hiếm hoặc nguyên tố nhân tạo siêu nặng có hoạt tính hóa học cực thấp hoặc chưa quan sát được phản ứng hóa học thường nghiệm.
                  </p>
                )}
              </div>

              {/* Real-life Applications & Safety */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Applications */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-800">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <span>Ứng dụng thực tế & Công nghiệp</span>
                  </h3>
                  <ul className="flex flex-col gap-2 text-xs text-slate-300 list-disc list-inside">
                    {element.applications.map((app, idx) => (
                      <li key={idx} className="leading-relaxed">
                        <span className="text-slate-200">{app}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Toxicity & Safety Warnings */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2 pb-2 border-b border-slate-800">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Độc tính, Rủi ro & An toàn phòng thí nghiệm</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed bg-rose-950/20 p-3 rounded-xl border border-rose-900/30">
                    {element.hazardsAndSafety}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PERSONAL LEARNING NOTES */}
          {activeTab === 'notes' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col gap-4 max-w-2xl mx-auto">
              <div>
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-amber-400" />
                  <span>Sổ tay ghi chú học tập: {element.nameVi} ({element.symbol})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ghi lại công thức, hiện tượng cần nhớ hoặc câu hỏi ôn thi. Dữ liệu được lưu trữ tự động trên thiết bị của bạn.
                </p>
              </div>

              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Nhập ghi chú cá nhân của bạn về nguyên tố này..."
                className="w-full h-40 bg-slate-950 text-slate-100 placeholder:text-slate-600 text-xs rounded-xl p-3.5 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none transition"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {noteSaved ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-medium">
                      <Check className="w-3.5 h-3.5" /> Đã lưu thành công vào trình duyệt!
                    </span>
                  ) : (
                    'Chưa lưu thay đổi'
                  )}
                </span>
                <button
                  onClick={handleSaveNote}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl shadow-md transition"
                >
                  Lưu ghi chú
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar: Data Source Attribution */}
        <div className="px-6 py-2.5 bg-slate-950 border-t border-slate-800/80 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span>Nguồn dữ liệu chuẩn: IUPAC, CIAAW, NIST Standard Reference Database & CRC Handbook.</span>
          <span>Cập nhật khoa học: Tháng 10/2026</span>
        </div>
      </div>
    </div>
  );
};
