import React from 'react';
import { renderCompanyLogo } from '../ui/CompanyLogo';
import { formatValue } from '../../utils/format';

export interface ColumnInfo {
  name: string;
  type: string;
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
  return (
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
