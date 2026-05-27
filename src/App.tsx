import { useState, useEffect } from 'react';
import { Clock, Play, Pause, RotateCcw, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { questions } from './data/questions';
import type { Topic } from './data/questions';
import { Sidebar } from './components/Sidebar/Sidebar';
import { SqlEditor } from './components/Editor/SqlEditor';
import { QuestionPanel } from './components/Panel/QuestionPanel';
import { ResultsPanel } from './components/Panel/ResultsPanel';
import { useLocalStorage } from './hooks/useLocalStorage';
import { usePGlite } from './hooks/usePGlite';

function App() {
  const [currentQuestionId, setCurrentQuestionId] = useState(questions[0].id);
  const [difficultyFilter, setDifficultyFilter] = useState<'ALL' | 'Easy' | 'Medium' | 'Hard'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNSOLVED' | 'SOLVED'>('ALL');
  const [topicFilter, setTopicFilter] = useState<'ALL' | Topic>('ALL');
  const [companyFilter, setCompanyFilter] = useState<'ALL' | string>('ALL');
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'results' | 'expected'>('results');
  const [hintsRevealed, setHintsRevealed] = useState(0);
  
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const {
    solvedQuestions,
    attempts,
    markAsSolved,
    saveAttempt,
    clearAttemptsForQuestion,
    resetAllProgress,
  } = useLocalStorage();

  const question = questions.find(q => q.id === currentQuestionId) || questions[0];
  const currentQuestionNumber = questions.findIndex(q => q.id === question.id) + 1;

  const {
    isLoading,
    dbError,
    tablesInfo,
    schemaForAutocomplete,
    expectedOutput,
    queryResult,
    queryError,
    execTimeMs,
    isCorrect,
    runQuery,
  } = usePGlite(question);

  // Timer logic
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Reset state on question change
  useEffect(() => {
    setQuery('');
    setHintsRevealed(0);
    setTimerSeconds(0);
    setIsTimerRunning(false);
    setActiveTab('results');
  }, [question.id]);

  const handleRunQuery = async () => {
    const res = await runQuery(query);
    if (res.isCorrect) {
      setIsTimerRunning(false);
      markAsSolved(question.id);
      saveAttempt(question.id, query, timerSeconds);
    }
  };

  const loadSolution = () => {
    setQuery(question.solutionSql);
  };

  const handleClearLeaderboard = () => {
    if (window.confirm("Are you sure you want to clear your attempt history for this question?")) {
      clearAttemptsForQuestion(question.id);
    }
  };

  const questionAttempts = (attempts[question.id] || []).sort((a, b) => {
    if (a.timeTaken !== b.timeTaken) return a.timeTaken - b.timeTaken;
    return b.timestamp - a.timestamp;
  });

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        questions={questions}
        currentQuestionId={currentQuestionId}
        setCurrentQuestionId={setCurrentQuestionId}
        solvedQuestions={solvedQuestions}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={setDifficultyFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        topicFilter={topicFilter}
        setTopicFilter={setTopicFilter}
        companyFilter={companyFilter}
        setCompanyFilter={setCompanyFilter}
        onResetProgress={resetAllProgress}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-950/40">
        {/* If Left Panel is Expanded on desktop, render split headers. Otherwise, render unified header */}
        {!isLeftPanelCollapsed ? (
          <>
            {/* Split Headers for Desktop */}
            <div className="h-16 hidden lg:flex shrink-0 z-10">
              <div className="w-[41.67%] border-b border-r border-gray-800 bg-gray-900/60 flex items-center justify-between px-6 backdrop-blur-md shrink-0">
                <div className="flex items-center space-x-3 text-sm">
                  <button
                    onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                    className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors mr-2 cursor-pointer focus:outline-none"
                    title="Hide Question & Schema Panel"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                  <span className="text-gray-400 font-medium">Practice Arena</span>
                  <span className="text-gray-600">/</span>
                  <span className="text-white font-semibold">{question.title}</span>
                </div>
              </div>
              <div className="flex-1 border-b border-gray-800 bg-gray-900/60 flex items-center justify-end px-6 backdrop-blur-md">
                {/* Elegant Timer */}
                <div className="flex items-center space-x-3 bg-gray-950/80 border border-gray-800/80 px-4 py-1.5 rounded-full shadow-inner">
                  <Clock className={`w-4 h-4 transition-all duration-300 ${isTimerRunning ? 'text-blue-400 animate-pulse scale-110' : 'text-gray-500'}`} />
                  <span className={`font-mono text-sm font-semibold tracking-wider ${isTimerRunning ? 'text-white' : 'text-gray-400'}`}>
                    {(() => {
                      const h = Math.floor(timerSeconds / 3600);
                      const m = Math.floor((timerSeconds % 3600) / 60);
                      const s = timerSeconds % 60;
                      const pad = (n: number) => n.toString().padStart(2, '0');
                      return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
                    })()}
                  </span>
                  <div className="h-4 w-px bg-gray-800"></div>
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all duration-200 active:scale-95 ${
                      isTimerRunning 
                        ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20' 
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="w-3 h-3" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        <span>Start</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setTimerSeconds(0);
                      setIsTimerRunning(false);
                    }}
                    className="p-1 hover:bg-gray-800 rounded-full text-gray-500 hover:text-gray-300 transition-colors"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Unified Header for Mobile when Expanded */}
            <div className="h-16 flex lg:hidden border-b border-gray-800 bg-gray-900/60 items-center justify-between px-6 shrink-0 z-10 backdrop-blur-md">
              <div className="flex items-center space-x-3 text-sm">
                <button
                  onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                  className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors mr-2 cursor-pointer focus:outline-none"
                  title="Hide Question & Schema Panel"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
                <span className="text-gray-400 font-medium">Practice Arena</span>
                <span className="text-gray-600">/</span>
                <span className="text-white font-semibold truncate max-w-[120px]">{question.title}</span>
              </div>

              {/* Elegant Timer */}
              <div className="flex items-center space-x-3 bg-gray-950/80 border border-gray-800/80 px-4 py-1.5 rounded-full shadow-inner scale-90 origin-right">
                <Clock className={`w-4 h-4 transition-all duration-300 ${isTimerRunning ? 'text-blue-400 animate-pulse scale-110' : 'text-gray-500'}`} />
                <span className={`font-mono text-sm font-semibold tracking-wider ${isTimerRunning ? 'text-white' : 'text-gray-400'}`}>
                  {(() => {
                    const h = Math.floor(timerSeconds / 3600);
                    const m = Math.floor((timerSeconds % 3600) / 60);
                    const s = timerSeconds % 60;
                    const pad = (n: number) => n.toString().padStart(2, '0');
                    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
                  })()}
                </span>
                <div className="h-4 w-px bg-gray-800"></div>
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all duration-200 active:scale-95 ${
                    isTimerRunning 
                      ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20' 
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-3 h-3" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>Start</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setTimerSeconds(0);
                    setIsTimerRunning(false);
                  }}
                  className="p-1 hover:bg-gray-800 rounded-full text-gray-500 hover:text-gray-300 transition-colors"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Unified Header when Left Panel is Collapsed (Desktop & Mobile) */
          <div className="h-16 border-b border-gray-800 bg-gray-900/60 flex items-center justify-between px-6 shrink-0 z-10 backdrop-blur-md">
            <div className="flex items-center space-x-3 text-sm">
              <button
                onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors mr-2 cursor-pointer focus:outline-none"
                title="Show Question & Schema Panel"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
              <span className="text-gray-400 font-medium">Practice Arena</span>
              <span className="text-gray-600">/</span>
              <span className="text-white font-semibold">{question.title}</span>
            </div>

            {/* Elegant Timer */}
            <div className="flex items-center space-x-3 bg-gray-950/80 border border-gray-800/80 px-4 py-1.5 rounded-full shadow-inner">
              <Clock className={`w-4 h-4 transition-all duration-300 ${isTimerRunning ? 'text-blue-400 animate-pulse scale-110' : 'text-gray-500'}`} />
              <span className={`font-mono text-sm font-semibold tracking-wider ${isTimerRunning ? 'text-white' : 'text-gray-400'}`}>
                {(() => {
                  const h = Math.floor(timerSeconds / 3600);
                  const m = Math.floor((timerSeconds % 3600) / 60);
                  const s = timerSeconds % 60;
                  const pad = (n: number) => n.toString().padStart(2, '0');
                  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
                })()}
              </span>
              <div className="h-4 w-px bg-gray-800"></div>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all duration-200 active:scale-95 ${
                  isTimerRunning 
                    ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20' 
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-3 h-3" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>Start</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setTimerSeconds(0);
                  setIsTimerRunning(false);
                }}
                className="p-1 hover:bg-gray-800 rounded-full text-gray-500 hover:text-gray-300 transition-colors"
                title="Reset Timer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        <div key={currentQuestionId} className="flex-1 overflow-hidden flex flex-col lg:flex-row animate-fade-in">
          {dbError ? (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="glass rounded-xl p-6 border border-red-500/20 bg-red-500/5 text-red-400 font-mono text-sm max-w-[1400px] mx-auto w-full">
                <div className="font-semibold mb-2">Database Initialization Error:</div>
                {dbError}
              </div>
            </div>
          ) : (
            <>
              {/* Left Column: Context & Schema Stacked */}
              {!isLeftPanelCollapsed && (
                <div className="w-full lg:w-[41.67%] border-b lg:border-b-0 lg:border-r border-gray-800 bg-gray-950/10 flex flex-col shrink-0 max-h-[50vh] lg:max-h-none lg:h-full">
                  <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
                    <QuestionPanel
                      question={question}
                      currentQuestionNumber={currentQuestionNumber}
                      tablesInfo={tablesInfo}
                      expectedOutput={expectedOutput}
                      hintsRevealed={hintsRevealed}
                      setHintsRevealed={setHintsRevealed}
                    />
                  </div>
                </div>
              )}

              {/* Right Column: Editor & Results */}
              <div className="flex-1 flex flex-col overflow-hidden h-full">
                <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
                  <SqlEditor
                    query={query}
                    setQuery={setQuery}
                    runQuery={handleRunQuery}
                    loadSolution={loadSolution}
                    schemaForAutocomplete={schemaForAutocomplete}
                    isLoading={isLoading}
                  />

                  <ResultsPanel
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isCorrect={isCorrect}
                    result={queryResult}
                    error={queryError}
                    expectedOutput={expectedOutput}
                    execTimeMs={execTimeMs}
                    solutionRows={expectedOutput}
                    attempts={questionAttempts}
                    setQuery={setQuery}
                    clearLeaderboard={handleClearLeaderboard}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
