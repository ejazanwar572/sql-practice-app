import React, { useState } from 'react';
import { renderCompanyLogo } from '../ui/CompanyLogo';
import { formatValue } from '../../utils/format';

export interface ColumnInfo {
  name: string;
  type: string;
  isPK?: boolean;
  isFK?: boolean;
  fkRef?: string;
}

export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
  sampleData: any[];
}

export interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  company?: string;
  hints?: string[];
}

interface QuestionPanelProps {
  question: Question;
  currentQuestionNumber: number;
  tablesInfo: TableInfo[];
  expectedOutput: any[] | null;
  hintsRevealed: number;
  setHintsRevealed: (updater: (h: number) => number) => void;
}

export const QuestionPanel: React.FC<QuestionPanelProps> = ({
  question,
  currentQuestionNumber,
  tablesInfo,
  expectedOutput,
  hintsRevealed,
  setHintsRevealed,
}) => {
  const [activeTabs, setActiveTabs] = useState<Record<string, 'columns' | 'sample'>>({});

  return (
    <div className="space-y-6">
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
          {tablesInfo.map((table) => {
            const activeTab = activeTabs[table.name] || 'columns';

            return (
              <div key={table.name} className="bg-gray-950/80 rounded-lg border border-gray-800 overflow-hidden shadow-inner flex flex-col">
                {/* Table Header with Toggle Tabs */}
                <div className="px-4 py-2 bg-gray-900/90 border-b border-gray-800 flex justify-between items-center shrink-0">
                  <span className="font-mono text-sm font-semibold text-purple-300">{table.name}</span>
                  <div className="flex bg-gray-950 rounded p-0.5 border border-gray-800/80">
                    <button
                      onClick={() => setActiveTabs(prev => ({ ...prev, [table.name]: 'columns' }))}
                      className={`px-2.5 py-0.5 rounded text-[10px] cursor-pointer transition-colors ${
                        activeTab === 'columns' ? 'bg-gray-800 text-gray-200 font-semibold' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      Columns
                    </button>
                    <button
                      onClick={() => setActiveTabs(prev => ({ ...prev, [table.name]: 'sample' }))}
                      className={`px-2.5 py-0.5 rounded text-[10px] cursor-pointer transition-colors ${
                        activeTab === 'sample' ? 'bg-gray-800 text-gray-200 font-semibold' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      Sample Data
                    </button>
                  </div>
                </div>

                {/* Tab content */}
                {activeTab === 'columns' ? (
                  /* Columns list (exact replica of style reference) */
                  <div className="divide-y divide-gray-800/60 font-sans bg-gray-950/40">
                    {table.columns.map(col => (
                      <div key={col.name} className="flex justify-between items-center py-3 px-5 hover:bg-gray-900/10 transition-colors">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-gray-200 font-medium">{col.name}</span>
                            {col.isPK && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25 tracking-wide shrink-0">
                                PK
                              </span>
                            )}
                            {col.isFK && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/25 tracking-wide shrink-0">
                                FK
                              </span>
                            )}
                          </div>
                          {col.isFK && col.fkRef && (
                            <span className="text-[10px] text-gray-500 font-mono mt-0.5 pl-0.5">
                              → {col.fkRef}
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                          {col.type.replace(' without time zone', '').toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Sample data view */
                  <div className="p-4 overflow-x-auto bg-gray-950/20">
                    {table.sampleData.length > 0 ? (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-gray-900/80 border-b border-gray-800">
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
                              {table.columns.map(col => {
                                const val = row[col.name] !== undefined 
                                  ? row[col.name] 
                                  : row[col.name.toLowerCase()] !== undefined 
                                    ? row[col.name.toLowerCase()] 
                                    : row[col.name.toUpperCase()];
                                return (
                                  <td key={col.name} className="px-3 py-2 text-gray-300 font-mono">
                                    {formatValue(val)}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-gray-500 text-xs font-mono py-2 text-center">No sample data available</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h2 className="text-sm font-medium text-emerald-400 uppercase tracking-wider mb-4">Expected Output</h2>
        {expectedOutput && expectedOutput.length > 0 ? (
          <div className="bg-gray-950/80 rounded-lg border border-gray-800 overflow-hidden shadow-inner p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-900 border-b border-gray-800">
                    {Object.keys(expectedOutput[0]).map(key => (
                      <th key={key} className="px-3 py-2 text-gray-400 font-medium uppercase whitespace-nowrap">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {expectedOutput.slice(0, 5).map((row, i) => (
                    <tr key={i} className="hover:bg-gray-800/50">
                      {Object.values(row).map((val: any, j) => (
                        <td key={j} className="px-3 py-2 text-gray-300 font-mono">
                          {formatValue(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {expectedOutput.length > 5 && (
              <div className="text-[10px] text-gray-500 mt-2 text-center font-mono border-t border-gray-800/50 pt-2">
                Showing top 5 of {expectedOutput.length} rows
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-500 text-xs font-mono">Loading expected output...</div>
        )}
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
  );
};
