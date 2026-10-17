import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ElementData, ElementCategory, StateOfMatter, ElementBlock, SearchHistoryItem } from '../types/chemistry';
import { CATEGORY_COLORS } from '../data/elements';
import { FAMOUS_SCIENTISTS } from '../data/scientists';
import { 
  Search, Filter, SlidersHorizontal, Sparkles, Flame, Droplets, 
  Layers, Maximize2, Minimize2, Check, ArrowUpDown, Volume2, History,
  Trash2, Clock, X, GraduationCap
} from 'lucide-react';
import { speakElementName, stopSpeech } from '../utils/speech';

interface PeriodicTableProps {
  elements: ElementData[];
  selectedElement: ElementData | null;
  onSelectElement: (el: ElementData) => void;
  searchHistory?: SearchHistoryItem[];
  onAddSearchHistory?: (query: string, matchCount: number) => void;
  onClearSearchHistory?: () => void;
  onRemoveSearchHistoryItem?: (id: string) => void;
  externalSearchQuery?: string;
  onExternalSearchQueryChange?: (query: string) => void;
}

// Normalizer for Vietnamese diacritic insensitive search
function removeVietnameseDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export const PeriodicTable: React.FC<PeriodicTableProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  searchHistory = [],
  onAddSearchHistory,
  onClearSearchHistory,
  onRemoveSearchHistoryItem,
  externalSearchQuery,
  onExternalSearchQueryChange,
}) => {
  const [internalSearchQuery, setInternalSearchQuery] = useState<string>('');
  
  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setInternalSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = (val: string) => {
    setInternalSearchQuery(val);
    onExternalSearchQueryChange?.(val);
  };

  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<ElementCategory | 'all'>('all');
  const [selectedPhase, setSelectedPhase] = useState<StateOfMatter | 'all'>('all');
  const [selectedBlock, setSelectedBlock] = useState<ElementBlock | 'all'>('all');
  const [showExtended, setShowExtended] = useState<boolean>(false);
  const [showTraditionalGroups, setShowTraditionalGroups] = useState<boolean>(false);
  const [propertyHeatmap, setPropertyHeatmap] = useState<'none' | 'electronegativity' | 'atomicRadius' | 'meltingPoint'>('none');
  const [hoveredElement, setHoveredElement] = useState<ElementData | null>(null);
  const [speakingElementNumber, setSpeakingElementNumber] = useState<number | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Close search history dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter elements based on search, category, phase, and block
  const { filteredElementsMap, matchedCount, activeScientist } = useMemo(() => {
    const queryNormalized = removeVietnameseDiacritics(searchQuery.trim());
    const map = new Map<number, boolean>();
    let count = 0;

    // Check if query corresponds to a scientist
    let matchedScientistName: string | null = null;
    if (queryNormalized) {
      const foundScientist = FAMOUS_SCIENTISTS.find((s) => {
        const sNameNorm = removeVietnameseDiacritics(s.name);
        return sNameNorm.includes(queryNormalized) || queryNormalized.includes(sNameNorm);
      });
      if (foundScientist) {
        matchedScientistName = foundScientist.name;
      }
    }

    elements.forEach((el) => {
      let matchesSearch = true;
      if (queryNormalized) {
        const symbolMatch = el.symbol.toLowerCase().includes(queryNormalized);
        const numberMatch = el.number.toString() === queryNormalized;
        const nameViNorm = removeVietnameseDiacritics(el.nameVi);
        const nameEnNorm = el.nameEn.toLowerCase();
        const viMatch = nameViNorm.includes(queryNormalized);
        const enMatch = nameEnNorm.includes(queryNormalized);
        const scientistMatch = removeVietnameseDiacritics(el.discoveredBy || '').includes(queryNormalized);

        // Check if query matches a famous scientist
        const isDiscoveredByScientist = FAMOUS_SCIENTISTS.some((s) => {
          const sNameNorm = removeVietnameseDiacritics(s.name);
          const nameMatches = sNameNorm.includes(queryNormalized) || queryNormalized.includes(sNameNorm);
          if (!nameMatches) return false;
          return s.elementsDiscovered.some((ed) => ed.number === el.number);
        });

        // Check if query matches group (IA, IIA, VIIIB, VIII, Nhóm 8, etc.)
        const isGroup8910 = (el.group === 8 || el.group === 9 || el.group === 10);
        const groupMatch = 
          (el.traditionalGroup && el.traditionalGroup.toLowerCase() === queryNormalized) ||
          (el.traditionalGroup && `nhom ${el.traditionalGroup.toLowerCase()}` === queryNormalized) ||
          (isGroup8910 && (queryNormalized === 'viiib' || queryNormalized === 'viii' || queryNormalized === 'nhom viiib' || queryNormalized === 'nhom viii')) ||
          (`nhom ${el.group}` === queryNormalized) ||
          (queryNormalized.startsWith('nhom ') && queryNormalized.replace('nhom ', '').trim() === (el.group?.toString() || '')) ||
          (queryNormalized === `g${el.group}`);

        matchesSearch = symbolMatch || numberMatch || viMatch || enMatch || scientistMatch || isDiscoveredByScientist || Boolean(groupMatch);
      }

      const matchesCat = selectedCategory === 'all' || el.category === selectedCategory;
      const matchesPhase = selectedPhase === 'all' || el.phase === selectedPhase;
      const matchesBlock = selectedBlock === 'all' || el.block === selectedBlock;

      const isMatch = matchesSearch && matchesCat && matchesPhase && matchesBlock;
      map.set(el.number, isMatch);
      if (isMatch) count++;
    });

    return { filteredElementsMap: map, matchedCount: count, activeScientist: matchedScientistName };
  }, [elements, searchQuery, selectedCategory, selectedPhase, selectedBlock]);

  // Handle saving search query to history with debounce or on Enter
  const handleQueryChange = (val: string) => {
    setSearchQuery(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (val.trim().length >= 2 && onAddSearchHistory) {
      searchDebounceRef.current = setTimeout(() => {
        onAddSearchHistory(val.trim(), matchedCount);
      }, 1200);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() && onAddSearchHistory) {
      onAddSearchHistory(searchQuery.trim(), matchedCount);
      setIsSearchFocused(false);
    }
  };

  const handleSelectHistoryQuery = (query: string) => {
    setSearchQuery(query);
    setIsSearchFocused(false);
    if (onAddSearchHistory) {
      onAddSearchHistory(query, matchedCount);
    }
  };

  const handleSpeak = (text: string, lang: 'en' | 'vi', elementNumber: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (speakingElementNumber === elementNumber) {
      stopSpeech();
      setSpeakingElementNumber(null);
      return;
    }

    speakElementName(
      text,
      lang,
      () => setSpeakingElementNumber(elementNumber),
      () => setSpeakingElementNumber(null)
    );
  };

  // Group traditional Roman names
  const traditionalGroupLabels: Record<number, string> = {
    1: 'IA', 2: 'IIA', 3: 'IIIB', 4: 'IVB', 5: 'VB', 6: 'VIB', 7: 'VIIB',
    8: 'VIIIB', 9: 'VIIIB', 10: 'VIIIB', 11: 'IB', 12: 'IIB', 13: 'IIIA', 14: 'IVA',
    15: 'VA', 16: 'VIA', 17: 'VIIA', 18: 'VIIIA',
  };

  // Helper to calculate heatmap styling
  const getHeatmapColor = (el: ElementData): string => {
    if (propertyHeatmap === 'electronegativity') {
      if (el.electronegativity === null) return 'bg-slate-800/40 text-slate-500';
      const norm = (el.electronegativity - 0.7) / (4.0 - 0.7);
      if (norm > 0.75) return 'bg-purple-600/50 border-purple-400 text-purple-200';
      if (norm > 0.5) return 'bg-indigo-600/50 border-indigo-400 text-indigo-200';
      if (norm > 0.3) return 'bg-blue-600/50 border-blue-400 text-blue-200';
      return 'bg-emerald-600/50 border-emerald-400 text-emerald-200';
    }

    if (propertyHeatmap === 'atomicRadius') {
      if (el.atomicRadius === null) return 'bg-slate-800/40 text-slate-500';
      const norm = (el.atomicRadius - 30) / (260 - 30);
      if (norm > 0.7) return 'bg-emerald-600/50 border-emerald-400 text-emerald-200';
      if (norm > 0.45) return 'bg-teal-600/50 border-teal-400 text-teal-200';
      if (norm > 0.25) return 'bg-sky-600/50 border-sky-400 text-sky-200';
      return 'bg-cyan-600/50 border-cyan-400 text-cyan-200';
    }

    if (propertyHeatmap === 'meltingPoint') {
      if (el.meltingPoint === null) return 'bg-slate-800/40 text-slate-500';
      if (el.meltingPoint > 2000) return 'bg-rose-600/60 border-rose-400 text-rose-100';
      if (el.meltingPoint > 1000) return 'bg-amber-600/50 border-amber-400 text-amber-100';
      if (el.meltingPoint > 100) return 'bg-yellow-600/40 border-yellow-400 text-yellow-200';
      if (el.meltingPoint > 0) return 'bg-emerald-600/40 border-emerald-400 text-emerald-200';
      return 'bg-cyan-600/50 border-cyan-400 text-cyan-100';
    }

    return '';
  };

  // Render individual element cell
  const renderCell = (el: ElementData | undefined) => {
    if (!el) {
      return <div className="aspect-square p-0.5" />;
    }

    const isMatch = filteredElementsMap.get(el.number) ?? true;
    const isSelected = selectedElement?.number === el.number;
    const catStyle = CATEGORY_COLORS[el.category];
    const heatmapClass = getHeatmapColor(el);

    return (
      <div
        key={el.number}
        onClick={() => onSelectElement(el)}
        onMouseEnter={() => setHoveredElement(el)}
        onMouseLeave={() => setHoveredElement(null)}
        className={`group relative aspect-square p-1 md:p-1.5 rounded-lg border transition-all duration-150 cursor-pointer flex flex-col justify-between ${
          !isMatch
            ? 'opacity-20 grayscale scale-95 pointer-events-none'
            : isSelected
            ? 'ring-2 ring-cyan-400 border-white bg-cyan-950/70 shadow-lg shadow-cyan-500/20 scale-105 z-10'
            : propertyHeatmap !== 'none'
            ? `${heatmapClass} hover:scale-105 hover:z-10`
            : `${catStyle.bg} ${catStyle.border} hover:scale-105 hover:border-slate-300 hover:shadow-md hover:z-10`
        }`}
      >
        {/* Top: Atomic Number & Mass */}
        <div className="flex items-center justify-between text-[9px] md:text-[10px] font-mono leading-none">
          <span className="font-bold text-slate-400 group-hover:text-white">{el.number}</span>
          <span className="text-[8px] md:text-[9px] text-slate-400/80 truncate max-w-[2.2rem]">
            {el.atomicMass.startsWith('[') ? el.atomicMass : parseFloat(el.atomicMass).toFixed(1)}
          </span>
        </div>

        {/* Center: Symbol */}
        <div className="text-center my-auto">
          <span className="text-xs sm:text-sm md:text-base font-black tracking-tight text-white group-hover:text-cyan-300 drop-shadow-sm">
            {el.symbol}
          </span>
        </div>

        {/* Bottom: Vietnamese Name */}
        <div className="text-center truncate">
          <span className="text-[8px] md:text-[9px] text-slate-300 group-hover:text-white font-medium truncate block">
            {el.nameVi}
          </span>
        </div>

        {/* State of matter pip on corner */}
        <span
          title={`Trạng thái: ${el.phase === 'gas' ? 'Khí' : el.phase === 'liquid' ? 'Lỏng' : el.phase === 'solid' ? 'Rắn' : 'Chưa rõ'}`}
          className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
            el.phase === 'gas'
              ? 'bg-rose-400'
              : el.phase === 'liquid'
              ? 'bg-blue-400'
              : el.phase === 'solid'
              ? 'bg-slate-500'
              : 'bg-zinc-600'
          }`}
        />
      </div>
    );
  };

  // Standard 18x7 table grid generator
  const renderStandardGrid = () => {
    const grid: React.ReactNode[] = [];

    // Header row: Group numbers 1..18
    grid.push(
      <div key="group-header-corner" className="text-center text-[10px] text-slate-500 font-mono flex items-center justify-center">
        P \ G
      </div>
    );
    for (let g = 1; g <= 18; g++) {
      const trad = traditionalGroupLabels[g];
      const isSelectedGroup = searchQuery.trim().toUpperCase() === trad ||
                              searchQuery.trim().toLowerCase() === `nhom ${g}` || 
                              searchQuery.trim().toLowerCase() === `nhom ${trad.toLowerCase()}` ||
                              searchQuery.trim() === `${g}`;
      grid.push(
        <div 
          key={`header-g-${g}`} 
          onClick={() => {
            const queryToSet = trad;
            setSearchQuery(searchQuery.trim().toUpperCase() === trad ? '' : queryToSet);
            if (onAddSearchHistory && searchQuery.trim().toUpperCase() !== trad) {
              onAddSearchHistory(`Nhóm ${trad}`, 0);
            }
          }}
          className={`text-center text-[10px] md:text-xs font-mono flex flex-col items-center justify-end pb-1 cursor-pointer transition select-none group rounded-lg p-0.5 ${
            isSelectedGroup 
              ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400' 
              : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60'
          }`}
          title={`Nhóm ${g} (${trad}) - Nhấn để lọc tất cả các nguyên tố nhóm ${trad}`}
        >
          <span className="font-extrabold text-slate-200 group-hover:text-cyan-300 text-[11px] md:text-xs leading-tight">
            {showTraditionalGroups ? trad : g}
          </span>
          <span className={`text-[9px] md:text-[10px] font-extrabold leading-tight mt-0.5 px-1 py-0.5 rounded border transition ${
            isSelectedGroup
              ? 'text-cyan-300 bg-cyan-950/80 border-cyan-400/60 shadow-sm'
              : 'text-indigo-300 group-hover:text-cyan-300 bg-indigo-950/40 border-indigo-500/20'
          }`}>
            {showTraditionalGroups ? g : trad}
          </span>
        </div>
      );
    }

    // Rows 1 through 7
    for (let period = 1; period <= 7; period++) {
      grid.push(
        <div key={`period-label-${period}`} className="flex items-center justify-center text-xs font-mono font-bold text-slate-400">
          {period}
        </div>
      );

      for (let group = 1; group <= 18; group++) {
        // Placeholder for Lanthanides slot (Period 6, Group 3)
        if (period === 6 && group === 3) {
          grid.push(
            <div
              key="lanthanide-slot"
              className="aspect-square p-1 rounded-lg border border-dashed border-fuchsia-500/40 bg-fuchsia-950/20 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-fuchsia-900/30 transition"
              title="Nhấn để xem chuỗi 15 nguyên tố Lantan (57-71)"
              onClick={() => setSelectedCategory('lanthanide')}
            >
              <span className="text-[9px] font-mono text-fuchsia-400">57-71</span>
              <span className="text-[9px] font-bold text-fuchsia-300">La-Lu</span>
            </div>
          );
          continue;
        }

        // Placeholder for Actinides slot (Period 7, Group 3)
        if (period === 7 && group === 3) {
          grid.push(
            <div
              key="actinide-slot"
              className="aspect-square p-1 rounded-lg border border-dashed border-pink-500/40 bg-pink-950/20 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-pink-900/30 transition"
              title="Nhấn để xem chuỗi 15 nguyên tố Actini (89-103)"
              onClick={() => setSelectedCategory('actinide')}
            >
              <span className="text-[9px] font-mono text-pink-400">89-103</span>
              <span className="text-[9px] font-bold text-pink-300">Ac-Lr</span>
            </div>
          );
          continue;
        }

        const match = elements.find(
          (e) => e.period === period && e.group === group && e.category !== 'lanthanide' && e.category !== 'actinide'
        );

        grid.push(
          <React.Fragment key={`cell-${period}-${group}`}>
            {renderCell(match)}
          </React.Fragment>
        );
      }
    }

    return grid;
  };

  const lanthanides = elements.filter((e) => e.number >= 57 && e.number <= 71);
  const actinides = elements.filter((e) => e.number >= 89 && e.number <= 103);

  // Suggestions for fast searching
  const quickSuggestions = ['Hiđrô', 'Sắt', 'Vàng', 'Natri', 'Clo', 'Oxi', 'Urani'];

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Control Bar: Search, Category Filter, State, Block, Heatmap, and View Toggle */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-4">
        {/* Row 1: Search & Quick toggles */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Input with History Dropdown */}
          <div ref={searchContainerRef} className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Tìm theo tên tiếng Việt, tiếng Anh, ký hiệu (Fe, Sắt...)"
              className="w-full bg-slate-950 text-slate-100 placeholder:text-slate-500 text-xs rounded-xl pl-9 pr-8 py-2.5 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}

            {/* Search History Dropdown Popover */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700/90 rounded-2xl p-3 shadow-2xl z-30 flex flex-col gap-2.5 animate-in fade-in duration-150">
                {/* Search History Header */}
                <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-slate-800">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Lịch sử tìm kiếm gần đây</span>
                  </span>
                  {searchHistory.length > 0 && onClearSearchHistory && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClearSearchHistory();
                      }}
                      className="text-slate-500 hover:text-rose-400 text-[10px] transition"
                    >
                      Xóa lịch sử
                    </button>
                  )}
                </div>

                {/* Search History Tags / Items */}
                {searchHistory.length > 0 ? (
                  <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
                    {searchHistory.slice(0, 8).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 cursor-pointer group text-xs transition"
                        onClick={() => handleSelectHistoryQuery(item.query)}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-slate-500 group-hover:text-cyan-400" />
                          <span className="font-medium text-slate-200 group-hover:text-cyan-300">
                            {item.query}
                          </span>
                          {item.matchedCount !== undefined && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              ({item.matchedCount} kết quả)
                            </span>
                          )}
                        </div>
                        {onRemoveSearchHistoryItem && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveSearchHistoryItem(item.id);
                            }}
                            className="text-slate-600 hover:text-rose-400 p-1 transition"
                            title="Xóa tìm kiếm này"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 py-1 italic">
                    Chưa có lịch sử tìm kiếm. Nhập từ khóa và bấm Enter để lưu.
                  </div>
                )}

                {/* Quick Suggestion Pills */}
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block mb-1">Gợi ý nguyên tố:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickSuggestions.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleSelectHistoryQuery(tag)}
                        className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 text-slate-400 border border-slate-700/60 text-[10px] transition"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search by Famous Scientists */}
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-indigo-400 font-medium block mb-1 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    <span>Tìm theo Nhà khoa học đã khám phá:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {FAMOUS_SCIENTISTS.slice(0, 7).map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleSelectHistoryQuery(s.name.replace('Sir ', ''))}
                        className="px-2 py-0.5 rounded-md bg-indigo-950/40 hover:bg-indigo-600 hover:text-white text-indigo-300 border border-indigo-500/30 text-[10px] transition flex items-center gap-1"
                      >
                        <span>{s.avatarIcon}</span>
                        <span>{s.name.replace('Sir ', '')}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Heatmap dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 text-[11px]">Bản đồ nhiệt:</span>
              <select
                value={propertyHeatmap}
                onChange={(e) => setPropertyHeatmap(e.target.value as unknown as typeof propertyHeatmap)}
                className="bg-transparent text-slate-200 outline-none cursor-pointer font-medium"
              >
                <option value="none" className="bg-slate-900">Màu phân loại</option>
                <option value="electronegativity" className="bg-slate-900">Độ âm điện</option>
                <option value="atomicRadius" className="bg-slate-900">Bán kính nguyên tử</option>
                <option value="meltingPoint" className="bg-slate-900">Nhiệt độ nóng chảy</option>
              </select>
            </div>

            {/* State filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-slate-400 text-[11px]">Thể (25°C):</span>
              <select
                value={selectedPhase}
                onChange={(e) => setSelectedPhase(e.target.value as StateOfMatter | 'all')}
                className="bg-transparent text-slate-200 outline-none cursor-pointer font-medium"
              >
                <option value="all" className="bg-slate-900">Tất cả</option>
                <option value="solid" className="bg-slate-900">Rắn (Solid)</option>
                <option value="liquid" className="bg-slate-900">Lỏng (Liquid)</option>
                <option value="gas" className="bg-slate-900">Khí (Gas)</option>
              </select>
            </div>

            {/* Block filter */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-500 px-1 text-[11px]">Khối:</span>
              {(['all', 's', 'p', 'd', 'f'] as const).map((blk) => (
                <button
                  key={blk}
                  onClick={() => setSelectedBlock(blk)}
                  className={`px-2 py-0.5 rounded-md font-mono text-[11px] transition ${
                    selectedBlock === blk 
                      ? 'bg-cyan-600 text-white font-bold' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {blk === 'all' ? 'Tất cả' : blk}
                </button>
              ))}
            </div>

            {/* Traditional Groups Toggle */}
            <button
              onClick={() => setShowTraditionalGroups(!showTraditionalGroups)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs transition flex items-center gap-1.5 ${
                showTraditionalGroups 
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40' 
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title="Hiển thị ký hiệu nhóm truyền thống (IA - VIIIA / IB - VIIIB)"
            >
              <span>Nhóm A/B</span>
            </button>
          </div>
        </div>

        {/* Row 2: Category Legend Badges (Click to filter) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition border ${
              selectedCategory === 'all'
                ? 'bg-slate-200 text-slate-950 border-white font-bold'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Tất cả ({matchedCount}/118)
          </button>
          {(Object.keys(CATEGORY_COLORS) as ElementCategory[]).map((cat) => {
            const info = CATEGORY_COLORS[cat];
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(isActive ? 'all' : cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition border flex items-center gap-1.5 ${
                  isActive
                    ? `${info.badge} font-bold ring-1 ring-cyan-400`
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${info.badge.split(' ')[0]}`} />
                <span>{info.nameVi}</span>
              </button>
            );
          })}
        </div>

        {/* Row 3: Quick Filter by Famous Scientist */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-semibold text-indigo-400 flex items-center gap-1 mr-1">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Khám phá bởi:</span>
          </span>
          {FAMOUS_SCIENTISTS.slice(0, 10).map((s) => {
            const shortName = s.name.replace('Sir ', '').split('&')[0].trim();
            const isActive = searchQuery.toLowerCase().includes(shortName.toLowerCase());
            return (
              <button
                key={s.id}
                onClick={() => {
                  if (isActive) {
                    setSearchQuery('');
                  } else {
                    handleSelectHistoryQuery(shortName);
                  }
                }}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition border flex items-center gap-1 ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-400 font-bold shadow-md shadow-indigo-600/30'
                    : 'bg-indigo-950/30 hover:bg-indigo-900/50 text-indigo-300 border-indigo-500/20'
                }`}
              >
                <span>{s.avatarIcon}</span>
                <span>{shortName}</span>
                <span className="text-[9px] opacity-70">({s.elementsDiscovered.length})</span>
              </button>
            );
          })}
        </div>

        {/* Active Scientist or Filter Notification Banner */}
        {activeScientist && (
          <div className="bg-indigo-950/50 border border-indigo-500/40 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-indigo-200">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>
                Đang hiển thị <b>{matchedCount}</b> nguyên tố do <b>{activeScientist}</b> khám phá
              </span>
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-indigo-300 hover:text-white underline font-medium"
            >
              Hủy lọc
            </button>
          </div>
        )}
      </div>

      {/* Main Periodic Table Grid Container */}
      <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-4 shadow-2xl overflow-x-auto">
        <div className="min-w-[880px] lg:min-w-[1020px] flex flex-col gap-4">
          <div className="grid grid-cols-[2rem_repeat(18,minmax(0,1fr))] gap-1 md:gap-1.5">
            {renderStandardGrid()}
          </div>

          {/* Separated Lanthanides & Actinides Rows */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col gap-1.5 pl-8 md:pl-10">
            <div className="flex items-center gap-2">
              <span className="w-24 text-[11px] font-medium text-fuchsia-400 text-right pr-2">
                Họ Lantan (4f):
              </span>
              <div className="grid grid-cols-15 gap-1 flex-1">
                {lanthanides.map((el) => renderCell(el))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-24 text-[11px] font-medium text-pink-400 text-right pr-2">
                Họ Actini (5f):
              </span>
              <div className="grid grid-cols-15 gap-1 flex-1">
                {actinides.map((el) => renderCell(el))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Hover Tooltip Inspector Banner with Audio Pronounce */}
      {hoveredElement && (
        <div className="bg-slate-900/95 border border-slate-700 rounded-2xl p-3.5 shadow-xl flex items-center justify-between text-xs animate-in fade-in duration-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-300 text-lg">
              {hoveredElement.symbol}
            </div>
            <div>
              <div className="font-bold text-slate-100 text-sm flex items-center gap-2 flex-wrap">
                <span>{hoveredElement.nameVi}</span>

                {/* Pronounce Vietnamese Name */}
                <button
                  onClick={(e) => handleSpeak(hoveredElement.nameVi, 'vi', hoveredElement.number, e)}
                  title="Nghe đọc tên tiếng Việt"
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>

                {/* Scientific Name (IUPAC / English) with Voice Button */}
                <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                  <span className="text-slate-300 font-mono text-xs">{hoveredElement.nameEn}</span>
                  <button
                    onClick={(e) => handleSpeak(hoveredElement.nameEn, 'en', hoveredElement.number, e)}
                    title="Nghe phát âm tên khoa học IUPAC (Tiếng Anh)"
                    className={`p-0.5 rounded transition ${
                      speakingElementNumber === hoveredElement.number
                        ? 'text-cyan-400 animate-pulse'
                        : 'text-cyan-400 hover:text-white'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[9px] text-slate-500">IUPAC</span>
                </div>

                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[hoveredElement.category].badge}`}>
                  {CATEGORY_COLORS[hoveredElement.category].nameVi}
                </span>
              </div>

              <div className="text-slate-400 text-[11px] font-mono flex items-center gap-3 mt-1">
                <span>Số hiệu: <b>{hoveredElement.number}</b></span>
                <span>Khối lượng: <b>{hoveredElement.atomicMass} u</b></span>
                <span>Cấu hình e: <b>{hoveredElement.electronConfiguration}</b></span>
                {hoveredElement.electronegativity && (
                  <span>Độ âm điện: <b>{hoveredElement.electronegativity}</b></span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right text-[11px] text-cyan-400 hidden sm:block">
            Nhấp chuột để mở chi tiết & mô hình 3D →
          </div>
        </div>
      )}
    </div>
  );
};
