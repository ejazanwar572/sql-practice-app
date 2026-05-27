import { useState, useEffect, useCallback, useRef } from 'react';
import { getPGlite } from '../db/client';
import { PGlite } from '@electric-sql/pglite';

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

export interface QuestionData {
  id: string;
  setupSql: string;
  solutionSql: string;
  schema: string;
}

export function usePGlite(question: QuestionData) {
  const [db, setDb] = useState<PGlite | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  
  const [tablesInfo, setTablesInfo] = useState<TableInfo[]>([]);
  const [schemaForAutocomplete, setSchemaForAutocomplete] = useState<Record<string, string[]>>({});
  const [expectedOutput, setExpectedOutput] = useState<any[]>([]);
  
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [execTimeMs, setExecTimeMs] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // We use refs to avoid re-running initialization logic repeatedly on state updates
  const questionIdRef = useRef(question.id);
  questionIdRef.current = question.id;

  const initDB = useCallback(async (q: QuestionData) => {
    setIsLoading(true);
    setDbError(null);
    setQueryResult(null);
    setQueryError(null);
    setIsCorrect(null);
    setExecTimeMs(0);

    try {
      const dbInstance = await getPGlite();
      setDb(dbInstance);

      // Clean schema and run setups
      await dbInstance.exec(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
      await dbInstance.exec(q.setupSql);

      // Fetch dynamic schema columns
      const schemaRes = await dbInstance.query(`
        SELECT table_name, column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position;
      `);

      const casing = parseOriginalCasing(q.schema);
      const tablesMap = new Map<string, TableInfo>();
      const autocomplete: Record<string, string[]> = {};

      for (const row of schemaRes.rows as any[]) {
        const tNameLower = row.table_name.toLowerCase();
        const tNameOriginal = casing.tables[tNameLower] || row.table_name;
        
        const colNameLower = row.column_name.toLowerCase();
        const colName = casing.columns[colNameLower] || row.column_name;

        if (!tablesMap.has(tNameOriginal)) {
          tablesMap.set(tNameOriginal, { name: tNameOriginal, columns: [], sampleData: [] });
        }
        tablesMap.get(tNameOriginal)!.columns.push({ name: colName, type: row.data_type });

        const tKeys = new Set([tNameLower, tNameOriginal, tNameOriginal.toUpperCase()]);
        for (const key of tKeys) {
          if (!autocomplete[key]) {
            autocomplete[key] = [];
          }
          if (!autocomplete[key].includes(colName)) {
            autocomplete[key].push(colName);
          }
        }
      }

      const tablesInfoArr = Array.from(tablesMap.values());
      for (const table of tablesInfoArr) {
        const sampleRes = await dbInstance.query(`SELECT * FROM ${table.name} LIMIT 5;`);
        table.sampleData = sampleRes.rows;
      }

      // Fetch expected output using solution query
      let expOut: any[] = [];
      try {
        const solRes = await dbInstance.query(q.solutionSql);
        if (Array.isArray(solRes)) {
          expOut = solRes[solRes.length - 1]?.rows || [];
        } else {
          expOut = solRes?.rows || [];
        }
      } catch (solErr) {
        console.error("Error executing solutionSql", solErr);
      }

      const enhancedTablesInfo = enhanceTablesInfo(tablesInfoArr, q.schema);

      // Verify that this init call matches the current active question
      if (questionIdRef.current === q.id) {
        setTablesInfo(enhancedTablesInfo);
        setSchemaForAutocomplete(autocomplete);
        setExpectedOutput(expOut);
        setIsLoading(false);
      }
    } catch (e: any) {
      console.error("initDB error:", e);
      if (questionIdRef.current === q.id) {
        setDbError("Failed to initialize database schema: " + (e?.message || String(e)));
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    initDB(question);
  }, [question.id, initDB]);

  const runQuery = useCallback(async (sqlText: string) => {
    const dbInstance = await getPGlite();
    setQueryError(null);
    setQueryResult(null);
    setIsCorrect(null);
    setIsLoading(true);

    try {
      const start = performance.now();
      const res = await dbInstance.query(sqlText);
      const end = performance.now();
      
      const timeMs = Math.round(end - start);
      setExecTimeMs(timeMs);

      let userRows: any[] = [];
      if (Array.isArray(res)) {
        userRows = res[res.length - 1]?.rows || [];
      } else {
        userRows = res?.rows || [];
      }
      setQueryResult(userRows);

      // Compare semantic result sets robustly
      const isMatch = compareResultSets(userRows, expectedOutput);
      setIsCorrect(isMatch);
      setIsLoading(false);
      return { isCorrect: isMatch, timeMs, rows: userRows };
    } catch (e: any) {
      console.error("runQuery error:", e);
      setQueryError(e?.message || String(e));
      setIsCorrect(false);
      setIsLoading(false);
      return { isCorrect: false, timeMs: 0, rows: [], error: e?.message || String(e) };
    }
  }, [expectedOutput]);

  return {
    db,
    isLoading,
    dbError,
    tablesInfo,
    schemaForAutocomplete,
    expectedOutput,
    queryResult,
    queryError,
    execTimeMs,
    isCorrect,
    runQuery,
    resetDB: () => initDB(question)
  };
}

function compareResultSets(a: any[] | null, b: any[] | null): boolean {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    const rowA = a[i];
    const rowB = b[i];
    
    const keysA = Object.keys(rowA);
    const keysB = Object.keys(rowB);
    
    if (keysA.length !== keysB.length) return false;
    
    for (let j = 0; j < keysA.length; j++) {
      const keyA = keysA[j];
      const keyB = keysB[j];
      
      if (keyA.toLowerCase() !== keyB.toLowerCase()) return false;
      
      const valA = rowA[keyA];
      const valB = rowB[keyB];
      
      if (!compareValues(valA, valB)) return false;
    }
  }
  return true;
}

function compareValues(valA: any, valB: any): boolean {
  if (valA === valB) return true;
  if (valA === null || valA === undefined || valB === null || valB === undefined) {
    return valA === valB;
  }

  const isDateA = valA instanceof Date || Object.prototype.toString.call(valA) === '[object Date]';
  const isDateB = valB instanceof Date || Object.prototype.toString.call(valB) === '[object Date]';
  if (isDateA || isDateB) {
    const strA = isDateA ? (valA as Date).toISOString().split('T')[0] : String(valA);
    const strB = isDateB ? (valB as Date).toISOString().split('T')[0] : String(valB);
    return strA === strB;
  }

  const numA = Number(valA);
  const numB = Number(valB);
  if (!isNaN(numA) && !isNaN(numB) && typeof valA !== 'boolean' && typeof valB !== 'boolean') {
    return Math.abs(numA - numB) < 1e-6;
  }

  return String(valA).trim() === String(valB).trim();
}

function parseOriginalCasing(schemaStr: string): { tables: Record<string, string>, columns: Record<string, string> } {
  const tables: Record<string, string> = {};
  const columns: Record<string, string> = {};
  
  // Match patterns like "TABLE TableName (..."
  const tableRegex = /TABLE\s+(\w+)/gi;
  let match;
  while ((match = tableRegex.exec(schemaStr)) !== null) {
    const originalName = match[1];
    tables[originalName.toLowerCase()] = originalName;
  }
  
  // Match words and filter out SQL keywords to get columns
  const words = schemaStr.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
  words.forEach(word => {
    const upper = word.toUpperCase();
    if (upper === 'TABLE' || upper === 'INTEGER' || upper === 'INT' || upper === 'VARCHAR' || 
        upper === 'DECIMAL' || upper === 'DATE' || upper === 'TIMESTAMP' || upper === 'PRIMARY' || 
        upper === 'KEY' || upper === 'PK' || upper === 'BOOLEAN' || upper === 'DOUBLE' || upper === 'PRECISION') {
      return;
    }
    // Only register if it's not a table name
    if (!tables[word.toLowerCase()]) {
      columns[word.toLowerCase()] = word;
    }
  });
  
  return { tables, columns };
}

function enhanceTablesInfo(tables: TableInfo[], schemaStr: string): TableInfo[] {
  const pkMap: Record<string, Set<string>> = {};
  
  const tableMatches = schemaStr.match(/TABLE\s+(\w+)\s*\(([^)]+)\)/gi) || [];
  tableMatches.forEach(tMatch => {
    const parts = tMatch.match(/TABLE\s+(\w+)\s*\(([^)]+)\)/i);
    if (parts) {
      const tableName = parts[1].toLowerCase();
      const colsPart = parts[2];
      pkMap[tableName] = new Set<string>();
      
      const colDefs = colsPart.split(',');
      colDefs.forEach(def => {
        const words = def.trim().split(/\s+/);
        if (words.length > 0) {
          const colName = words[0].replace(/["`]/g, '').toLowerCase();
          const defUpper = def.toUpperCase();
          if (defUpper.includes(' PK') || defUpper.includes('PRIMARY KEY')) {
            pkMap[tableName].add(colName);
          }
        }
      });
    }
  });

  const matchTable = (word: string, tableName: string): boolean => {
    const w = word.toLowerCase();
    const t = tableName.toLowerCase();
    if (w === t) return true;
    if (w + 's' === t) return true;
    if (w === t + 's') return true;
    if (w.endsWith('y') && w.slice(0, -1) + 'ies' === t) return true;
    if (t.endsWith('y') && t.slice(0, -1) + 'ies' === w) return true;
    return false;
  };

  const firstPass = tables.map(table => {
    const tNameLower = table.name.toLowerCase();
    const tPks = pkMap[tNameLower] || new Set<string>();
    
    const enhancedCols = table.columns.map(col => {
      const cNameLower = col.name.toLowerCase();
      let isPK = tPks.has(cNameLower);
      
      if (col.type.toUpperCase().includes('PRIMARY KEY')) {
        isPK = true;
      }
      
      const isIdCol = cNameLower === 'id' || 
                      cNameLower === `${tNameLower}_id` || 
                      cNameLower === `${tNameLower.replace(/s$/, '')}_id`;
                      
      return {
        ...col,
        isPK,
        isIdCol,
        isFK: false,
        fkRef: undefined as string | undefined
      };
    });

    const hasPK = enhancedCols.some(c => c.isPK);
    if (!hasPK) {
      const idCols = enhancedCols.filter(c => c.isIdCol);
      if (idCols.length === 1) {
        idCols[0].isPK = true;
      }
    }

    return {
      ...table,
      columns: enhancedCols
    };
  });

  return firstPass.map((table, _, allTables) => {
    const enhancedCols = table.columns.map(col => {
      if (col.isPK) return col;

      const cNameLower = col.name.toLowerCase();
      
      if (cNameLower.endsWith('_id') && cNameLower !== 'id') {
        const base = cNameLower.slice(0, -3);
        
        let isFK = false;
        let fkRef: string | undefined = undefined;

        if (base === 'manager' || base === 'parent') {
          const selfPk = table.columns.find(c => c.isPK);
          if (selfPk) {
            isFK = true;
            fkRef = `${table.name}.${selfPk.name}`;
          }
        } else {
          const targetTable = allTables.find(t => matchTable(base, t.name));
          if (targetTable) {
            const targetPk = targetTable.columns.find(c => c.isPK) || targetTable.columns[0];
            if (targetPk) {
              isFK = true;
              fkRef = `${targetTable.name}.${targetPk.name}`;
            }
          }
        }

        return {
          ...col,
          isFK,
          fkRef
        };
      }

      return col;
    });

    return {
      ...table,
      columns: enhancedCols
    };
  });
}
