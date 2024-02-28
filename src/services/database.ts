import { TableInfo, QueryResult, CleanOption } from '../types'

// Declare global types for CDN libraries
declare global {
    interface Window {
        initSqlJs: any
        Papa: any
    }
}

let db: any = null

export const initDb = async (): Promise<any> => {
    if (db) return db

    // Load SQL.js from CDN
    const SQL = await window.initSqlJs({
        locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    })

    db = new SQL.Database()
    return db
}

const processDataToTable = async (
    data: any[],
    columns: string[],
    tableName: string,
    fileName: string,
    cleanOption: CleanOption,
    customVal?: string
): Promise<TableInfo> => {
    const database = await initDb()
    let processedData = data

    // Clean Data based on selected option
    if (cleanOption !== CleanOption.NONE) {
        processedData = processedData.filter((row: any) => {
            const hasNull = Object.values(row).some(v => v === null || v === undefined || v === '')
            if (cleanOption === CleanOption.DROP && hasNull) return false
            return true
        }).map((row: any) => {
            const newRow = { ...row }
            Object.keys(newRow).forEach(key => {
                if (newRow[key] === null || newRow[key] === undefined || newRow[key] === '') {
                    if (cleanOption === CleanOption.ZERO) newRow[key] = 0
                    if (cleanOption === CleanOption.CUSTOM && customVal) newRow[key] = customVal
                }
            })
            return newRow
        })
    }

    // Create Table with TEXT columns for simplicity
    const schema = columns.map(c => `"${c.replace(/"/g, '""')}" TEXT`).join(', ')
    database.run(`DROP TABLE IF EXISTS ${tableName}`)
    database.run(`CREATE TABLE ${tableName} (${schema})`)

    // Insert Data
    const placeholders = columns.map(() => '?').join(', ')
    const stmt = database.prepare(`INSERT INTO ${tableName} VALUES (${placeholders})`)

    processedData.forEach((row: any) => {
        const vals = columns.map(c => row[c] !== null && row[c] !== undefined ? String(row[c]) : null)
        stmt.run(vals)
    })

    stmt.free()

    return {
        name: tableName,
        columns,
        rowCount: processedData.length,
        fileName
    }
}

export const loadFileToTable = async (
    file: File,
    tableName: string,
    cleanOption: CleanOption,
    customVal?: string
): Promise<TableInfo> => {
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls')

    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = async (e) => {
            try {
                if (!e.target?.result) {
                    throw new Error('File reading failed')
                }

                let jsonData: any[] = []
                let columns: string[] = []

                if (isExcel) {
                    // For Excel files - we'll implement basic parsing
                    // Since we can't use xlsx package directly with CDN, we'll parse CSV
                    const text = e.target.result as string
                    const lines = text.split('\n')
                    columns = lines[0].split(',').map(col => col.trim())

                    for (let i = 1; i < lines.length; i++) {
                        if (lines[i].trim()) {
                            const values = lines[i].split(',')
                            const row: any = {}
                            columns.forEach((col, index) => {
                                row[col] = values[index] ? values[index].trim() : ''
                            })
                            jsonData.push(row)
                        }
                    }
                } else {
                    // For CSV files using PapaParse from CDN
                    const text = e.target.result as string
                    const results = window.Papa.parse(text, {
                        header: true,
                        skipEmptyLines: true
                    })

                    jsonData = results.data
                    columns = results.meta.fields || []
                }

                if (jsonData.length === 0) {
                    throw new Error('No data found in file')
                }

                const info = await processDataToTable(jsonData, columns, tableName, file.name, cleanOption, customVal)
                resolve(info)
            } catch (err) {
                reject(err)
            }
        }

        reader.onerror = () => reject(new Error('Failed to read file'))

        if (isExcel) {
            reader.readAsText(file) // Simplified for now
        } else {
            reader.readAsText(file)
        }
    })
}

export const executeSql = async (sql: string): Promise<QueryResult> => {
    const database = await initDb()

    try {
        const res = database.exec(sql)

        if (res.length === 0) {
            return { columns: [], values: [], sql }
        }

        return {
            columns: res[0].columns,
            values: res[0].values,
            sql
        }
    } catch (error: any) {
        throw new Error(`SQL Error: ${error.message}`)
    }
}

export const getDbSchema = async (): Promise<string> => {
    const database = await initDb()

    try {
        const tables = database.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")

        if (tables.length === 0 || tables[0].values.length === 0) {
            return "No tables loaded."
        }

        let schemaStr = ""

        for (const tableRow of tables[0].values) {
            const tableName = tableRow[0]
            const columns = database.exec(`PRAGMA table_info(${tableName})`)

            if (columns.length > 0 && columns[0].values.length > 0) {
                const colList = columns[0].values.map((v: any) => `${v[1]} (${v[2]})`).join(', ')
                schemaStr += `Table ${tableName}: [${colList}]\n`
            }
        }

        return schemaStr || "No tables with columns found."
    } catch (error) {
        return "Error fetching schema."
    }
}