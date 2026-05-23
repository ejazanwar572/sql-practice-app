import { PGlite } from '@electric-sql/pglite';

let pg: PGlite | null = null;
let initPromise: Promise<PGlite> | null = null;

export async function getPGlite(): Promise<PGlite> {
  if (pg) return pg;
  if (initPromise) return initPromise;

  initPromise = new Promise(async (resolve, reject) => {
    try {
      console.log("PGlite: Instantiating singleton...");
      const db = new PGlite();
      console.log("PGlite: Initialized synchronously.");
      pg = db;
      resolve(db);
    } catch (e) {
      console.error("PGlite initialization failed:", e);
      initPromise = null;
      reject(e);
    }
  });

  return initPromise;
}
