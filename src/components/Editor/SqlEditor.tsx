import React, { useEffect, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql, PostgreSQL } from '@codemirror/lang-sql';
import { keymap } from '@codemirror/view';
import { acceptCompletion, CompletionContext } from '@codemirror/autocomplete';
import { Prec, EditorState } from '@codemirror/state';
import { Trash2, BookOpen, Play } from 'lucide-react';

interface SqlEditorProps {
  query: string;
  setQuery: (q: string) => void;
  runQuery: () => void;
  loadSolution: () => void;
  schemaForAutocomplete: Record<string, string[]>;
  isLoading: boolean;
}

export const SqlEditor: React.FC<SqlEditorProps> = ({
  query,
  setQuery,
  runQuery,
  loadSolution,
  schemaForAutocomplete,
  isLoading,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        runQuery();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [runQuery]);

  const schemaAutocomplete = useMemo(() => {
    return (context: CompletionContext) => {
      const word = context.matchBefore(/[\w_]*/);
      if (!word) return null;
      if (word.from === word.to && !context.explicit) return null;

      const isDotBefore = context.state.sliceDoc(word.from - 1, word.from) === '.';
      if (isDotBefore) return null;

      const options: any[] = [];
      const columnsSet = new Set<string>();

      Object.keys(schemaForAutocomplete).forEach(table => {
        if (!options.some(opt => opt.label === table)) {
          options.push({
            label: table,
            type: 'type',
            boost: 2
          });
        }
        schemaForAutocomplete[table].forEach(col => {
          columnsSet.add(col);
        });
      });

      columnsSet.forEach(col => {
        options.push({
          label: col,
          type: 'property',
          boost: 1
        });
      });

      return {
        from: word.from,
        options
      };
    };
  }, [schemaForAutocomplete]);

  return (
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
            Prec.highest(EditorState.languageData.of(() => [{ autocomplete: schemaAutocomplete }])),
            Prec.highest(keymap.of([
              { key: "Tab", run: acceptCompletion },
              { key: "Mod-Enter", run: () => { runQuery(); return true; } }
            ]))
          ]}
          onChange={(value) => setQuery(value)}
          className="text-base"
        />
      </div>
    </div>
  );
};
