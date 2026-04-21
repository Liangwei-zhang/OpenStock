import { inngest } from "@/lib/inngest/client";

export const checkStockAlerts = inngest.createFunction(
    { id: 'check-stock-alerts', triggers: [{ cron: '*/5 * * * *' }] },
    async ({ step }) => {
        const activeAlerts = await step.run('fetch-active-alerts', async () => {
            const { connectToDatabase } = await import("@/database/mongoose");
            const { Alert } = await import("@/database/models/alert.model");

            await connectToDatabase();
            const now = new Date();

            return await Alert.find({
                active: true,
                triggered: false,
                expiresAt: { $gt: now }
            }).lean();
        });

        if (!activeAlerts || activeAlerts.length === 0) {
            return { message: 'No active alerts to check.' };
        }

        const symbols = [...new Set(activeAlerts.map((a: any) => a.symbol))];

        const prices = await step.run('fetch-prices', async () => {
            const { getQuote } = await import("@/lib/actions/finnhub.actions");
            const priceMap: Record<string, number> = {};

            for (const sym of symbols) {
                try {
                    const quote = await getQuote(sym as string);
                    if (quote && quote.c) {
                        priceMap[sym as string] = quote.c;
                    }
                } catch (e) {
                    console.error(`Failed to fetch price for ${sym}`, e);
                }
            }
            return priceMap;
        });

        type TriggeredAlert = { alert: any; currentPrice: number };
        const triggeredAlerts: TriggeredAlert[] = [];

        for (const alert of activeAlerts as any[]) {
            const currentPrice = prices[alert.symbol];
            if (!currentPrice) continue;

            let isTriggered = false;
            if (alert.condition === 'ABOVE' && currentPrice >= alert.targetPrice) {
                isTriggered = true;
            } else if (alert.condition === 'BELOW' && currentPrice <= alert.targetPrice) {
                isTriggered = true;
            }

            if (isTriggered) {
                triggeredAlerts.push({ alert, currentPrice });
            }
        }

        if (triggeredAlerts.length > 0) {
            await step.run('process-triggered-alerts', async () => {
                const { connectToDatabase } = await import("@/database/mongoose");
                const { Alert } = await import("@/database/models/alert.model");
                await connectToDatabase();

                for (const { alert, currentPrice } of triggeredAlerts) {
                    console.log(`ALERT FIRED: ${alert.symbol} is ${currentPrice} (${alert.condition} ${alert.targetPrice})`);
                    await Alert.findByIdAndUpdate(alert._id, { triggered: true, active: false });
                }
            });
        }

        return {
            processed: activeAlerts.length,
            triggered: triggeredAlerts.length
        };
    }
);
