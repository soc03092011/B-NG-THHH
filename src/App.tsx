import React, { useState, useEffect } from 'react';
import { ALL_ELEMENTS } from './data/elements';
import { ElementData, UserHistoryItem, UserNote, SearchHistoryItem } from './types/chemistry';
import { PeriodicTable } from './components/PeriodicTable';
import { ElementDetails } from './components/ElementDetails';
import { VirtualLab } from './components/VirtualLab';
import { QuizEngine } from './components/QuizEngine';
import { KnowledgeBase } from './components/KnowledgeBase';
import { LearningHistory } from './components/LearningHistory';
import { 
  Atom, FlaskConical, BookOpen, 
  Award, History, Sparkles, Star, Github, Info
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'table' | 'lab' | 'knowledge' | 'quiz' | 'history'>('table');
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);
  const [tableSearchQuery, setTableSearchQuery] = useState<string>('');

  // LocalStorage state for viewed history, favorites, notes, and search history
  const [history, setHistory] = useState<UserHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('chemlab_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('chemlab_search_history');
      return saved ? JSON.parse(saved) : [
        { id: 'sh-1', query: 'Sắt', timestamp: Date.now() - 3600000, matchedCount: 1 },
        { id: 'sh-2', query: 'Na', timestamp: Date.now() - 7200000, matchedCount: 1 },
        { id: 'sh-3', query: 'Kim loại kiềm', timestamp: Date.now() - 10800000, matchedCount: 6 },
      ];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('chemlab_favorites');
      return saved ? JSON.parse(saved) : [1, 6, 8, 11, 26, 79]; // Default favorites H, C, O, Na, Fe, Au
    } catch {
      return [1, 6, 8, 11, 26, 79];
    }
  });

  const [notes, setNotes] = useState<UserNote[]>(() => {
    try {
      const saved = localStorage.getItem('chemlab_notes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chemlab_history', JSON.stringify(history));
    } catch {
      // Ignored
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem('chemlab_search_history', JSON.stringify(searchHistory));
    } catch {
      // Ignored
    }
  }, [searchHistory]);

  useEffect(() => {
    try {
      localStorage.setItem('chemlab_favorites', JSON.stringify(favorites));
    } catch {
      // Ignored
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem('chemlab_notes', JSON.stringify(notes));
    } catch {
      // Ignored
    }
  }, [notes]);

  // Handler to inspect element
  const handleSelectElement = (el: ElementData) => {
    setSelectedElement(el);

    // Record in history
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.elementNumber !== el.number);
      const newItem: UserHistoryItem = {
        id: `${el.number}-${Date.now()}`,
        elementNumber: el.number,
        timestamp: Date.now(),
        action: 'viewed',
      };
      return [newItem, ...filtered].slice(0, 50); // Store up to 50 items
    });
  };

  const handleAddSearchHistory = (query: string, matchCount: number) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.query.toLowerCase() !== trimmed.toLowerCase());
      const newItem: SearchHistoryItem = {
        id: `sh-${Date.now()}`,
        query: trimmed,
        timestamp: Date.now(),
        matchedCount: matchCount,
      };
      return [newItem, ...filtered].slice(0, 30);
    });
  };

  const handleClearSearchHistory = () => {
    setSearchHistory([]);
  };

  const handleRemoveSearchHistoryItem = (id: string) => {
    setSearchHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReSearchQuery = (query: string) => {
    setTableSearchQuery(query);
    setActiveTab('table');
    handleAddSearchHistory(query, 1);
  };

  const handleToggleFavorite = (num: number) => {
    setFavorites((prev) =>
      prev.includes(num) ? prev.filter((id) => id !== num) : [...prev, num]
    );
  };

  const handleSaveNote = (num: number, text: string) => {
    setNotes((prev) => {
      const filtered = prev.filter((n) => n.elementNumber !== num);
      if (!text.trim()) return filtered;
      return [...filtered, { elementNumber: num, noteText: text, updatedAt: Date.now() }];
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleRemoveHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const userNoteForSelected = selectedElement
    ? notes.find((n) => n.elementNumber === selectedElement.number)?.noteText || ''
    : '';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      
      {/* Top Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Branding */}
          <div 
            onClick={() => setActiveTab('table')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Atom className="w-5 h-5 text-cyan-400 group-hover:rotate-45 transition duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">ChemLab</span>
                <span className="font-extrabold text-base tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  3D
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold ml-1">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Nền Tảng Học Tập Hóa Học Tương Tác 3D
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                activeTab === 'table'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Atom className="w-4 h-4" />
              <span>Bảng tuần hoàn</span>
            </button>

            <button
              onClick={() => setActiveTab('lab')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                activeTab === 'lab'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              <span>Phòng thí nghiệm ảo</span>
            </button>

            <button
              onClick={() => setActiveTab('knowledge')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                activeTab === 'knowledge'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline">Kho kiến thức</span>
              <span className="md:hidden">Lý thuyết</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                activeTab === 'quiz'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Luyện tập</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden md:inline">Lịch sử ({history.length + searchHistory.length})</span>
              <span className="md:hidden">Sổ tay</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'table' && (
          <PeriodicTable
            elements={ALL_ELEMENTS}
            selectedElement={selectedElement}
            onSelectElement={handleSelectElement}
            searchHistory={searchHistory}
            onAddSearchHistory={handleAddSearchHistory}
            onClearSearchHistory={handleClearSearchHistory}
            onRemoveSearchHistoryItem={handleRemoveSearchHistoryItem}
            externalSearchQuery={tableSearchQuery}
            onExternalSearchQueryChange={setTableSearchQuery}
          />
        )}

        {activeTab === 'lab' && <VirtualLab />}

        {activeTab === 'knowledge' && (
          <KnowledgeBase
            elements={ALL_ELEMENTS}
            onSelectElement={handleSelectElement}
          />
        )}

        {activeTab === 'quiz' && <QuizEngine />}

        {activeTab === 'history' && (
          <LearningHistory
            history={history}
            favorites={favorites}
            notes={notes}
            elements={ALL_ELEMENTS}
            searchHistory={searchHistory}
            onSelectElement={handleSelectElement}
            onClearHistory={handleClearHistory}
            onRemoveHistoryItem={handleRemoveHistoryItem}
            onToggleFavorite={handleToggleFavorite}
            onClearSearchHistory={handleClearSearchHistory}
            onRemoveSearchHistoryItem={handleRemoveSearchHistoryItem}
            onReSearchQuery={handleReSearchQuery}
          />
        )}
      </main>

      {/* Element Details Modal with 3D Viewer and Pronunciation */}
      {selectedElement && (
        <ElementDetails
          element={selectedElement}
          onClose={() => setSelectedElement(null)}
          isFavorite={favorites.includes(selectedElement.number)}
          onToggleFavorite={handleToggleFavorite}
          userNote={userNoteForSelected}
          onSaveNote={handleSaveNote}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>ChemLab 3D • Hệ thống mô phỏng giáo dục Hóa học 3D & Phòng thí nghiệm ảo</span>
          </div>
          <span className="text-[11px] font-mono">
            Dữ liệu đối chiếu chuẩn IUPAC & CIAAW • 118 Nguyên tố Hóa học
          </span>
        </div>
      </footer>
    </div>
  );
}
