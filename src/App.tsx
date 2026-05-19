import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql, PostgreSQL } from '@codemirror/lang-sql';
import { Play, Database, CheckCircle, XCircle, BookOpen, Trash2 } from 'lucide-react';
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

  const question = questions[currentQuestionIndex];

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
          const sampleRes = await db.query(`SELECT * FROM ${table.name} LIMIT 3;`);
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
          setSolvedQuestions(prev => {
            const next = new Set(prev).add(question.id);
            localStorage.setItem('sql_solved_questions', JSON.stringify(Array.from(next)));
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

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans selection:bg-blue-500/30 overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-72 shrink-0 border-r border-gray-800 bg-gray-900/50 flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-gray-800 bg-gray-900 shrink-0">
          <div className="p-2 bg-blue-500/10 rounded-lg mr-3">
            <Database className="w-5 h-5 text-blue-400" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white">SQL Master</h1>
        </div>
        
        <div className="p-4 border-b border-gray-800 font-semibold text-gray-400 uppercase tracking-wider text-xs shrink-0">
          Problem List
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {questions.map((q, idx) => (
            <button 
              key={q.id}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between group ${currentQuestionIndex === idx ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-gray-400 hover:bg-gray-800/80 hover:text-gray-200'}`}
            >
              <span className="truncate flex-1 pr-2">{idx + 1}. {q.title}</span>
              {solvedQuestions.has(q.id) && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1400px] mx-auto w-full">
            
            {/* Main Content Grid */}
            <div key={currentQuestionIndex} className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Left Column: Context & Schema */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 flex items-center shadow-sm backdrop-blur-md rounded-bl-lg overflow-hidden border-b border-l border-white/10">
                {question.company && (
                  <div className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-semibold border-r border-white/10">
                    {question.company}
                  </div>
                )}
                <div className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-semibold">
                  {question.difficulty}
                </div>
              </div>
              <h2 className="text-sm font-medium text-blue-400 uppercase tracking-wider mb-2 flex items-center">
                Question {currentQuestionIndex + 1}
              </h2>
              <h3 className="text-xl font-semibold text-white mb-3">{question.title}</h3>
              <p className="text-base text-gray-300 leading-relaxed">
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
                      <span className="font-bold mr-2">Hint {i + 1}:</span> {hint}
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
                  extensions={[sql({ dialect: PostgreSQL, schema: schemaForAutocomplete, upperCaseKeywords: true })]}
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
                          {result.map((row, i) => {
                            const isRowMismatch = isCorrect === false && JSON.stringify(row) !== JSON.stringify(solutionRows[i]);
                            return (
                              <tr key={i} className={`transition-colors ${isRowMismatch ? 'bg-red-500/10 hover:bg-red-500/20' : 'hover:bg-gray-800/30'}`}>
                                {Object.values(row).map((val: any, j) => (
                                  <td key={j} className={`px-5 py-3 text-sm font-mono ${isRowMismatch ? 'text-red-300' : 'text-gray-300'}`}>
                                    {formatValue(val)}
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
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

            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default App;
