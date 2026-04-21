import TradingViewWidget from "@/components/TradingViewWidget";
import {
    MARKET_DATA_WIDGET_CONFIG,
    MARKET_OVERVIEW_WIDGET_CONFIG,
    TOP_STORIES_WIDGET_CONFIG
} from "@/lib/constants";

const Home = () => {
    const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

    return (
        <div className="flex min-h-screen flex-col gap-8 home-wrapper">
            <section className="space-y-3">
                <h1 className="text-3xl font-semibold text-white">Market dashboard</h1>
                <p className="text-sm text-gray-400 max-w-2xl">
                    Follow the broader market, review live quotes, and scan the latest stories before drilling into an individual stock.
                </p>
            </section>

            <section className="grid w-full gap-8 home-section">
                <div className="md:col-span-1 xl:col-span-1">
                    <TradingViewWidget
                        title="Market Overview"
                        scriptUrl={`${scriptUrl}market-overview.js`}
                        config={MARKET_OVERVIEW_WIDGET_CONFIG}
                        className="custom-chart"
                        height={600}
                    />
                </div>
                <div className="md-col-span xl:col-span-2">
                    <TradingViewWidget
                        title="Market Quotes"
                        scriptUrl={`${scriptUrl}market-quotes.js`}
                        config={MARKET_DATA_WIDGET_CONFIG}
                        height={600}
                    />
                </div>
            </section>

            <section className="grid w-full gap-8 home-section">
                <div className="md:col-span-1 xl:col-span-3">
                    <TradingViewWidget
                        title="Top Stories"
                        scriptUrl={`${scriptUrl}timeline.js`}
                        config={TOP_STORIES_WIDGET_CONFIG}
                        height={600}
                    />
                </div>
            </section>
        </div>
    )
}

export default Home;