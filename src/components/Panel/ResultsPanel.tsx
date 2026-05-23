import React, { useState } from 'react';
import { Database, Play, CheckCircle, XCircle, AlertTriangle, Trophy, Trash2, Clock, Check, Copy, Terminal } from 'lucide-react';
import { formatValue } from '../../utils/format';
import { Attempt } from '../../hooks/useLocalStorage';

interface ResultsPanelProps {
  activeTab: 'results' | 'expected';
  setActiveTab: (tab: 'results' | 'expected') => void;
  isCorrect: boolean | null;
  result: any[] | null;
  error: string | null;
  expectedOutput: any[] | null;
  execTimeMs: number;
  solutionRows: any[];
  attempts: Attempt[];
  setQuery: (q: string) => void;
  clearLeaderboard: () => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  activeTab,
  setActiveTab,
  isCorrect,
  result,
  error,
  expectedOutput,
  execTimeMs,
  solutionRows,
  attempts,
  setQuery,
  clearLeaderboard,
}) => {
  const [copiedAttemptId, setCopiedAttemptId] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Results Output & Tab Selector */}
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
          {attempts.length > 0 && (
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
          {attempts.length > 0 ? (
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
                {attempts.map((attempt, index) => {
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

                  let timeStr = 'Instant';
                  if (attempt.timeTaken > 0) {
                    const mins = Math.floor(attempt.timeTaken / 60);
                    const secs = attempt.timeTaken % 60;
                    timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                  }

                  return (
                    <tr key={attempt.id} className="hover:bg-gray-800/20 transition-colors group">
                      <td className="px-5 py-3 text-sm whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${rankBadge}`}>
                          #{rank}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm max-w-[280px]">
                        <div className="flex items-center space-x-2">
                          <code className="font-mono text-xs text-gray-300 bg-gray-950/60 px-2 py-1 rounded block truncate font-medium border border-gray-900 select-all max-w-[240px]">
                            {attempt.query}
                          </code>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm whitespace-nowrap">
                        <div className="flex items-center space-x-1.5 text-gray-300">
                          <Clock className="w-3.5 h-3.5 text-blue-400" />
                          <span className="font-mono font-medium">{timeStr}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {getRelativeTime(attempt.timestamp)}
                      </td>
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
  );
};
