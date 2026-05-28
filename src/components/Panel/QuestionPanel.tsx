import React, { useState } from 'react';
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

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-0' : '-rotate-90'}`}
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export const QuestionPanel: React.FC<QuestionPanelProps> = ({
  question,
  currentQuestionNumber,
  tablesInfo,
  expectedOutput,
  hintsRevealed,
  setHintsRevealed,
}) => {
  const [isQuestionExpanded, setIsQuestionExpanded] = useState(true);
  const [isSchemaExpanded, setIsSchemaExpanded] = useState(true);
  const [isExpectedExpanded, setIsExpectedExpanded] = useState(true);

  return (
    <div className="space-y-6">
      {/* 1. Question Partition */}
      <div className="glass rounded-xl overflow-hidden relative">
        {/* Absolute badges (only shown when expanded to avoid layout overlapping) */}
        {question.company && isQuestionExpanded && (
          <div className="absolute top-0 right-0 hidden lg:flex items-center shadow-sm backdrop-blur-md rounded-bl-lg overflow-hidden border-b border-l border-white/10">
            <div className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-semibold border-r border-white/10 flex items-center gap-1.5">
              {renderCompanyLogo(question.company, "w-3.5 h-3.5")}
              <span>{question.company}</span>
            </div>
            <div className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-semibold">
              {question.difficulty}
            </div>
          </div>
        )}

        {/* Clickable Header */}
        <div 
          onClick={() => setIsQuestionExpanded(!isQuestionExpanded)}
          className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer select-none"
        >
          <h2 className="text-sm font-medium text-blue-400 uppercase tracking-wider flex items-center">
            Question {currentQuestionNumber}
          </h2>
          <div className="flex items-center gap-3">
            {/* Inline badges when collapsed */}
            {!isQuestionExpanded && (
              <div className="flex items-center gap-1.5 shrink-0 mr-1">
                {question.company && (
                  <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-[10px] font-semibold rounded border border-yellow-500/20 flex items-center gap-1">
                    {renderCompanyLogo(question.company, "w-2.5 h-2.5")}
                    <span>{question.company}</span>
                  </span>
                )}
                <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-semibold rounded border border-green-500/20">
                  {question.difficulty}
                </span>
              </div>
            )}
            <ChevronIcon isOpen={isQuestionExpanded} />
          </div>
        </div>

        {/* Collapsible Content */}
        {isQuestionExpanded && (
          <div className="px-6 pb-6 pt-2 border-t border-white/5 animate-slide-down">
            <h3 className="text-xl font-semibold text-white mb-3 pr-24">{question.title}</h3>
            <p className="text-base text-gray-300 leading-relaxed whitespace-pre-wrap">
              {question.description}
            </p>
          </div>
        )}
      </div>

      {/* 2. Database Schema Partition */}
      <div className="glass rounded-xl overflow-hidden">
        {/* Clickable Header */}
        <div 
          onClick={() => setIsSchemaExpanded(!isSchemaExpanded)}
          className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer select-none"
        >
          <h2 className="text-sm font-medium text-purple-400 uppercase tracking-wider">Database Schema</h2>
          <ChevronIcon isOpen={isSchemaExpanded} />
        </div>

        {/* Collapsible Content */}
        {isSchemaExpanded && (
          <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-6 animate-slide-down">
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
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Expected Output Partition */}
      <div className="glass rounded-xl overflow-hidden">
        {/* Clickable Header */}
        <div 
          onClick={() => setIsExpectedExpanded(!isExpectedExpanded)}
          className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer select-none"
        >
          <h2 className="text-sm font-medium text-emerald-400 uppercase tracking-wider">Expected Output</h2>
          <ChevronIcon isOpen={isExpectedExpanded} />
        </div>

        {/* Collapsible Content */}
        {isExpectedExpanded && (
          <div className="px-6 pb-6 pt-2 border-t border-white/5 animate-slide-down">
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
        )}
      </div>

      {/* Hints Section */}
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
