import { useState, useEffect, useCallback, useRef } from 'react';
import { getPGlite } from '../db/client';
import { PGlite } from '@electric-sql/pglite';

export interface ColumnInfo {
  name: string;
  type: string;
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

      const tablesMap = new Map<string, TableInfo>();
      const autocomplete: Record<string, string[]> = {};

      for (const row of schemaRes.rows as any[]) {
        const tName = row.table_name;
        if (!tablesMap.has(tName)) {
          tablesMap.set(tName, { name: tName, columns: [], sampleData: [] });
          autocomplete[tName] = [];
        }
        tablesMap.get(tName)!.columns.push({ name: row.column_name, type: row.data_type });
        autocomplete[tName].push(row.column_name);
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

      // Verify that this init call matches the current active question
      if (questionIdRef.current === q.id) {
        setTablesInfo(tablesInfoArr);
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

      // Compare exact JSON results
      const isMatch = JSON.stringify(userRows) === JSON.stringify(expectedOutput);
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
