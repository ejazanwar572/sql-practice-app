import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql, PostgreSQL } from '@codemirror/lang-sql';
import { keymap } from '@codemirror/view';
import { acceptCompletion } from '@codemirror/autocomplete';
import { Prec } from '@codemirror/state';
import { Play, Pause, Clock, RotateCcw, Database, CheckCircle, XCircle, BookOpen, Trash2, AlertTriangle, Check, Trophy, Copy, Terminal } from 'lucide-react';
import { PGlite } from '@electric-sql/pglite';
import { questions } from './data/questions';

let pg: PGlite | null = null;
let initPromise: Promise<PGlite> | null = null;

async function getPGlite(): Promise<PGlite> {
  if (pg) return pg;
  if (initPromise) return initPromise;
  
  initPromise = new Promise(async (resolve, reject) => {
    try {
      console.log("PGlite: Instantiating...");
      const db = new PGlite();
      console.log("PGlite: Initialized synchronously.");
      pg = db;
      resolve(db);
    } catch (e) {
      console.error("PGlite: Failed to instantiate", e);
      reject(e);
    }
  });
  
  return initPromise;
}

interface Attempt {
  id: string;
  query: string;
  timeTaken: number;
  timestamp: number;
}


const companyStyles: Record<string, string> = {
  Amazon: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Google: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Meta: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Uber: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20',
  Stripe: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  LinkedIn: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  Airbnb: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Delta: 'bg-red-500/10 text-red-400 border-red-500/20',
  DraftKings: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const renderCompanyLogo = (company?: string, sizeClass = "w-3.5 h-3.5") => {
  if (!company) return null;
  const name = company.toLowerCase();
  if (name.includes('google')) {
    return (
      <svg className={`${sizeClass} inline-block`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>Google</title>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
      </svg>
    );
  }
  if (name.includes('amazon')) {
    return (
      <svg className={`${sizeClass} inline-block`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>Amazon</title>
        <path d="M18.8 19.3c-2.4 1.7-5.9 2.5-9 2.5-4.4 0-8.3-2.1-10.4-5.3-.3-.4 0-.8.4-.7 1.4.4 3 .6 4.6.6 3.5 0 7.2-1 9.7-2.9.4-.3.8.1.7.5-.1.3-1.2 1.6-3 2.9-1 .8-2.2 1.4-3.5 1.7 4 .8 8.8-1.1 11.2-4.5.3-.4.8-.1.7.3-.2.9-.8 1.9-1.5 2.9z" fill="#FF9900" />
        <path d="M19.7 13.9c-.2-.6-.9-.8-1.5-.6l-5.1 1.7c-.5.2-.6.7-.3 1 .9 1.1 2.3 1.9 3.6 1.9.6 0 1.2-.2 1.7-.5.7-.5 1-1.2.9-1.9.1.1.1.1 0 0l.7-1.6z" fill="#FF9900" />
      </svg>
    );
  }
  if (name.includes('meta')) {
    return (
      <svg className={`${sizeClass} inline-block`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>Meta</title>
        <path d="M16.5 6C14.07 6 12.22 7.74 12 10.12 11.78 7.74 9.93 6 7.5 6 4.46 6 2 8.46 2 11.5S4.46 17 7.5 17c2.43 0 4.28-1.74 4.5-4.12.22 2.38 2.07 4.12 4.5 4.12 3.04 0 5.5-2.46 5.5-5.5S19.54 6 16.5 6zm0 9c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm-9 0C5.57 15 4 13.43 4 11.5S5.57 8 7.5 8s3.5 1.57 3.5 3.5S9.43 15 7.5 15z" fill="#0668E1" />
      </svg>
    );
  }
  if (name.includes('uber')) {
    return (
      <svg className={`${sizeClass} inline-block rounded bg-black p-0.5`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>Uber</title>
        <circle cx="12" cy="12" r="7" fill="#FFFFFF" />
        <rect x="10" y="10" width="4" height="4" fill="#000000" />
        <path d="M12 12h7" stroke="#FFFFFF" strokeWidth="2.5" />
      </svg>
    );
  }
  if (name.includes('stripe')) {
    return (
      <svg className={`${sizeClass} inline-block`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>Stripe</title>
        <rect width="24" height="24" rx="5" fill="#635BFF" />
        <path d="M13.9 8.3c-1.1-.3-1.8-.6-1.8-1.1 0-.5.5-.7 1.2-.7 1 0 1.9.3 2.6.8l.6-2.1c-.8-.4-1.9-.7-3.2-.7-2.6 0-4.3 1.4-4.3 3.7 0 3.5 4.8 2.9 4.8 4.7 0 .6-.6.9-1.4.9-1.2 0-2.3-.4-3.1-1l-.6 2.2c1 .6 2.3.9 3.7.9 2.7 0 4.6-1.3 4.6-3.8 0-3.6-4.8-3-4.8-4.7z" fill="#FFFFFF" />
      </svg>
    );
  }
  if (name.includes('linkedin')) {
    return (
      <svg className={`${sizeClass} inline-block`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>LinkedIn</title>
        <rect width="24" height="24" rx="5" fill="#0A66C2" />
        <path d="M9 19H6V10h3v9zM7.5 8.7a1.6 1.6 0 110-3.2 1.6 1.6 0 010 3.2zm11.5 10.3h-3v-4.7c0-1.1-.8-1.3-1.1-1.3-.7 0-1.4.5-1.4 1.3V19h-3V10h3v1.2c.4-.7 1.3-1.2 2.5-1.2 2 0 3 1.3 3 3.5V19z" fill="#FFFFFF" />
      </svg>
    );
  }
  if (name.includes('airbnb')) {
    return (
      <svg className={`${sizeClass} inline-block`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>Airbnb</title>
        <path d="M12 21.6c-.4 0-.8-.2-1-.6C9.1 18.2 4.4 11.2 4.4 8.4 4.4 4.1 7.8.8 12 .8s7.6 3.3 7.6 7.6c0 2.8-4.7 9.8-6.6 12.6-.2.4-.6.6-1 .6zm0-19c-3.1 0-5.6 2.5-5.6 5.6 0 1.9 3.5 7.6 5.6 10.7 2.1-3.1 5.6-8.8 5.6-10.7 0-3.1-2.5-5.6-5.6-5.6z" fill="#FF5A5F" />
        <circle cx="12" cy="8.4" r="2" fill="#FF5A5F" />
      </svg>
    );
  }
  return (
    <span className="px-1 py-0.5 text-[8px] font-bold rounded bg-gray-800 text-gray-400 border border-gray-700">
      {company}
    </span>
  );
};

function App() {
  const [currentQuestionId, setCurrentQuestionId] = useState(questions[0].id);
  const [difficultyFilter, setDifficultyFilter] = useState<'ALL' | 'Easy' | 'Medium' | 'Hard'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNSOLVED' | 'SOLVED'>('ALL');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  const [tablesInfo, setTablesInfo] = useState<{name: string, columns: {name: string, type: string}[], sampleData: any[]}[]>([]);
  const [expectedOutput, setExpectedOutput] = useState<any[] | null>(null);
  const [schemaForAutocomplete, setSchemaForAutocomplete] = useState<Record<string, string[]>>({});

  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [execTimeMs, setExecTimeMs] = useState(0);
  const [solutionRows, setSolutionRows] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'results' | 'expected'>('results');
  
  const [solvedQuestions, setSolvedQuestions] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('sql_solved_questions');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [attempts, setAttempts] = useState<Record<string, Attempt[]>>(() => {
    const saved = localStorage.getItem('sql_attempts_leaderboard');
    return saved ? JSON.parse(saved) : {};
  });
  const [copiedAttemptId, setCopiedAttemptId] = useState<string | null>(null);

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

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

  const question = questions.find(q => q.id === currentQuestionId) || questions[0];
  const currentQuestionNumber = questions.findIndex(q => q.id === question.id) + 1;

  const questionAttempts = (attempts[question.id] || []).sort((a, b) => {
    if (a.timeTaken !== b.timeTaken) return a.timeTaken - b.timeTaken;
    return b.timestamp - a.timestamp;
  });

  const filteredQuestions = questions.filter(q => {
    if (difficultyFilter !== 'ALL' && q.difficulty !== difficultyFilter) return false;
    if (statusFilter === 'SOLVED' && !solvedQuestions.has(q.id)) return false;
    if (statusFilter === 'UNSOLVED' && solvedQuestions.has(q.id)) return false;
    return true;
  });

  const getDifficultyCount = (diff: 'ALL' | 'Easy' | 'Medium' | 'Hard') => {
    return questions.filter(q => {
      if (diff !== 'ALL' && q.difficulty !== diff) return false;
      if (statusFilter === 'SOLVED' && !solvedQuestions.has(q.id)) return false;
      if (statusFilter === 'UNSOLVED' && solvedQuestions.has(q.id)) return false;
      return true;
    }).length;
  };

  const formatValue = (val: any) => {
    if (val === null || val === undefined) return <span className="text-gray-500 italic">NULL</span>;
    // Handle cross-context Date objects perfectly
    if (val instanceof Date || Object.prototype.toString.call(val) === '[object Date]') {
      const d = val as Date;
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    }
    if (typeof val === 'object') return JSON.stringify(val);
    return val.toString();
  };

  useEffect(() => {
    let isMounted = true;
    
    async function initDB() {
      setIsLoading(true);
      setError(null);
      setResult(null);
      
      try {
        console.log("initDB: Getting DB instance...");
        const db = await getPGlite();
        
        console.log("initDB: Running setupSql...");
        await db.exec(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
        await db.exec(question.setupSql);
        console.log("initDB: setupSql completed successfully.");
        
        // Fetch dynamic schema and sample data
        const schemaRes = await db.query(`
          SELECT table_name, column_name, data_type 
          FROM information_schema.columns 
          WHERE table_schema = 'public'
          ORDER BY table_name, ordinal_position;
        `);
        
        const tablesMap = new Map<string, any>();
        const autocomplete: Record<string, string[]> = {};
        
        for (const row of schemaRes.rows as any[]) {
          const tName = row.table_name;
          if (!tablesMap.has(tName)) {
            tablesMap.set(tName, { name: tName, columns: [], sampleData: [] });
            autocomplete[tName] = [];
          }
          tablesMap.get(tName).columns.push({ name: row.column_name, type: row.data_type });
          autocomplete[tName].push(row.column_name);
        }
        
        const tablesInfoArr = Array.from(tablesMap.values());
        for (const table of tablesInfoArr) {
          const sampleRes = await db.query(`SELECT * FROM ${table.name} LIMIT 5;`);
          table.sampleData = sampleRes.rows;
        }
        
        // Fetch expected output for the question
        let expOut: any[] = [];
        try {
          const solRes = await db.query(question.solutionSql);
          if (Array.isArray(solRes)) {
            expOut = solRes[solRes.length - 1]?.rows || [];
          } else {
            expOut = solRes?.rows || [];
          }
        } catch(e) { console.error("Error fetching expected output", e); }
        
        if (isMounted) {
          setTablesInfo(tablesInfoArr);
          setSchemaForAutocomplete(autocomplete);
          setExpectedOutput(expOut);
          setSolutionRows(expOut);
          setActiveTab('results'); // default back to results
          setIsLoading(false);
        }
      } catch (e: any) {
        console.error("initDB error:", e);
        if (isMounted) {
          setError("Failed to initialize database schema: " + (e?.message || String(e)));
          setIsLoading(false);
        }
      }
    }
    
    initDB();
    setQuery(''); // Reset query on question change
    setHintsRevealed(0);
    setExecTimeMs(0);
    setTimerSeconds(0);
    setIsTimerRunning(false);
    
    return () => {
      isMounted = false;
    };
  }, [question.id]);

  const runQuery = async () => {
    if (!pg) {
      console.error("PGlite instance is null");
      return;
    }
    console.log("Running query:", query);
    setError(null);
    setResult(null);
    setIsCorrect(null);
    setIsLoading(true);
    
    try {
      const start = performance.now();
      const res = await pg.query(query);
      const end = performance.now();
      setExecTimeMs(Math.round(end - start));
      console.log("Query success:", res);
      
      let userRows: any[] = [];
      if (Array.isArray(res)) {
        const lastResult = res[res.length - 1];
        userRows = lastResult?.rows || [];
      } else {
        userRows = res?.rows || [];
      }
      setResult(userRows);
      
      // Compare with solution
      try {
        const isMatch = JSON.stringify(userRows) === JSON.stringify(solutionRows);
        setIsCorrect(isMatch);
        if (isMatch) {
          setIsTimerRunning(false);
          setSolvedQuestions(prev => {
            const next = new Set(prev).add(question.id);
            localStorage.setItem('sql_solved_questions', JSON.stringify(Array.from(next)));
            return next;
          });

          // Record successful attempt on leaderboard
          setAttempts(prev => {
            const currentAttempts = prev[question.id] || [];
            const isDuplicate = currentAttempts.some(
              a => a.query.trim() === query.trim() && a.timeTaken === timerSeconds
            );
            if (isDuplicate) return prev;
            
            const newAttempt: Attempt = {
              id: Math.random().toString(36).substring(2, 9),
              query: query,
              timeTaken: timerSeconds,
              timestamp: Date.now()
            };
            const next = {
              ...prev,
              [question.id]: [...currentAttempts, newAttempt]
            };
            localStorage.setItem('sql_attempts_leaderboard', JSON.stringify(next));
            return next;
          });
        }
      } catch (solErr) {
        console.error("Failed to execute solution query for comparison", solErr);
      }
      
    } catch (e: any) {
      console.error("Query error:", e);
      setError(e?.message || String(e));
      setIsCorrect(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSolution = () => {
    setQuery(question.solutionSql);
  };

  const getRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const copyAttemptQuery = (qText: string, attemptId: string) => {
    navigator.clipboard.writeText(qText);
    setCopiedAttemptId(attemptId);
    setTimeout(() => setCopiedAttemptId(null), 1500);
  };

  const clearLeaderboard = () => {
    if (window.confirm("Are you sure you want to clear your attempt history for this question?")) {
      setAttempts(prev => {
        const next = { ...prev };
        delete next[question.id];
        localStorage.setItem('sql_attempts_leaderboard', JSON.stringify(next));
        return next;
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command + Return (Mac) or Ctrl + Enter (Windows)
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        runQuery();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans selection:bg-blue-500/30 overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-[346px] shrink-0 border-r border-gray-800 bg-gray-900/50 flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-gray-800 bg-gray-900 shrink-0">
          <div className="p-2 bg-blue-500/10 rounded-lg mr-3">
            <Database className="w-5 h-5 text-blue-400" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white">SQL Practice</h1>
        </div>
        
        <div className="p-4 border-b border-gray-800 font-semibold text-gray-400 uppercase tracking-wider text-xs shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span>Problem List</span>
            <div className="flex bg-gray-900 rounded p-0.5 border border-gray-800">
              <button onClick={() => setStatusFilter('ALL')} className={`px-2 py-1 rounded text-[10px] ${statusFilter === 'ALL' ? 'bg-gray-800 text-gray-200' : 'text-gray-500 hover:text-gray-300'}`}>All</button>
              <button onClick={() => setStatusFilter('UNSOLVED')} className={`px-2 py-1 rounded text-[10px] ${statusFilter === 'UNSOLVED' ? 'bg-gray-800 text-gray-200' : 'text-gray-500 hover:text-gray-300'}`}>Unsolved</button>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => setDifficultyFilter('ALL')} className={`flex-1 py-1.5 rounded text-[10px] border ${difficultyFilter === 'ALL' ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-800/50'}`}>All ({getDifficultyCount('ALL')})</button>
            <button onClick={() => setDifficultyFilter('Easy')} className={`flex-1 py-1.5 rounded text-[10px] border ${difficultyFilter === 'Easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-transparent border-transparent text-emerald-500/50 hover:bg-emerald-500/5'}`}>Easy ({getDifficultyCount('Easy')})</button>
            <button onClick={() => setDifficultyFilter('Medium')} className={`flex-1 py-1.5 rounded text-[10px] border ${difficultyFilter === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-transparent border-transparent text-yellow-500/50 hover:bg-yellow-500/5'}`}>Med ({getDifficultyCount('Medium')})</button>
            <button onClick={() => setDifficultyFilter('Hard')} className={`flex-1 py-1.5 rounded text-[10px] border ${difficultyFilter === 'Hard' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-transparent border-transparent text-red-500/50 hover:bg-red-500/5'}`}>Hard ({getDifficultyCount('Hard')})</button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredQuestions.map((q) => {
            const originalIdx = questions.findIndex(orig => orig.id === q.id);
            const isSelected = currentQuestionId === q.id;
            const diffColor = q.difficulty === 'Easy' ? 'bg-emerald-500' : q.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500';
            
            return (
              <button 
                key={q.id}
                onClick={() => setCurrentQuestionId(q.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between group ${isSelected ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-gray-400 hover:bg-gray-800/80 hover:text-gray-200'}`}
              >
                <div className="flex items-center flex-1 pr-2 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full mr-2.5 shrink-0 ${diffColor}`}></div>
                  <span className="truncate mr-2">{originalIdx + 1}. {q.title}</span>
                  {q.company && (
                    <span className={`flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-semibold rounded border shrink-0 ${companyStyles[q.company] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                      {renderCompanyLogo(q.company, "w-2.5 h-2.5 shrink-0")}
                      <span>{q.company}</span>
                    </span>
                  )}
                </div>
                {solvedQuestions.has(q.id) && (
                  <div className="flex items-center justify-center w-[18px] h-[18px] rounded-full bg-emerald-500/15 border border-emerald-500/30 shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
          {filteredQuestions.length === 0 && (
            <div className="text-center p-4 text-gray-500 text-xs">No questions match these filters.</div>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-950/40">
        
        {/* Workspace Top Header / Toolbar */}
        <div className="h-16 border-b border-gray-800 bg-gray-900/60 flex items-center justify-between px-6 shrink-0 z-10 backdrop-blur-md">
          <div className="flex items-center space-x-3 text-sm">
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

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1400px] mx-auto w-full">
            
            {/* Main Content Grid */}
            <div key={currentQuestionId} className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Left Column: Context & Schema Stacked */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 flex items-center shadow-sm backdrop-blur-md rounded-bl-lg overflow-hidden border-b border-l border-white/10">
                {question.company && (
                  <div className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-semibold border-r border-white/10 flex items-center gap-1.5">
                    {renderCompanyLogo(question.company, "w-3.5 h-3.5")}
                    <span>{question.company}</span>
                  </div>
                )}
                <div className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-semibold">
                  {question.difficulty}
                </div>
              </div>
              <h2 className="text-sm font-medium text-blue-400 uppercase tracking-wider mb-2 flex items-center">
                Question {currentQuestionNumber}
              </h2>
              <h3 className="text-xl font-semibold text-white mb-3 pr-24">{question.title}</h3>
              <p className="text-base text-gray-300 leading-relaxed whitespace-pre-wrap">
                {question.description}
              </p>
            </div>

            <div className="glass rounded-xl p-6">
              <h2 className="text-sm font-medium text-purple-400 uppercase tracking-wider mb-4">Database Schema</h2>
              <div className="space-y-6">
                {tablesInfo.map((table) => (
                  <div key={table.name} className="bg-gray-950/80 rounded-lg border border-gray-800 overflow-hidden shadow-inner">
                    <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
                      <span className="font-mono text-sm font-semibold text-purple-300">{table.name}</span>
                    </div>
                    <div className="p-4">
                      {table.sampleData.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-gray-900 border-b border-gray-800">
                                {table.columns.map(col => (
                                  <th key={col.name} className="px-3 py-2 text-gray-400 font-medium whitespace-nowrap">
                                    <span className="uppercase">{col.name}</span> <span className="lowercase text-gray-500">({col.type.replace(' without time zone', '')})</span>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                              {table.sampleData.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-800/50">
                                  {table.columns.map(col => (
                                    <td key={col.name} className="px-3 py-2 text-gray-300 font-mono">{formatValue(row[col.name])}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {question.hints && question.hints.length > 0 && (
              <div className="glass rounded-xl p-6">
                <h4 className="text-sm font-medium text-purple-400 uppercase tracking-wider mb-3">Need a hint?</h4>
                <div className="space-y-2">
                  {question.hints.slice(0, hintsRevealed).map((hint, i) => (
                    <div key={i} className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-sm text-purple-200">
                      <span className="font-bold mr-2 text-purple-400">Hint {i + 1}:</span> {hint}
                    </div>
                  ))}
                  {hintsRevealed < question.hints.length && (
                    <button 
                      onClick={() => setHintsRevealed(h => h + 1)}
                      className="text-xs font-medium text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 px-3 py-1.5 rounded border border-purple-500/20 transition-colors"
                    >
                      + Reveal Hint {hintsRevealed + 1}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Editor & Results */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass rounded-xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-end px-4 py-3 border-b border-gray-800 bg-gray-900/50">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setQuery('')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 text-xs font-medium rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                  <button 
                    onClick={loadSolution}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-800 text-xs font-medium rounded transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Solution</span>
                  </button>
                  <button 
                    onClick={runQuery}
                    disabled={isLoading}
                    title="Run Query (Cmd + Return)"
                    className="flex items-center space-x-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-md transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    <span>Run Query</span>
                  </button>
                </div>
              </div>
              <div className="p-0 bg-[#282c34]">
                <CodeMirror
                  value={query}
                  height="250px"
                  theme="dark"
                  placeholder="-- Write your SQL query here..."
                  extensions={[
                    sql({ dialect: PostgreSQL, schema: schemaForAutocomplete, upperCaseKeywords: true }),
                    Prec.highest(keymap.of([{ key: "Tab", run: acceptCompletion }]))
                  ]}
                  onChange={(value) => setQuery(value)}
                  className="text-base"
                />
              </div>
            </div>

            {/* Results Area */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl shadow-black/20 min-h-[300px] flex flex-col overflow-hidden">
              <div className="px-5 border-b border-gray-800 bg-gray-900/50 flex justify-between items-end pt-3">
                <div className="flex space-x-6">
                  <button 
                    onClick={() => setActiveTab('results')}
                    className={`pb-3 text-sm font-medium tracking-wider uppercase transition-colors border-b-2 ${activeTab === 'results' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-400'}`}
                  >
                    Results Output
                  </button>
                  <button 
                    onClick={() => setActiveTab('expected')}
                    className={`pb-3 text-sm font-medium tracking-wider uppercase transition-colors border-b-2 ${activeTab === 'expected' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-400'}`}
                  >
                    Expected Output
                  </button>
                </div>
                <div className="flex items-center space-x-3 pb-3">
                  {isCorrect !== null && activeTab === 'results' && (
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border flex items-center space-x-1 ${
                      isCorrect 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {isCorrect ? '✨ Correct Match' : '❌ Output Mismatch'}
                    </span>
                  )}
                  {result && !error && activeTab === 'results' && (
                    <span className="flex items-center text-xs text-emerald-400 font-medium bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Query OK ({result.length} rows) {execTimeMs > 0 && <span className="ml-1 text-emerald-500/80">- {execTimeMs}ms</span>}
                    </span>
                  )}
                  {error && activeTab === 'results' && (
                    <span className="flex items-center text-xs text-red-400 font-medium bg-red-400/10 px-2 py-1 rounded-full border border-red-400/20">
                      <XCircle className="w-3.5 h-3.5 mr-1.5" /> Execution Error
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-0 overflow-auto flex-1 max-h-[400px]">
                {activeTab === 'results' ? (
                  error ? (
                    <div className="p-5 font-mono text-sm text-red-400 bg-red-400/5 h-full">
                      <div className="font-semibold mb-2">PostgreSQL Error:</div>
                      {error}
                    </div>
                  ) : result ? (
                    result.length > 0 ? (
                      <div className="w-full">
                        {(() => {
                          if (!solutionRows || solutionRows.length === 0) return null;
                          const expectedCols = Object.keys(solutionRows[0]);
                          const userCols = Object.keys(result[0]);
                          const missingCols = expectedCols.filter(c => !userCols.includes(c));
                          const extraCols = userCols.filter(c => !expectedCols.includes(c));
                          const hasMismatch = missingCols.length > 0 || extraCols.length > 0;
                          
                          if (!hasMismatch) return null;

                          return (
                            <div className="bg-orange-500/10 border-b border-orange-500/20 p-3 flex items-center text-orange-300 text-xs">
                              <AlertTriangle className="w-4 h-4 mr-2 text-orange-400 flex-shrink-0" />
                              <span className="font-semibold text-orange-400 mr-2">Column Mismatch - One or more cols Missing</span>
                              {missingCols.length > 0 && (
                                <span>- Missing columns: {missingCols.join(', ')}</span>
                              )}
                            </div>
                          );
                        })()}

                        <table className="w-full text-left border-collapse">
                          <thead className="bg-gray-800/80 sticky top-0 backdrop-blur-sm">
                            <tr>
                              {Object.keys(result[0]).map(key => {
                                const expectedCols = solutionRows && solutionRows.length > 0 ? Object.keys(solutionRows[0]) : [];
                                const userCols = Object.keys(result[0]);
                                const hasMismatch = expectedCols.filter(c => !userCols.includes(c)).length > 0 || userCols.filter(c => !expectedCols.includes(c)).length > 0;
                                
                                let headerClass = "text-gray-300";
                                if (hasMismatch) {
                                  headerClass = expectedCols.includes(key) ? "text-green-400" : "text-red-400";
                                }
                                
                                return (
                                  <th key={key} className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b border-gray-700 ${headerClass}`}>
                                    {key}
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                        <tbody className="divide-y divide-gray-800/50">
                          {result.map((row, i) => {
                            const normalizeRow = (r: any) => {
                              if (!r) return null;
                              const keys = Object.keys(r).sort();
                              return JSON.stringify(keys.map(k => {
                                const val = r[k];
                                return val instanceof Date ? formatValue(val) : val;
                              }));
                            };
                            
                            const rowStr = normalizeRow(row);
                            const solutionStrs = solutionRows.map(normalizeRow);
                            const isMatch = solutionStrs.includes(rowStr);
                            
                            const rowBg = isMatch ? 'bg-green-500/10 hover:bg-green-500/20' : 'bg-red-500/10 hover:bg-red-500/20';
                            const rowText = isMatch ? 'text-green-300' : 'text-red-300';
                            
                            return (
                              <tr key={i} className={`transition-colors ${rowBg}`}>
                                {Object.values(row).map((val: any, j) => (
                                  <td key={j} className={`px-5 py-3 text-sm font-mono ${rowText}`}>
                                    {formatValue(val)}
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500 font-mono text-sm flex flex-col items-center">
                        <Database className="w-8 h-8 mb-3 opacity-20" />
                        Query executed successfully but returned no rows.
                      </div>
                    )
                  ) : (
                    <div className="p-8 flex flex-col items-center justify-center h-full text-gray-600 text-sm">
                      <Play className="w-10 h-10 mb-4 opacity-10" />
                      <p>Execute a query to see the results here</p>
                    </div>
                  )
                ) : (
                  expectedOutput && expectedOutput.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-800/80 sticky top-0 backdrop-blur-sm">
                        <tr>
                          {Object.keys(expectedOutput[0]).map(key => (
                            <th key={key} className="px-5 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wider border-b border-gray-700">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50">
                        {expectedOutput.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                            {Object.values(row).map((val: any, j) => (
                              <td key={j} className="px-5 py-3 text-sm text-gray-300 font-mono">
                                {formatValue(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-gray-500 font-mono text-sm flex flex-col items-center">
                      <Database className="w-8 h-8 mb-3 opacity-20" />
                      No expected output available.
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Leaderboard Section */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl shadow-black/20 overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-semibold text-white">Your fastest successful queries for this problem</span>
                </div>
                {questionAttempts.length > 0 && (
                  <button 
                    onClick={clearLeaderboard}
                    className="flex items-center space-x-1 px-2.5 py-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 text-xs font-medium rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Leaderboard</span>
                  </button>
                )}
              </div>
              
              <div className="p-0 overflow-x-auto">
                {questionAttempts.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-800/40">
                      <tr>
                        <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800 w-[100px]">Rank</th>
                        <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800">Query Logic</th>
                        <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800 w-[120px]">Time Taken</th>
                        <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800 w-[140px]">Date Completed</th>
                        <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800 w-[120px] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {questionAttempts.map((attempt, index) => {
                        const rank = index + 1;
                        let rankBadge = '';
                        if (rank === 1) {
                          rankBadge = 'bg-amber-500/15 text-amber-400 border border-amber-500/25';
                        } else if (rank === 2) {
                          rankBadge = 'bg-zinc-300/10 text-zinc-300 border border-zinc-300/20';
                        } else if (rank === 3) {
                          rankBadge = 'bg-orange-600/15 text-orange-400 border border-orange-600/25';
                        } else {
                          rankBadge = 'bg-gray-800/80 text-gray-400 border border-gray-700/50';
                        }

                        // Formatting time taken
                        let timeStr = 'Instant';
                        if (attempt.timeTaken > 0) {
                          const mins = Math.floor(attempt.timeTaken / 60);
                          const secs = attempt.timeTaken % 60;
                          timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                        }

                        return (
                          <tr key={attempt.id} className="hover:bg-gray-800/20 transition-colors group">
                            {/* Rank */}
                            <td className="px-5 py-3 text-sm whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${rankBadge}`}>
                                #{rank}
                              </span>
                            </td>
                            
                            {/* Query Logic */}
                            <td className="px-5 py-3 text-sm max-w-[280px]">
                              <div className="flex items-center space-x-2">
                                <code className="font-mono text-xs text-gray-300 bg-gray-950/60 px-2 py-1 rounded block truncate font-medium border border-gray-900 select-all max-w-[240px]">
                                  {attempt.query}
                                </code>
                              </div>
                            </td>
                            
                            {/* Time Taken */}
                            <td className="px-5 py-3 text-sm whitespace-nowrap">
                              <div className="flex items-center space-x-1.5 text-gray-300">
                                <Clock className="w-3.5 h-3.5 text-blue-400" />
                                <span className="font-mono font-medium">{timeStr}</span>
                              </div>
                            </td>
                            
                            {/* Date Completed */}
                            <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">
                              {getRelativeTime(attempt.timestamp)}
                            </td>
                            
                            {/* Actions */}
                            <td className="px-5 py-3 text-right text-xs whitespace-nowrap">
                              <div className="flex items-center justify-end space-x-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => copyAttemptQuery(attempt.query, attempt.id)}
                                  title="Copy Query"
                                  className="p-1 text-gray-500 hover:text-white hover:bg-gray-800 rounded transition-colors"
                                >
                                  {copiedAttemptId === attempt.id ? (
                                    <Check className="w-3.5 h-3.5 text-green-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => setQuery(attempt.query)}
                                  title="Load Query into Editor"
                                  className="flex items-center space-x-1 px-2 py-1 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded border border-blue-500/20 transition-colors"
                                >
                                  <Terminal className="w-3 h-3" />
                                  <span>Load</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-gray-500 font-mono text-xs flex flex-col items-center">
                    <Trophy className="w-8 h-8 mb-3 opacity-10 text-gray-400" />
                    No completed attempts yet.
                    <span className="text-[10px] text-gray-600 mt-1">Start the timer, write the correct query, and execute it to record your rank!</span>
                  </div>
                )}
              </div>
            </div>

            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default App;
