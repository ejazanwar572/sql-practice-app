import React, { useMemo } from 'react';
import { Database, Check, RotateCcw, Filter } from 'lucide-react';
import { renderCompanyLogo, companyStyles } from '../ui/CompanyLogo';
import type { Topic } from '../../data/questions';

export interface Question {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  company?: string;
  topic: Topic;
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
  topicFilter: 'ALL' | Topic;
  setTopicFilter: (topic: 'ALL' | Topic) => void;
  companyFilter: 'ALL' | string;
  setCompanyFilter: (company: 'ALL' | string) => void;
  onResetProgress: () => void;
}

const TOPIC_COLORS: Record<Topic, string> = {
  'Window Functions': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Joins': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Aggregation': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Subqueries': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Recursive CTE': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'String Functions': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'Date Functions': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'DML': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'CASE & Logic': 'bg-lime-500/10 text-lime-400 border-lime-500/20',
};

const TOPIC_DOT_COLORS: Record<Topic, string> = {
  'Window Functions': 'bg-violet-400',
  'Joins': 'bg-blue-400',
  'Aggregation': 'bg-emerald-400',
  'Subqueries': 'bg-amber-400',
  'Recursive CTE': 'bg-pink-400',
  'String Functions': 'bg-teal-400',
  'Date Functions': 'bg-cyan-400',
  'DML': 'bg-orange-400',
  'CASE & Logic': 'bg-lime-400',
};

export const Sidebar: React.FC<SidebarProps> = ({
  questions,
  currentQuestionId,
  setCurrentQuestionId,
  solvedQuestions,
  difficultyFilter,
  setDifficultyFilter,
  statusFilter,
  setStatusFilter,
  topicFilter,
  setTopicFilter,
  companyFilter,
  setCompanyFilter,
  onResetProgress,
}) => {
  // Collect unique topics and companies
  const { topics, companies } = useMemo(() => {
    const topicSet = new Set<Topic>();
    const companySet = new Set<string>();
    questions.forEach(q => {
      if (q.topic) topicSet.add(q.topic);
      if (q.company) companySet.add(q.company);
    });
    return {
      topics: Array.from(topicSet).sort(),
      companies: Array.from(companySet).sort(),
    };
  }, [questions]);

  const getDifficultyCount = (diff: 'ALL' | 'Easy' | 'Medium' | 'Hard') => {
    return questions.filter(q => {
      if (diff !== 'ALL' && q.difficulty !== diff) return false;
      if (statusFilter === 'SOLVED' && !solvedQuestions.has(q.id)) return false;
      if (statusFilter === 'UNSOLVED' && solvedQuestions.has(q.id)) return false;
      if (topicFilter !== 'ALL' && q.topic !== topicFilter) return false;
      if (companyFilter !== 'ALL' && q.company !== companyFilter) return false;
      return true;
    }).length;
  };

  const filteredQuestions = questions.filter(q => {
    if (difficultyFilter !== 'ALL' && q.difficulty !== difficultyFilter) return false;
    if (statusFilter === 'SOLVED' && !solvedQuestions.has(q.id)) return false;
    if (statusFilter === 'UNSOLVED' && solvedQuestions.has(q.id)) return false;
    if (topicFilter !== 'ALL' && q.topic !== topicFilter) return false;
    if (companyFilter !== 'ALL' && q.company !== companyFilter) return false;
    return true;
  });

  const totalSolved = questions.filter(q => solvedQuestions.has(q.id)).length;
  const totalQuestions = questions.length;
  const progressPct = totalQuestions > 0 ? (totalSolved / totalQuestions) * 100 : 0;

  const hasActiveFilters = topicFilter !== 'ALL' || companyFilter !== 'ALL';

  return (
    <div className="w-[346px] shrink-0 border-r border-gray-800 bg-gray-900/50 flex flex-col z-20">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800 bg-gray-900 shrink-0">
        <div className="flex items-center">
          <div className="p-2 bg-blue-500/10 rounded-lg mr-3">
            <Database className="w-5 h-5 text-blue-400" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white">SQL Practice</h1>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Reset all progress? This will clear all solved questions and attempt history.')) {
              onResetProgress();
            }
          }}
          className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
          title="Reset All Progress"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-4 pt-3 pb-2 border-b border-gray-800 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Progress</span>
          <span className="text-[11px] font-mono text-gray-300">
            <span className="text-emerald-400 font-bold">{totalSolved}</span>
            <span className="text-gray-500"> / </span>
            <span>{totalQuestions}</span>
          </span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
      
      {/* Filters Section */}
      <div className="p-4 border-b border-gray-800 font-semibold text-gray-400 uppercase tracking-wider text-xs shrink-0 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span>Problem List</span>
          <div className="flex bg-gray-900 rounded p-0.5 border border-gray-800">
            <button 
              onClick={() => setStatusFilter('ALL')} 
              className={`px-2 py-1 rounded text-[10px] cursor-pointer ${statusFilter === 'ALL' ? 'bg-gray-800 text-gray-200' : 'text-gray-500 hover:text-gray-300'}`}
            >
              All
            </button>
            <button 
              onClick={() => setStatusFilter('UNSOLVED')} 
              className={`px-2 py-1 rounded text-[10px] cursor-pointer ${statusFilter === 'UNSOLVED' ? 'bg-gray-800 text-gray-200' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Unsolved
            </button>
            <button 
              onClick={() => setStatusFilter('SOLVED')} 
              className={`px-2 py-1 rounded text-[10px] cursor-pointer ${statusFilter === 'SOLVED' ? 'bg-gray-800 text-gray-200' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Solved
            </button>
          </div>
        </div>

        {/* Difficulty filter */}
        <div className="flex gap-1.5">
          <button 
            onClick={() => setDifficultyFilter('ALL')} 
            className={`flex-1 py-1.5 rounded text-[10px] border cursor-pointer ${difficultyFilter === 'ALL' ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-800/50'}`}
          >
            All ({getDifficultyCount('ALL')})
          </button>
          <button 
            onClick={() => setDifficultyFilter('Easy')} 
            className={`flex-1 py-1.5 rounded text-[10px] border cursor-pointer ${difficultyFilter === 'Easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-transparent border-transparent text-emerald-500/50 hover:bg-emerald-500/5'}`}
          >
            Easy ({getDifficultyCount('Easy')})
          </button>
          <button 
            onClick={() => setDifficultyFilter('Medium')} 
            className={`flex-1 py-1.5 rounded text-[10px] border cursor-pointer ${difficultyFilter === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-transparent border-transparent text-yellow-500/50 hover:bg-yellow-500/5'}`}
          >
            Med ({getDifficultyCount('Medium')})
          </button>
          <button 
            onClick={() => setDifficultyFilter('Hard')} 
            className={`flex-1 py-1.5 rounded text-[10px] border cursor-pointer ${difficultyFilter === 'Hard' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-transparent border-transparent text-red-500/50 hover:bg-red-500/5'}`}
          >
            Hard ({getDifficultyCount('Hard')})
          </button>
        </div>

        {/* Topic filter */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3 h-3 text-gray-500" />
            <span className="text-[10px] text-gray-500 normal-case tracking-normal font-medium">Topic</span>
            {hasActiveFilters && (
              <button
                onClick={() => { setTopicFilter('ALL'); setCompanyFilter('ALL'); }}
                className="ml-auto text-[9px] text-gray-500 hover:text-gray-300 normal-case tracking-normal cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setTopicFilter('ALL')}
              className={`px-2 py-0.5 rounded text-[9px] border transition-colors cursor-pointer ${
                topicFilter === 'ALL'
                  ? 'bg-gray-800 border-gray-700 text-gray-200'
                  : 'bg-transparent border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-400'
              }`}
            >
              All
            </button>
            {topics.map(t => (
              <button
                key={t}
                onClick={() => setTopicFilter(t)}
                className={`px-2 py-0.5 rounded text-[9px] border transition-colors cursor-pointer ${
                  topicFilter === t
                    ? TOPIC_COLORS[t]
                    : 'bg-transparent border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Company filter */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] text-gray-500 normal-case tracking-normal font-medium">Company</span>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setCompanyFilter('ALL')}
              className={`px-2 py-0.5 rounded text-[9px] border transition-colors cursor-pointer ${
                companyFilter === 'ALL'
                  ? 'bg-gray-800 border-gray-700 text-gray-200'
                  : 'bg-transparent border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-400'
              }`}
            >
              All
            </button>
            {companies.map(c => (
              <button
                key={c}
                onClick={() => setCompanyFilter(c)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] border transition-colors cursor-pointer ${
                  companyFilter === c
                    ? (companyStyles[c] || 'bg-gray-500/10 text-gray-400 border-gray-500/20')
                    : 'bg-transparent border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-400'
                }`}
              >
                {renderCompanyLogo(c, "w-2.5 h-2.5 shrink-0")}
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Question list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {filteredQuestions.map((q) => {
          const originalIdx = questions.findIndex(orig => orig.id === q.id);
          const isSelected = currentQuestionId === q.id;
          const diffColor = q.difficulty === 'Easy' ? 'bg-emerald-500' : q.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500';
          
          return (
            <button 
              key={q.id}
              onClick={() => setCurrentQuestionId(q.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between group cursor-pointer ${isSelected ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-gray-400 hover:bg-gray-800/80 hover:text-gray-200'}`}
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
              <div className="flex items-center gap-1.5 shrink-0">
                {q.topic && (
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${TOPIC_DOT_COLORS[q.topic]}`}
                    title={q.topic}
                  />
                )}
                {solvedQuestions.has(q.id) && (
                  <div className="flex items-center justify-center w-[18px] h-[18px] rounded-full bg-emerald-500/15 border border-emerald-500/30 shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" strokeWidth={3} />
                  </div>
                )}
              </div>
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
