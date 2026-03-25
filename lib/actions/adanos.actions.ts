'use server';

type SentimentSourceKey = 'reddit' | 'x' | 'news' | 'polymarket';
type SentimentTrend = 'rising' | 'falling' | 'stable';

type BaseCompareRow = {
    ticker?: string;
    company_name?: string | null;
    buzz_score?: number | null;
    trend?: SentimentTrend | null;
    bullish_pct?: number | null;
    trend_history?: number[] | null;
};

type SourceComparePayload = {
    stocks?: BaseCompareRow[];
};

const ADANOS_BASE_URL = (process.env.ADANOS_API_BASE_URL || 'https://api.adanos.org').replace(/\/$/, '');
const ADANOS_API_KEY = process.env.ADANOS_API_KEY ?? '';
const DEFAULT_LOOKBACK_DAYS = 7;

const SOURCE_CONFIG = {
    reddit: {
        label: 'Reddit',
        path: '/reddit/stocks/v1/compare',
        metricLabel: 'Mentions',
        metricField: 'mentions',
    },
    x: {
        label: 'X.com',
        path: '/x/stocks/v1/compare',
        metricLabel: 'Mentions',
        metricField: 'mentions',
    },
    news: {
        label: 'News',
        path: '/news/stocks/v1/compare',
        metricLabel: 'Mentions',
        metricField: 'mentions',
    },
    polymarket: {
        label: 'Polymarket',
        path: '/polymarket/stocks/v1/compare',
        metricLabel: 'Trades',
        metricField: 'trade_count',
    },
} as const satisfies Record<
    SentimentSourceKey,
    {
        label: string;
        path: string;
        metricLabel: string;
        metricField: string;
    }
>;

type SourceSpecificRow = BaseCompareRow & Record<string, unknown>;

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

function toNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
}

function roundTo(value: number, digits: number = 1): number {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
}

function average(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function normalizeTrend(value: unknown): SentimentTrend | null {
    return value === 'rising' || value === 'falling' || value === 'stable' ? value : null;
}

export function getSourceAlignment(bullishValues: number[]): string {
    if (bullishValues.length === 0) return 'No sentiment mix';
    if (bullishValues.length === 1) return 'Single-source view';

    const min = Math.min(...bullishValues);
    const max = Math.max(...bullishValues);
    const spread = max - min;
    const avg = average(bullishValues);

    if (spread <= 12 && avg >= 60) return 'Bullish alignment';
    if (spread <= 12 && avg <= 40) return 'Bearish alignment';
    if (spread <= 12) return 'Tight alignment';
    if (spread >= 25) return 'Wide divergence';
    return 'Mixed';
}

export function normalizeSourceInsight(
    source: SentimentSourceKey,
    row: SourceSpecificRow | null | undefined,
): SentimentSourceInsight | null {
    if (!row) return null;

    const buzzScore = toNumber(row.buzz_score);
    const metricValue = toNumber(row[SOURCE_CONFIG[source].metricField]);

    if (buzzScore === null || metricValue === null) {
        return null;
    }

    return {
        source,
        label: SOURCE_CONFIG[source].label,
        companyName: typeof row.company_name === 'string' ? row.company_name : null,
        buzzScore: roundTo(buzzScore),
        bullishPct: toNumber(row.bullish_pct),
        trend: normalizeTrend(row.trend),
        metricLabel: SOURCE_CONFIG[source].metricLabel,
        metricValue: Math.round(metricValue),
    };
}

export function buildStockSentimentInsights(
    symbol: string,
    sources: Array<SentimentSourceInsight | null>,
): StockSentimentInsights | null {
    const availableSources = sources.filter((source): source is SentimentSourceInsight => Boolean(source));

    if (availableSources.length === 0) {
        return null;
    }

    const buzzValues = availableSources.map((source) => source.buzzScore);
    const bullishValues = availableSources
        .map((source) => source.bullishPct)
        .filter((value): value is number => value !== null);

    return {
        symbol: symbol.toUpperCase(),
        companyName: availableSources.find((source) => source.companyName)?.companyName ?? null,
        averageBuzz: roundTo(average(buzzValues)),
        bullishAverage: bullishValues.length ? roundTo(average(bullishValues)) : null,
        sourceAlignment: getSourceAlignment(bullishValues),
        availableSources: availableSources.length,
        sources: availableSources,
    };
}

async function fetchCompareSource(
    source: SentimentSourceKey,
    symbol: string,
    days: number,
): Promise<SentimentSourceInsight | null> {
    const url = new URL(`${ADANOS_BASE_URL}${SOURCE_CONFIG[source].path}`);
    url.searchParams.set('tickers', symbol.toUpperCase());
    url.searchParams.set('days', String(days));

    try {
        const response = await fetch(url.toString(), {
            headers: {
                'X-API-Key': ADANOS_API_KEY,
            },
            next: { revalidate: 300 },
        });

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            console.error(`Adanos ${source} compare failed for ${symbol}: ${response.status}`);
            return null;
        }

        const payload = (await response.json()) as SourceComparePayload;
        const row = payload.stocks?.find((item) => item.ticker?.toUpperCase() === symbol.toUpperCase())
            ?? payload.stocks?.[0];

        return normalizeSourceInsight(source, row);
    } catch (error) {
        console.error(`Adanos ${source} compare request failed for ${symbol}`, error);
        return null;
    }
}

export async function getStockSentimentInsights(
    symbol: string,
    days: number = DEFAULT_LOOKBACK_DAYS,
): Promise<StockSentimentInsights | null> {
    if (!ADANOS_API_KEY || !symbol?.trim()) {
        return null;
    }

    const normalizedSymbol = symbol.trim().toUpperCase();
    const lookbackDays = Math.max(1, Math.min(days, 30));
    const sourceKeys = Object.keys(SOURCE_CONFIG) as SentimentSourceKey[];

    const sources = await Promise.all(
        sourceKeys.map((source) => fetchCompareSource(source, normalizedSymbol, lookbackDays)),
    );

    return buildStockSentimentInsights(normalizedSymbol, sources);
}
