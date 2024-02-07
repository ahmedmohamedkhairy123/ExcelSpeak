export interface TableInfo {
    name: string;
    columns: string[];
    rowCount: number;
    fileName: string;
}

export interface QueryResult {
    columns: string[];
    values: any[][];
    sql: string;
    explanation?: string;
    insights?: PredictiveInsight;
}

export interface PredictiveInsight {
    prediction: string;
    confidence: number;
    reasoning: string;
    whatIf?: string;
}

export interface HistoryItem {
    id: string;
    query: string;
    sql: string;
    timestamp: number;
}

export enum CleanOption {
    NONE = 'none',
    ZERO = 'zero',
    DROP = 'drop',
    CUSTOM = 'custom'
}