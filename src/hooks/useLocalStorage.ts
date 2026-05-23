import { useState, useCallback } from 'react';

export interface Attempt {
  id: string;
  query: string;
  timeTaken: number;
  timestamp: number;
}

export function useLocalStorage() {
  const [solvedQuestions, setSolvedQuestions] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('sql_solved_questions');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [attempts, setAttempts] = useState<Record<string, Attempt[]>>(() => {
    const saved = localStorage.getItem('sql_attempts_leaderboard');
    return saved ? JSON.parse(saved) : {};
  });

  const markAsSolved = useCallback((questionId: string) => {
    setSolvedQuestions(prev => {
      const next = new Set(prev).add(questionId);
      localStorage.setItem('sql_solved_questions', JSON.stringify(Array.from(next)));
      return next;
    });
  }, []);

  const saveAttempt = useCallback((questionId: string, query: string, timeTaken: number) => {
    setAttempts(prev => {
      const currentAttempts = prev[questionId] || [];
      const isDuplicate = currentAttempts.some(
        a => a.query.trim() === query.trim() && a.timeTaken === timeTaken
      );
      if (isDuplicate) return prev;

      const newAttempt: Attempt = {
        id: Math.random().toString(36).substring(2, 9),
        query: query,
        timeTaken: timeTaken,
        timestamp: Date.now()
      };
      const next = {
        ...prev,
        [questionId]: [...currentAttempts, newAttempt]
      };
      localStorage.setItem('sql_attempts_leaderboard', JSON.stringify(next));
      return next;
    });
  }, []);

  const clearAttemptsForQuestion = useCallback((questionId: string) => {
    setAttempts(prev => {
      const next = { ...prev };
      delete next[questionId];
      localStorage.setItem('sql_attempts_leaderboard', JSON.stringify(next));
      return next;
    });
  }, []);

  const resetAllProgress = useCallback(() => {
    localStorage.removeItem('sql_solved_questions');
    localStorage.removeItem('sql_attempts_leaderboard');
    setSolvedQuestions(new Set());
    setAttempts({});
  }, []);

  return {
    solvedQuestions,
    attempts,
    markAsSolved,
    saveAttempt,
    clearAttemptsForQuestion,
    resetAllProgress
  };
}
