
import { TableInfo, QueryResult, CleanOption } from '../types';
import * as XLSX from 'xlsx';

let db: any = null;

export const initDb = async () => {
  if (db) return db;
  const SQL = await (window as any).initSqlJs({
    locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
  });
  db = new SQL.Database();
  return db;
};

const processDataToTable = async (
  data: any[],
  columns: string[],
  tableName: string,
  fileName: string,
  cleanOption: CleanOption,
  customVal?: string
): Promise<TableInfo> => {
  const database = await initDb();
  let processedData = data;

  // Clean Data
  if (cleanOption !== CleanOption.NONE) {
    processedData = processedData.filter((row: any) => {
      const hasNull = Object.values(row).some(v => v === null || v === undefined || v === '');
      if (cleanOption === CleanOption.DROP && hasNull) return false;
      return true;
    }).map((row: any) => {
      const newRow = { ...row };
      Object.keys(newRow).forEach(key => {
        if (newRow[key] === null || newRow[key] === undefined || newRow[key] === '') {
          if (cleanOption === CleanOption.ZERO) newRow[key] = 0;
          if (cleanOption === CleanOption.CUSTOM) newRow[key] = customVal;
        }
      });
      return newRow;
    });
  }

  // Create Table
  const schema = columns.map(c => `"${c.replace(/"/g, '""')}" TEXT`).join(', ');
  database.run(`DROP TABLE IF EXISTS ${tableName}`);
  database.run(`CREATE TABLE ${tableName} (${schema})`);

  // Insert Data
  const placeholders = columns.map(() => '?').join(', ');
  const stmt = database.prepare(`INSERT INTO ${tableName} VALUES (${placeholders})`);
  processedData.forEach((row: any) => {
    const vals = columns.map(c => row[c]);
    stmt.run(vals);
  });
  stmt.free();

  return {
    name: tableName,
    columns,
    rowCount: processedData.length,
    fileName: fileName
  };
};

export const loadFileToTable = async (
  file: File, 
  tableName: string, 
  cleanOption: CleanOption,
  customVal?: string
): Promise<TableInfo> => {
  const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

  if (isExcel) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          const columns = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
          
          const info = await processDataToTable(jsonData, columns, tableName, file.name, cleanOption, customVal);
          resolve(info);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  } else {
    // Default to CSV
    return new Promise((resolve, reject) => {
      (window as any).Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results: any) => {
          try {
            const data = results.data;
            const columns = results.meta.fields || [];
            const info = await processDataToTable(data, columns, tableName, file.name, cleanOption, customVal);
            resolve(info);
          } catch (err) {
            reject(err);
          }
        },
        error: reject
      });
    });
  }
};

export const executeSql = async (sql: string): Promise<QueryResult> => {
  const database = await initDb();
  const res = database.exec(sql);
  if (res.length === 0) {
    return { columns: [], values: [], sql };
  }
  return {
    columns: res[0].columns,
    values: res[0].values,
    sql
  };
};

export const getDbSchema = async (): Promise<string> => {
  const database = await initDb();
  const tables = database.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  if (tables.length === 0) return "No tables loaded.";

  let schemaStr = "";
  for (const tableRow of tables[0].values) {
    const tableName = tableRow[0];
    const columns = database.exec(`PRAGMA table_info(${tableName})`);
    const colList = columns[0].values.map((v: any) => `${v[1]} (${v[2]})`).join(', ');
    schemaStr += `Table ${tableName}: [${colList}]\n`;
  }
  return schemaStr;
};
