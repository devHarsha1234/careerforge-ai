import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, CheckCircle2, XCircle, ArrowRight, 
  Award, Loader2, Play, Code2, Database, 
  Layers, RotateCcw, BookOpen 
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Practice() {
  const [searchParams] = useSearchParams();
  const initialTopic = searchParams.get('topic');
  
  const [mode, setMode] = useState('select'); // 'select' | 'quiz' | 'results'
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(initialTopic || null);
  
  // Quiz Session State
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answersLog, setAnswersLog] = useState([]);
  const [resultsData, setResultsData] = useState(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await api.get('/quiz/topics');
        setTopics(res.data || []);
        if (initialTopic && res.data.some(t => t.name === initialTopic || t.id === initialTopic)) {
          startQuiz(initialTopic);
        }
      } catch (err) {
        toast.error('Failed to load practice topics.');
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, [initialTopic]);

  const startQuiz = async (topicName) => {
    setLoading(true);
    setSelectedTopic(topicName);
    try {
      const res = await api.get(`/quiz/questions?topic=${encodeURIComponent(topicName)}`);
      if (!res.data || res.data.length === 0) {
        toast.error('No questions available for this topic yet.');
        setMode('select');
        return;
      }
      setQuestions(res.data);
      setCurrentIdx(0);
      setSelectedOption(null);
      setShowExplanation(false);
      setScore(0);
      setAnswersLog([]);
      setMode('quiz');
    } catch (err) {
      toast.error('Failed to initialize quiz session.');
      setMode('select');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (opt) => {
    if (showExplanation) return;
    setSelectedOption(opt);
    setShowExplanation(true);
    
    const currQ = questions[currentIdx];
    const isCorrect = opt === currQ.correct_option;
    if (isCorrect) setScore(prev => prev + 1);

    setAnswersLog(prev => [
      ...prev,
      { question: currQ.text, selected: opt, correct: currQ.correct_option, isCorrect }
    ]);
  };

  const handleNextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setLoading(true);
    const finalScore = score;
    try {
      const res = await api.post('/quiz/submit', {
        topic: selectedTopic,
        total_questions: questions.length,
        correct_answers: finalScore,
        score: finalScore,
        total: questions.length
      });
      setResultsData({ ...res.data, score: finalScore, total: questions.length });
      setMode('results');
    } catch (err) {
      toast.error('Failed to record quiz results.');
      setMode('select');
    } finally {
      setLoading(false);
    }
  };

  const getTopicIcon = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('dsa')) return <Code2 size={24} className="text-indigo-600" />;
    if (n.includes('sql') || n.includes('dbms')) return <Database size={24} className="text-amber-600" />;
    return <Layers size={24} className="text-emerald-600" />;
  };

  if (loading && mode === 'select') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 min-h-[calc(100vh-68px)]">
      
      {/* ─── MODE 1: TOPIC SELECTION ──────────────────────────────────────── */}
      {mode === 'select' && (
        <div className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
              <Sparkles size={14} />
              <span>Diagnostic Practice Arena</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">
              Test & Lock In Your Knowledge
            </h1>
            <p className="text-sm text-slate-600 font-sans">
              Randomized 5-question test sets drawn from our verified 75+ question database bank. Instant answer diagnostics and continuous XP.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topics.map(t => (
              <div 
                key={t.id || t.name} 
                className="bg-white border border-slate-200 rounded-3xl p-7 flex flex-col justify-between hover:border-indigo-400 hover:shadow-soft-md transition-all duration-300 shadow-soft-sm group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                    {getTopicIcon(t.name)}
                  </div>
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">
                    TECHNICAL TRACK
                  </span>
                  <h3 className="text-xl font-heading font-bold text-slate-900 mt-0.5 mb-2">
                    {t.name}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {t.description || "Core concepts, algorithmic reasoning, and tricky edge-case interview challenges."}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-600 font-bold mb-6">
                    <Sparkles size={14} />
                    <span>+{t.xp_reward || 50} XP on Completion</span>
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-100">
                  <button
                    onClick={() => startQuiz(t.name)}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Play size={14} />
                    <span>Start Practice Session</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Education Loop Reminder */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between text-xs text-slate-600 shadow-soft-sm">
            <div className="flex items-center gap-3">
              <BookOpen size={18} className="text-indigo-600 flex-shrink-0" />
              <span>Unsure about a topic? Review our structured concept guides before attempting quizzes.</span>
            </div>
            <Link to="/learn" className="text-indigo-600 hover:underline font-bold flex-shrink-0">
              Open Learn Hub →
            </Link>
          </div>
        </div>
      )}

      {/* ─── MODE 2: ACTIVE QUIZ ARENA ────────────────────────────────────── */}
      {mode === 'quiz' && questions.length > 0 && (
        <div className="space-y-6 max-w-3xl mx-auto">
          
          {/* Top Session Bar */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-600 pb-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-white text-slate-900 font-bold border border-slate-200 shadow-soft-sm">
                {selectedTopic}
              </span>
              <span>Question {currentIdx + 1} of {questions.length}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-amber-600 font-bold flex items-center gap-1">
                <Sparkles size={14} /> Score: {score}
              </span>
              <button 
                onClick={() => setMode('select')}
                className="hover:text-slate-900 transition-colors text-[11px] font-bold text-slate-500"
              >
                Exit
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-9 shadow-soft-md space-y-6">
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {questions[currentIdx].difficulty || 'Intermediate'} Difficulty
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                {selectedTopic} Challenge
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-heading font-bold text-slate-900 leading-snug">
              {questions[currentIdx].text}
            </h2>

            {/* Answer Options */}
            <div className="space-y-3 pt-2">
              {questions[currentIdx].options?.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === questions[currentIdx].correct_option;
                
                let btnStyle = "bg-[#FAFAF7] border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-900";
                
                if (showExplanation) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold";
                  } else if (isSelected && !isCorrect) {
                    btnStyle = "bg-rose-50 border-rose-300 text-rose-800 font-bold";
                  } else {
                    btnStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(opt)}
                    disabled={showExplanation}
                    className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {showExplanation && isCorrect && (
                      <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                    )}
                    {showExplanation && isSelected && !isCorrect && (
                      <XCircle size={18} className="text-rose-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Block */}
            {showExplanation && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-700 leading-relaxed"
              >
                <div className="flex items-center gap-2 font-bold">
                  {selectedOption === questions[currentIdx].correct_option ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 size={14} /> Correct answer! (+10 XP)
                    </span>
                  ) : (
                    <span className="text-rose-700 flex items-center gap-1">
                      <XCircle size={14} /> Incorrect choice
                    </span>
                  )}
                </div>
                <p className="text-slate-600 font-sans">
                  {questions[currentIdx].explanation}
                </p>
              </motion.div>
            )}

            {/* Next / Submit Button */}
            {showExplanation && (
              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  className="px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                >
                  <span>{currentIdx < questions.length - 1 ? 'Next Question' : 'Complete Quiz & View Results'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ─── MODE 3: QUIZ RESULTS & DIAGNOSTIC RETROSPECTIVE ──────────────── */}
      {mode === 'results' && resultsData && (
        <div className="max-w-2xl mx-auto space-y-8">
          
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-soft-lg relative overflow-hidden">
            
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mx-auto">
              <Award size={32} />
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase font-bold text-indigo-700 tracking-widest">
                SESSION COMPLETED
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 mt-1">
                Quiz Diagnostics
              </h2>
            </div>

            {/* Score Display */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-around">
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">Questions Correct</span>
                <span className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900">
                  {resultsData.score} / {resultsData.total}
                </span>
              </div>
              <div className="h-10 w-[1px] bg-slate-200" />
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">Accuracy</span>
                <span className="text-3xl sm:text-4xl font-heading font-extrabold text-emerald-600">
                  {Math.round(resultsData.accuracy || (resultsData.score / resultsData.total) * 100)}%
                </span>
              </div>
              <div className="h-10 w-[1px] bg-slate-200" />
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">XP Awarded</span>
                <span className="text-3xl sm:text-4xl font-heading font-extrabold text-amber-600">
                  +{resultsData.xp_earned || resultsData.score * 10}
                </span>
              </div>
            </div>

            {/* Questions review recap */}
            <div className="text-left space-y-2 pt-2">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Session Breakdown
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {answersLog.map((log, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs">
                    {log.isCorrect ? (
                      <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-slate-900 font-medium line-clamp-1">{log.question}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {log.isCorrect ? `Correct: ${log.selected}` : `Correct answer: ${log.correct}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => startQuiz(selectedTopic)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <RotateCcw size={14} />
                <span>Retry (New Random Set)</span>
              </button>

              <button
                onClick={() => setMode('select')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Select Another Track
              </button>

              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors text-center"
              >
                Dashboard
              </Link>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
