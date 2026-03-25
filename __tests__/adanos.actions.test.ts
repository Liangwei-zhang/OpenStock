import { describe, expect, it } from 'vitest';

import {
    buildStockSentimentInsights,
    getSourceAlignment,
    normalizeSourceInsight,
} from '@/lib/actions/adanos.actions';

describe('normalizeSourceInsight', () => {
    it('maps source-specific metrics for mentions and trades', () => {
        const reddit = normalizeSourceInsight('reddit', {
            ticker: 'TSLA',
            buzz_score: 81.2,
            bullish_pct: 46,
            trend: 'rising',
            mentions: 647,
        });

        const polymarket = normalizeSourceInsight('polymarket', {
            ticker: 'TSLA',
            buzz_score: 55.7,
            bullish_pct: 72,
            trend: 'stable',
            trade_count: 3731,
        });

        expect(reddit).toMatchObject({
            label: 'Reddit',
            companyName: null,
            metricLabel: 'Mentions',
            metricValue: 647,
            buzzScore: 81.2,
            bullishPct: 46,
        });
        expect(polymarket).toMatchObject({
            label: 'Polymarket',
            companyName: null,
            metricLabel: 'Trades',
            metricValue: 3731,
            buzzScore: 55.7,
            bullishPct: 72,
        });
    });

    it('returns null when required values are missing', () => {
        expect(
            normalizeSourceInsight('x', {
                ticker: 'NVDA',
                bullish_pct: 54,
                mentions: 1200,
            }),
        ).toBeNull();

        expect(
            normalizeSourceInsight('news', {
                ticker: 'NVDA',
                buzz_score: 60,
                bullish_pct: 54,
            }),
        ).toBeNull();
    });
});

describe('getSourceAlignment', () => {
    it('classifies wide divergence when sources materially disagree', () => {
        expect(getSourceAlignment([31, 56, 48, 30])).toBe('Wide divergence');
    });

    it('classifies bullish alignment when sources are tightly aligned and positive', () => {
        expect(getSourceAlignment([61, 64, 67])).toBe('Bullish alignment');
    });
});

describe('buildStockSentimentInsights', () => {
    it('builds a compact aggregate summary from available sources', () => {
        const insight = buildStockSentimentInsights('TSLA', [
            {
                source: 'reddit',
                label: 'Reddit',
                companyName: 'Tesla, Inc.',
                buzzScore: 74.1,
                bullishPct: 31,
                trend: 'rising',
                metricLabel: 'Mentions',
                metricValue: 647,
            },
            {
                source: 'x',
                label: 'X.com',
                companyName: 'Tesla, Inc.',
                buzzScore: 86.1,
                bullishPct: 56,
                trend: 'falling',
                metricLabel: 'Mentions',
                metricValue: 2650,
            },
            {
                source: 'polymarket',
                label: 'Polymarket',
                companyName: 'Tesla, Inc.',
                buzzScore: 83.3,
                bullishPct: 30,
                trend: 'falling',
                metricLabel: 'Trades',
                metricValue: 3731,
            },
            null,
        ]);

        expect(insight).toMatchObject({
            symbol: 'TSLA',
            companyName: 'Tesla, Inc.',
            averageBuzz: 81.2,
            bullishAverage: 39,
            sourceAlignment: 'Wide divergence',
            availableSources: 3,
        });
        expect(insight?.sources).toHaveLength(3);
    });

    it('returns null when no sources have usable data', () => {
        expect(buildStockSentimentInsights('MSFT', [null, null])).toBeNull();
    });
});
