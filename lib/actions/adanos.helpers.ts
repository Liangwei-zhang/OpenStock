export type SentimentSourceKey = 'reddit' | 'x' | 'news' | 'polymarket';
export type SentimentTrend = 'rising' | 'falling' | 'stable';

export type SourceComparePayload = {
    stocks?: unknown[];
};

export interface SentimentSourceInsight {
    source: SentimentSourceKey;
    label: string;
    companyName: string | null;
    buzzScore: number;
    bullishPct: number | null;
    trend: SentimentTrend | null;
    metricLabel: string;
    metricValue: number;
}

export interface StockSentimentInsights {
    symbol: string;
    companyName: string | null;
    averageBuzz: number;
    bullishAverage: number | null;
    sourceAlignment: string;
    availableSources: number;
    sources: SentimentSourceInsight[];
}

export const SOURCE_CONFIG = {
    reddit: { label: 'Reddit', path: '', metricLabel: '', metricField: '' },
    x: { label: 'X.com', path: '', metricLabel: '', metricField: '' },
    news: { label: 'News', path: '', metricLabel: '', metricField: '' },
    polymarket: { label: 'Polymarket', path: '', metricLabel: '', metricField: '' },
} as const;

export function getSourceAlignment(): string {
    return 'Removed in simplified build';
}

export function normalizeSourceInsight(): SentimentSourceInsight | null {
    return null;
}

export function buildStockSentimentInsights(): StockSentimentInsights | null {
    return null;
}
