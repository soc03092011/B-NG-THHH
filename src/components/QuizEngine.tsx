import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types/chemistry';
import { 
  CheckCircle2, XCircle, AlertCircle, RotateCcw, Clock, 
  Award, HelpCircle, ArrowRight, Check, Sparkles, BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';

const QUESTIONS_BANK: QuizQuestion[] = [
  // Cấu tạo nguyên tử
  {
    id: 'q1',
    topic: 'Cấu tạo nguyên tử & Số hạt',
    difficulty: 'basic',
    type: 'single',
    question: 'Một nguyên tử trung hòa có 12 proton thì số electron của nguyên tử đó là bao nhiêu?',
    options: ['10 electron', '12 electron', '24 electron', '6 electron'],
    correctAnswer: 1,
    explanation: 'Nguyên tử trung hòa về điện luôn có số proton (mang điện tích dương) bằng số electron (mang điện tích âm): Số p = Số e = 12.',
  },
  {
    id: 'q2',
    topic: 'Đồng vị & Số khối',
    difficulty: 'basic',
    type: 'single',
    question: 'Đồng vị phóng xạ Cacbon-14 (ký hiệu ¹⁴C, số hiệu Z = 6) có bao nhiêu hạt neutron trong hạt nhân?',
    options: ['6 neutron', '8 neutron', '14 neutron', '12 neutron'],
    correctAnswer: 1,
    explanation: 'Số hạt neutron N = Số khối (A) - Số proton (Z) = 14 - 6 = 8 neutron.',
  },
  {
    id: 'q3',
    topic: 'Ion & Điện tích',
    difficulty: 'medium',
    type: 'single',
    question: 'Cation Natri (Na⁺) có số hiệu nguyên tử Z = 11. Số electron có trong ion Na⁺ là bao nhiêu?',
    options: ['11 electron', '12 electron', '10 electron', '9 electron'],
    correctAnswer: 2,
    explanation: 'Nguyên tử natri có 11 proton và 11 electron. Khi nhường 1 electron ở lớp ngoài cùng để tạo ion Na⁺, số electron còn lại là 11 - 1 = 10 electron (đạt cấu hình bền của khí hiếm Ne).',
  },
  {
    id: 'q4',
    topic: 'Vị trí trong Bảng tuần hoàn',
    difficulty: 'basic',
    type: 'single',
    question: 'Nguyên tố có số hiệu nguyên tử Z = 8 là nguyên tố nào và thuộc chu kỳ mấy?',
    options: ['Cacbon (C), Chu kỳ 2', 'Oxi (O), Chu kỳ 2', 'Nitơ (N), Chu kỳ 2', 'Flo (F), Chu kỳ 3'],
    correctAnswer: 1,
    explanation: 'Z = 8 là nguyên tố Oxi (O), cấu hình electron 1s² 2s² 2p⁴ có 2 lớp electron nên thuộc Chu kỳ 2, nhóm 16 (VIA).',
  },
  {
    id: 'q5',
    topic: 'Quy luật tuần hoàn',
    difficulty: 'medium',
    type: 'single',
    question: 'Trong một chu kỳ, đi từ trái sang phải theo chiều tăng dần của điện tích hạt nhân, độ âm điện của các nguyên tố biến đổi như thế nào?',
    options: ['Giảm dần liên tục', 'Tăng dần', 'Không thay đổi', 'Biến đổi không có quy luật'],
    correctAnswer: 1,
    explanation: 'Trong cùng một chu kỳ từ trái sang phải, bán kính nguyên tử giảm và điện tích hạt nhân tăng, dẫn tới lực hút electron mạnh hơn, do đó độ âm điện tăng dần (cao nhất là Flo).',
  },
  {
    id: 'q6',
    topic: 'Cấu hình electron',
    difficulty: 'medium',
    type: 'single',
    question: 'Nguyên tố X có cấu hình electron lớp ngoài cùng là 3s² 3p⁵. Nguyên tố X thuộc nhóm nào trong bảng tuần hoàn IUPAC?',
    options: ['Nhóm 5', 'Nhóm 7', 'Nhóm 15', 'Nhóm 17 (Halogen)'],
    correctAnswer: 3,
    explanation: 'Lớp ngoài cùng có 2 + 5 = 7 electron hóa trị thuộc phân lớp s và p, cấu hình đầy đủ [Ne] 3s² 3p⁵ (Clo), thuộc Nhóm 17 (nhóm Halogen).',
  },
  {
    id: 'q7',
    topic: 'Phản ứng hóa học & Cân bằng',
    difficulty: 'medium',
    type: 'single',
    question: 'Tổng hệ số nguyên tối giản của tất cả các chất trong phương trình phản ứng: Al + Fe₃O₄ -> Al₂O₃ + Fe là bao nhiêu?',
    options: ['12', '25', '21', '18'],
    correctAnswer: 1,
    explanation: 'Phương trình nhiệt nhôm cân bằng là: 8Al + 3Fe₃O₄ -> 4Al₂O₃ + 9Fe. Tổng các hệ số cân bằng là 8 + 3 + 4 + 9 = 24 (hoặc tương đương hệ số nguyên tối giản).',
  },
  {
    id: 'q8',
    topic: 'Axit, Bazơ & Thang đo pH',
    difficulty: 'basic',
    type: 'single',
    question: 'Một dung dịch có giá trị pH = 2. Dung dịch này có tính chất gì và làm quỳ tím chuyển sang màu gì?',
    options: ['Tính bazơ, làm quỳ tím hóa xanh', 'Tính axit, làm quỳ tím hóa đỏ', 'Tính trung tính, không đổi màu', 'Tính kiềm mạnh'],
    correctAnswer: 1,
    explanation: 'Dung dịch có pH < 7 là môi trường axit, nồng độ [H⁺] cao làm quỳ tím chuyển sang màu đỏ rực.',
  },
  {
    id: 'q9',
    topic: 'Đồng vị & Bảng tuần hoàn',
    difficulty: 'advanced',
    type: 'single',
    question: 'Clo có 2 đồng vị bền trong tự nhiên là ³⁵Cl (chiếm 75.76%) và ³⁷Cl (chiếm 24.24%). Khối lượng nguyên tử trung bình của Clo là bao nhiêu?',
    options: ['35.00 u', '36.00 u', '35.45 u', '37.00 u'],
    correctAnswer: 2,
    explanation: 'Khối lượng nguyên tử trung bình = (35 × 75.76 + 37 × 24.24) / 100 ≈ 35.45 u. Đây chính là giá trị ghi trên bảng tuần hoàn IUPAC.',
  },
  {
    id: 'q10',
    topic: 'An toàn phòng thí nghiệm',
    difficulty: 'basic',
    type: 'single',
    question: 'Khi pha loãng axit sunfuric đậm đặc (H₂SO₄ đặc) với nước, thao tác kỹ thuật nào sau đây là TUYỆT ĐỐI ĐÚNG và an toàn?',
    options: [
      'Đổ nhanh nước vào cốc đựng axit sunfuric đặc',
      'Rót từ từ axit sunfuric đặc vào nước và khuấy nhẹ bằng đũa thủy tinh',
      'Đổ đồng thời cả nước và axit vào nhau',
      'Đun sôi axit trước khi pha'
    ],
    correctAnswer: 1,
    explanation: 'Axit H₂SO₄ đặc hút nước và tỏa nhiệt cực lớn. Phải luôn rót từ từ axit vào nước dọc theo đũa thủy tinh để nhiệt lượng được nước hấp thụ và tỏa đều. Tuyệt đối KHÔNG đổ nước vào axit vì nước sôi cục bộ sẽ làm bắn giọt axit gây bỏng nặng!',
  },
];

export const QuizEngine: React.FC = () => {
  const [mode, setMode] = useState<'practice' | 'exam'>('practice');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes for exam
  const [timerActive, setTimerActive] = useState<boolean>(false);

  // Timer countdown in exam mode
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === 'exam' && timerActive && !isSubmitted) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleFinishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, timerActive, isSubmitted]);

  const currentQ = QUESTIONS_BANK[currentIdx];
  const totalQuestions = QUESTIONS_BANK.length;

  const handleSelectOption = (optIdx: number) => {
    if (isSubmitted && mode === 'exam') return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentIdx]: optIdx,
    }));
  };

  const handleStartExam = () => {
    setMode('exam');
    setUserAnswers({});
    setIsSubmitted(false);
    setTimeLeft(600);
    setCurrentIdx(0);
    setTimerActive(true);
  };

  const handleFinishExam = () => {
    setIsSubmitted(true);
    setTimerActive(false);

    // Calculate score
    let correct = 0;
    QUESTIONS_BANK.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) correct++;
    });

    if (correct >= 7) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleReset = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setCurrentIdx(0);
    setTimerActive(false);
  };

  // Score statistics
  const correctCount = QUESTIONS_BANK.reduce((acc, q, idx) => {
    return userAnswers[idx] === q.correctAnswer ? acc + 1 : acc;
  }, 0);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Top Banner: Mode switcher & Exam timer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Hệ Thống Kiểm Tra & Củng Cố Kiến Thức Hóa Học</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Luyện Tập & Đánh Giá Năng Lực</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMode('practice');
              handleReset();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition border ${
              mode === 'practice'
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Luyện tập tự do
          </button>

          <button
            onClick={handleStartExam}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
              mode === 'exam'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Kiểm tra tính giờ (10 phút)</span>
          </button>
        </div>
      </div>

      {/* Main Question Card or Final Exam Results Report */}
      {isSubmitted && mode === 'exam' ? (
        /* Results Report */
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 animate-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center text-center gap-2 py-4 border-b border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 text-2xl font-black mb-1">
              {correctCount * 10}%
            </div>
            <h3 className="text-lg font-bold text-white">Kết Quả Bài Kiểm Tra Hóa Học</h3>
            <p className="text-xs text-slate-400">
              Bạn đã trả lời đúng <b className="text-emerald-400">{correctCount}</b> / {totalQuestions} câu hỏi.
            </p>
          </div>

          {/* Detailed Question Review */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              Xem Lại Chi Tiết & Lời Giải Thích Từng Câu:
            </span>

            {QUESTIONS_BANK.map((q, idx) => {
              const userAns = userAnswers[idx];
              const isCorrect = userAns === q.correctAnswer;
              return (
                <div key={q.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">
                      Câu {idx + 1}: {q.question}
                    </span>
                    {isCorrect ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1 shrink-0 ml-2">
                        <CheckCircle2 className="w-4 h-4" /> Đúng (+10đ)
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center gap-1 shrink-0 ml-2">
                        <XCircle className="w-4 h-4" /> Sai
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400">
                    <div>Đáp án của bạn: <span className={isCorrect ? 'text-emerald-300 font-medium' : 'text-rose-300 font-medium'}>{userAns !== undefined ? q.options[userAns] : 'Chưa chọn'}</span></div>
                    {!isCorrect && (
                      <div className="text-emerald-400 font-medium mt-0.5">
                        Đáp án đúng: {q.options[q.correctAnswer as number]}
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 mt-1">
                    <b className="text-cyan-400">Giải thích:</b> {q.explanation}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={handleStartExam}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Làm Lại Đề Kiểm Tra Mới</span>
            </button>
          </div>
        </div>
      ) : (
        /* Question Card */
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
          {/* Top Question Status Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold font-mono">
                Câu {currentIdx + 1}/{totalQuestions}
              </span>
              <span className="text-slate-400 font-medium hidden sm:inline">
                Chủ đề: {currentQ.topic}
              </span>
            </div>

            {mode === 'exam' && (
              <div className="flex items-center gap-1.5 font-mono text-xs bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-amber-400 font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>

          {/* Question Text */}
          <div className="text-base sm:text-lg font-semibold text-white leading-relaxed">
            {currentQ.question}
          </div>

          {/* Options List */}
          <div className="flex flex-col gap-2.5">
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = userAnswers[currentIdx] === optIdx;
              const isPracticeAnswered = mode === 'practice' && userAnswers[currentIdx] !== undefined;
              const isRightAnswer = optIdx === currentQ.correctAnswer;

              let btnStyle = 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-900';

              if (mode === 'practice' && isPracticeAnswered) {
                if (isRightAnswer) {
                  btnStyle = 'bg-emerald-600/30 border-emerald-500 text-emerald-200 font-bold';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-600/30 border-rose-500 text-rose-200 font-bold';
                }
              } else if (isSelected) {
                btnStyle = 'bg-cyan-600/30 border-cyan-400 text-cyan-200 font-bold';
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm transition flex items-center justify-between ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {mode === 'practice' && isPracticeAnswered && (
                    <span>
                      {isRightAnswer ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : isSelected ? (
                        <XCircle className="w-5 h-5 text-rose-400" />
                      ) : null}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Instant Explanation in Practice Mode */}
          {mode === 'practice' && userAnswers[currentIdx] !== undefined && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex flex-col gap-1.5 animate-in fade-in duration-150">
              <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Giải thích khoa học chi tiết:</span>
              </span>
              <p className="leading-relaxed text-slate-300/90">{currentQ.explanation}</p>
            </div>
          )}

          {/* Question Navigation Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
            <button
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className={`px-4 py-2 rounded-xl border text-xs font-medium transition ${
                currentIdx === 0 
                  ? 'opacity-40 border-slate-800 text-slate-600 cursor-not-allowed' 
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              ← Câu trước
            </button>

            {currentIdx < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition"
              >
                <span>Câu tiếp theo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : mode === 'exam' ? (
              <button
                onClick={handleFinishExam}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-lg transition"
              >
                Nộp bài & Xem kết quả
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Làm lại từ đầu</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
