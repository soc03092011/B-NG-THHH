import React, { useState } from 'react';
import { ElementData, UserHistoryItem, UserNote, SearchHistoryItem } from '../types/chemistry';
import { CATEGORY_COLORS } from '../data/elements';
import { FAMOUS_SCIENTISTS, DISCOVERY_ERAS, ScientistDiscovery } from '../data/scientists';
import { 
  History, Star, Bookmark, Trash2, Clock, 
  Search, ArrowRight, BookOpen, AlertCircle, Volume2,
  GraduationCap, Calendar, Sparkles, Filter, ExternalLink
} from 'lucide-react';
import { speakElementName, stopSpeech } from '../utils/speech';

interface LearningHistoryProps {
  history: UserHistoryItem[];
  favorites: number[];
  notes: UserNote[];
  elements: ElementData[];
  searchHistory?: SearchHistoryItem[];
  onSelectElement: (el: ElementData) => void;
  onClearHistory: () => void;
  onRemoveHistoryItem: (id: string) => void;
  onToggleFavorite: (num: number) => void;
  onClearSearchHistory?: () => void;
  onRemoveSearchHistoryItem?: (id: string) => void;
  onReSearchQuery?: (query: string) => void;
}

export const LearningHistory: React.FC<LearningHistoryProps> = ({
  history,
  favorites,
  notes,
  elements,
  searchHistory = [],
  onSelectElement,
  onClearHistory,
  onRemoveHistoryItem,
  onToggleFavorite,
  onClearSearchHistory,
  onRemoveSearchHistoryItem,
  onReSearchQuery,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'recent' | 'searches' | 'scientists' | 'favorites' | 'notes'>('recent');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [scientistEraFilter, setScientistEraFilter] = useState<string>('all');
  const [speakingNumber, setSpeakingNumber] = useState<number | null>(null);

  // Map element by number
  const elementMap = new Map<number, ElementData>();
  elements.forEach((e) => elementMap.set(e.number, e));

  // Filtered recent items
  const filteredHistory = history.filter((item) => {
    const el = elementMap.get(item.elementNumber);
    if (!el) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      el.symbol.toLowerCase().includes(term) ||
      el.nameVi.toLowerCase().includes(term) ||
      el.nameEn.toLowerCase().includes(term)
    );
  });

  // Filtered search history
  const filteredSearchHistory = searchHistory.filter((item) => {
    if (!searchTerm) return true;
    return item.query.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Filtered scientists
  const filteredScientists = FAMOUS_SCIENTISTS.filter((s) => {
    const matchesEra = scientistEraFilter === 'all' || s.eraId === scientistEraFilter;
    if (!matchesEra) return false;

    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const nameMatch = s.name.toLowerCase().includes(term);
    const natMatch = s.nationality.toLowerCase().includes(term);
    const descMatch = s.descriptionVi.toLowerCase().includes(term);
    const elementMatch = s.elementsDiscovered.some((ed) => 
      ed.symbol.toLowerCase().includes(term) ||
      ed.nameVi.toLowerCase().includes(term) ||
      (ed.nameEn && ed.nameEn.toLowerCase().includes(term))
    );

    return nameMatch || natMatch || descMatch || elementMatch;
  });

  const favoriteElements = favorites
    .map((num) => elementMap.get(num))
    .filter(Boolean) as ElementData[];

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
  };

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

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Top Controls Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <History className="w-4 h-4" />
            <span>Trung Tâm Theo Dõi Học Tập & Lịch Sử Khám Phá</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Lịch Sử & Nhà Khoa Học Khám Phá</h2>
        </div>

        {/* Sub-tab Switches */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('recent')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
              activeSubTab === 'recent'
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Đã xem ({history.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('searches')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
              activeSubTab === 'searches'
                ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Lịch sử tìm kiếm ({searchHistory.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('scientists')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
              activeSubTab === 'scientists'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30 font-bold'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-indigo-300" />
            <span>Nhà khoa học khám phá ({FAMOUS_SCIENTISTS.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('favorites')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
              activeSubTab === 'favorites'
                ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>Yêu thích ({favorites.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('notes')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
              activeSubTab === 'notes'
                ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Ghi chú ({notes.length})</span>
          </button>
        </div>
      </div>

      {/* RECENT VIEWED HISTORY TAB */}
      {activeSubTab === 'recent' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm trong danh sách đã xem..."
                className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl pl-8 pr-3 py-2 border border-slate-800 outline-none focus:border-cyan-500"
              />
            </div>

            {history.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử xem nguyên tố?')) {
                    onClearHistory();
                  }
                }}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-900/40 hover:bg-rose-950/30 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa toàn bộ lịch sử</span>
              </button>
            )}
          </div>

          {filteredHistory.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredHistory.map((item) => {
                const el = elementMap.get(item.elementNumber);
                if (!el) return null;
                const catStyle = CATEGORY_COLORS[el.category];
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between group"
                  >
                    <div 
                      onClick={() => onSelectElement(el)}
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm border ${catStyle.badge}`}>
                        {el.symbol}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition flex items-center gap-1.5">
                          <span>{el.nameVi}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({el.nameEn})</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                          <span>{formatTimestamp(item.timestamp)}</span>
                          {el.discoveredBy && (
                            <span className="text-indigo-400/80 truncate max-w-[130px]">• {el.discoveredBy}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleSpeak(el.nameEn, 'en', el.number, e)}
                        title="Nghe phát âm tên khoa học IUPAC"
                        className={`p-1.5 rounded-lg transition ${
                          speakingNumber === el.number
                            ? 'text-cyan-400 bg-cyan-950/80 animate-pulse'
                            : 'text-slate-500 hover:text-cyan-300 hover:bg-slate-900'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRemoveHistoryItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition"
                        title="Xóa mục này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Chưa có lịch sử hoạt động nào được ghi lại.
            </div>
          )}
        </div>
      )}

      {/* SEARCH HISTORY TAB */}
      {activeSubTab === 'searches' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Lọc từ khóa đã tìm kiếm..."
                className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl pl-8 pr-3 py-2 border border-slate-800 outline-none focus:border-cyan-500"
              />
            </div>

            {searchHistory.length > 0 && onClearSearchHistory && (
              <button
                onClick={() => {
                  if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử tìm kiếm?')) {
                    onClearSearchHistory();
                  }
                }}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-900/40 hover:bg-rose-950/30 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa toàn bộ lịch sử tìm kiếm</span>
              </button>
            )}
          </div>

          {filteredSearchHistory.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredSearchHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between group"
                >
                  <div className="flex flex-col gap-0.5 flex-1 pr-2">
                    <div className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                        {item.query}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                      <span>{formatTimestamp(item.timestamp)}</span>
                      {item.matchedCount !== undefined && (
                        <span>• {item.matchedCount} nguyên tố</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onReSearchQuery && (
                      <button
                        onClick={() => onReSearchQuery(item.query)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 text-[11px] font-medium transition"
                      >
                        Tìm lại
                      </button>
                    )}
                    {onRemoveSearchHistoryItem && (
                      <button
                        onClick={() => onRemoveSearchHistoryItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition"
                        title="Xóa mục này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs flex flex-col items-center gap-2">
              <Search className="w-8 h-8 text-slate-700" />
              <span>Chưa có lịch sử tìm kiếm. Khi bạn tìm kiếm nguyên tố ở Bảng tuần hoàn, từ khóa sẽ được lưu tự động tại đây.</span>
            </div>
          )}
        </div>
      )}

      {/* SCIENTISTS DISCOVERY HISTORY TAB */}
      {activeSubTab === 'scientists' && (
        <div className="flex flex-col gap-5">
          {/* Timeline of Eras Banner */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>5 Thời Kỳ Khám Phá & Lịch Sử Hình Thành 118 Nguyên Tố</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono font-bold text-cyan-400">118 Nguyên Tố Đã Được Đặt Tên</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
              {DISCOVERY_ERAS.map((era) => (
                <div
                  key={era.id}
                  onClick={() => setScientistEraFilter(scientistEraFilter === era.id ? 'all' : era.id)}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                    scientistEraFilter === era.id
                      ? 'bg-indigo-950/60 border-indigo-400 ring-1 ring-indigo-400/50'
                      : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300">{era.titleVi}</span>
                      <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                        {era.elementCount}
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-mono block mt-0.5">{era.timeRange}</span>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {era.descriptionVi}
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium pt-2 border-t border-slate-800/80 mt-2">
                    Lọc theo thời kỳ này →
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search & Filter Toolbar for Scientists */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-bold text-white">
                  Danh Sách Các Nhà Khoa Học & Nguyên Tố Khám Phá ({filteredScientists.length})
                </span>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm nhà khoa học (Curie, Davy...) hoặc nguyên tố..."
                  className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl pl-8 pr-3 py-2 border border-slate-800 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Era filter pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-500 text-[11px] mr-1">Thời kỳ:</span>
              <button
                onClick={() => setScientistEraFilter('all')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition border ${
                  scientistEraFilter === 'all'
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Tất cả thời kỳ
              </button>
              {DISCOVERY_ERAS.map((era) => (
                <button
                  key={era.id}
                  onClick={() => setScientistEraFilter(era.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition border ${
                    scientistEraFilter === era.id
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {era.titleVi}
                </button>
              ))}
            </div>

            {/* Grid of Scientist Cards with Discovered Elements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {filteredScientists.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between gap-3 shadow-lg group"
                >
                  <div className="flex flex-col gap-2.5">
                    {/* Scientist Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2 rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
                          {s.avatarIcon}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                            {s.name}
                          </h4>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                            <span>{s.nationality}</span>
                            <span>•</span>
                            <span>{s.years}</span>
                          </div>
                        </div>
                      </div>

                      {onReSearchQuery && (
                        <button
                          onClick={() => onReSearchQuery(s.name.replace('Sir ', ''))}
                          title="Lọc các nguyên tố của nhà khoa học này trên Bảng tuần hoàn"
                          className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-[11px] font-medium transition flex items-center gap-1"
                        >
                          <Search className="w-3 h-3" />
                          <span>Xem trên bảng</span>
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {s.descriptionVi}
                    </p>

                    <div className="text-[11px] text-amber-300/90 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 leading-snug">
                      <b>Dấu ấn lịch sử:</b> {s.historicalSignificance}
                    </div>
                  </div>

                  {/* Discovered Elements List */}
                  <div className="pt-2.5 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5 flex items-center justify-between">
                      <span>Nguyên tố đã khám phá ({s.elementsDiscovered.length}):</span>
                      <span className="text-[10px] text-slate-500 font-normal">Nhấp để xem 3D • Biểu tượng loa để nghe</span>
                    </span>

                    <div className="flex flex-wrap gap-1.5">
                      {s.elementsDiscovered.map((ed) => {
                        const fullEl = elementMap.get(ed.number);
                        return (
                          <div
                            key={ed.number}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700/80 transition"
                          >
                            <span 
                              onClick={() => {
                                if (fullEl) onSelectElement(fullEl);
                              }}
                              className="font-bold text-xs text-indigo-300 hover:text-cyan-300 cursor-pointer flex items-center gap-1"
                              title={`Xem chi tiết & mô hình 3D của ${ed.nameVi}`}
                            >
                              <span className="font-mono text-cyan-400 font-black">{ed.symbol}</span>
                              <span className="text-slate-200">({ed.nameVi})</span>
                              <span className="text-[10px] text-slate-500 font-mono">[{ed.year}]</span>
                            </span>

                            {/* Voice Button to pronounce Scientific IUPAC name */}
                            {ed.nameEn && (
                              <button
                                onClick={(e) => handleSpeak(ed.nameEn!, 'en', ed.number, e)}
                                title={`Nghe phát âm tên khoa học IUPAC: ${ed.nameEn}`}
                                className={`p-0.5 rounded text-slate-400 hover:text-cyan-300 transition ${
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

      {/* FAVORITES TAB */}
      {activeSubTab === 'favorites' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
            Các Nguyên Tố Hóa Học Bạn Yêu Thích ({favoriteElements.length}):
          </span>

          {favoriteElements.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {favoriteElements.map((el) => {
                const catStyle = CATEGORY_COLORS[el.category];
                return (
                  <div
                    key={el.number}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between group"
                  >
                    <div 
                      onClick={() => onSelectElement(el)}
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base border ${catStyle.badge}`}>
                        {el.symbol}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition flex items-center gap-1.5">
                          <span>{el.nameVi}</span>
                          <span className="text-xs text-slate-400 font-mono">({el.nameEn})</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Số hiệu: {el.number} • {catStyle.nameVi}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleSpeak(el.nameEn, 'en', el.number, e)}
                        title="Nghe phát âm tên khoa học IUPAC"
                        className={`p-2 transition ${
                          speakingNumber === el.number ? 'text-cyan-400 animate-pulse' : 'text-slate-400 hover:text-cyan-300'
                        }`}
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onToggleFavorite(el.number)}
                        className="p-2 text-amber-400 hover:text-slate-400 transition"
                        title="Bỏ yêu thích"
                      >
                        <Star className="w-4 h-4 fill-amber-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs flex flex-col items-center gap-2">
              <Star className="w-8 h-8 text-slate-700" />
              <span>Chưa có nguyên tố nào trong mục yêu thích. Nhấn vào biểu tượng ngôi sao ở trang chi tiết nguyên tố để thêm!</span>
            </div>
          )}
        </div>
      )}

      {/* NOTES TAB */}
      {activeSubTab === 'notes' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
            Sổ Tay Ghi Chú Học Tập ({notes.length}):
          </span>

          {notes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.map((n) => {
                const el = elementMap.get(n.elementNumber);
                if (!el) return null;
                return (
                  <div
                    key={n.elementNumber}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div 
                        onClick={() => onSelectElement(el)}
                        className="flex items-center gap-2 cursor-pointer font-bold text-cyan-300 hover:underline text-xs"
                      >
                        <span>{el.nameVi} ({el.symbol})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatTimestamp(n.updatedAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {n.noteText}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs flex flex-col items-center gap-2">
              <Bookmark className="w-8 h-8 text-slate-700" />
              <span>Bạn chưa lưu ghi chú nào. Mở trang chi tiết nguyên tố và chọn tab "Ghi chú cá nhân" để viết nhé!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
