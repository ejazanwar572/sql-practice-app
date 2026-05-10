import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { Play, Database, CheckCircle, XCircle, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
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

function App() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const question = questions[currentQuestionIndex];

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
        await db.exec(question.setupSql);
        console.log("initDB: setupSql completed successfully.");
        
        if (isMounted) setIsLoading(false);
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
      const res = await pg.query(query);
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
        const solRes = await pg.query(question.solutionSql);
        let solRows: any[] = [];
        if (Array.isArray(solRes)) {
          const solLast = solRes[solRes.length - 1];
          solRows = solLast?.rows || [];
        } else {
          solRows = solRes?.rows || [];
        }
        
        setIsCorrect(JSON.stringify(userRows) === JSON.stringify(solRows));
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

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-blue-500/30 pb-12">
      {/* Top Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Database className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-white">SQL Master</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="p-2 rounded hover:bg-gray-800 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <button 
              onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
              disabled={currentQuestionIndex === questions.length - 1}
              className="p-2 rounded hover:bg-gray-800 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 mt-8 space-y-6">
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Context & Schema */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-xl shadow-black/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-green-500/10 text-green-400 text-xs font-semibold rounded-bl-lg border-b border-l border-green-500/20">
                {question.difficulty}
              </div>
              <h2 className="text-sm font-medium text-blue-400 uppercase tracking-wider mb-2">Task</h2>
              <h3 className="text-xl font-semibold text-white mb-3">{question.title}</h3>
              <p className="text-base text-gray-300 leading-relaxed">
                {question.description}
              </p>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-xl shadow-black/20">
              <h2 className="text-sm font-medium text-purple-400 uppercase tracking-wider mb-4">Database Schema</h2>
              <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm border border-gray-800 text-gray-300 whitespace-pre-wrap leading-relaxed">
                {question.schema}
              </div>
            </div>
          </div>

          {/* Right Column: Editor & Results */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl shadow-black/20 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/50">
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">query.sql</span>
                </div>
                <div className="flex items-center space-x-3">
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
                  extensions={[sql()]}
                  onChange={(value) => setQuery(value)}
                  className="text-base"
                />
              </div>
            </div>

            {/* Results Area */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl shadow-black/20 min-h-[300px] flex flex-col overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Results Output</h3>
                <div className="flex items-center space-x-3">
                  {isCorrect !== null && (
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border flex items-center space-x-1 ${
                      isCorrect 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {isCorrect ? '✨ Correct Match' : '❌ Output Mismatch'}
                    </span>
                  )}
                  {result && !error && (
                    <span className="flex items-center text-xs text-emerald-400 font-medium bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Query OK ({result.length} rows)
                    </span>
                  )}
                  {error && (
                    <span className="flex items-center text-xs text-red-400 font-medium bg-red-400/10 px-2 py-1 rounded-full border border-red-400/20">
                      <XCircle className="w-3.5 h-3.5 mr-1.5" /> Execution Error
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-0 overflow-auto flex-1 max-h-[400px]">
                {error ? (
                  <div className="p-5 font-mono text-sm text-red-400 bg-red-400/5 h-full">
                    <div className="font-semibold mb-2">PostgreSQL Error:</div>
                    {error}
                  </div>
                ) : result ? (
                  result.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-800/80 sticky top-0 backdrop-blur-sm">
                        <tr>
                          {Object.keys(result[0]).map(key => (
                            <th key={key} className="px-5 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wider border-b border-gray-700">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50">
                        {result.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                            {Object.values(row).map((val: any, j) => (
                              <td key={j} className="px-5 py-3 text-sm text-gray-300 font-mono">
                                {val !== null ? val.toString() : <span className="text-gray-500 italic">NULL</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
