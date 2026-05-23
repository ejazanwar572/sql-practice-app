import React from 'react';
import { Database, Check } from 'lucide-react';
import { renderCompanyLogo, companyStyles } from '../ui/CompanyLogo';

export interface Question {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  company?: string;
}

interface SidebarProps {
  questions: Question[];
  currentQuestionId: string;
  setCurrentQuestionId: (id: string) => void;
  solvedQuestions: Set<string>;
  difficultyFilter: 'ALL' | 'Easy' | 'Medium' | 'Hard';
  setDifficultyFilter: (diff: 'ALL' | 'Easy' | 'Medium' | 'Hard') => void;
  statusFilter: 'ALL' | 'UNSOLVED' | 'SOLVED';
  setStatusFilter: (status: 'ALL' | 'UNSOLVED' | 'SOLVED') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  questions,
  currentQuestionId,
  setCurrentQuestionId,
  solvedQuestions,
  difficultyFilter,
  setDifficultyFilter,
  statusFilter,
  setStatusFilter,
}) => {
  const getDifficultyCount = (diff: 'ALL' | 'Easy' | 'Medium' | 'Hard') => {
    return questions.filter(q => {
      if (diff !== 'ALL' && q.difficulty !== diff) return false;
      if (statusFilter === 'SOLVED' && !solvedQuestions.has(q.id)) return false;
      if (statusFilter === 'UNSOLVED' && solvedQuestions.has(q.id)) return false;
      return true;
    }).length;
  };

  const filteredQuestions = questions.filter(q => {
    if (difficultyFilter !== 'ALL' && q.difficulty !== difficultyFilter) return false;
    if (statusFilter === 'SOLVED' && !solvedQuestions.has(q.id)) return false;
    if (statusFilter === 'UNSOLVED' && solvedQuestions.has(q.id)) return false;
    return true;
  });

  return (
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
            <button 
              onClick={() => setStatusFilter('ALL')} 
              className={`px-2 py-1 rounded text-[10px] ${statusFilter === 'ALL' ? 'bg-gray-800 text-gray-200' : 'text-gray-500 hover:text-gray-300'}`}
            >
              All
            </button>
            <button 
              onClick={() => setStatusFilter('UNSOLVED')} 
              className={`px-2 py-1 rounded text-[10px] ${statusFilter === 'UNSOLVED' ? 'bg-gray-800 text-gray-200' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Unsolved
            </button>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button 
            onClick={() => setDifficultyFilter('ALL')} 
            className={`flex-1 py-1.5 rounded text-[10px] border ${difficultyFilter === 'ALL' ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-800/50'}`}
          >
            All ({getDifficultyCount('ALL')})
          </button>
          <button 
            onClick={() => setDifficultyFilter('Easy')} 
            className={`flex-1 py-1.5 rounded text-[10px] border ${difficultyFilter === 'Easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-transparent border-transparent text-emerald-500/50 hover:bg-emerald-500/5'}`}
          >
            Easy ({getDifficultyCount('Easy')})
          </button>
          <button 
            onClick={() => setDifficultyFilter('Medium')} 
            className={`flex-1 py-1.5 rounded text-[10px] border ${difficultyFilter === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-transparent border-transparent text-yellow-500/50 hover:bg-yellow-500/5'}`}
          >
            Med ({getDifficultyCount('Medium')})
          </button>
          <button 
            onClick={() => setDifficultyFilter('Hard')} 
            className={`flex-1 py-1.5 rounded text-[10px] border ${difficultyFilter === 'Hard' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-transparent border-transparent text-red-500/50 hover:bg-red-500/5'}`}
          >
            Hard ({getDifficultyCount('Hard')})
          </button>
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
  );
};
