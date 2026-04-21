import { Metadata } from 'next';
import {
  HelpCircle,
  Search,
  Star,
  Bell,
  LineChart,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Help | OpenStock',
  description: 'Simple guidance for using OpenStock.',
};

const sections = [
  {
    title: 'Search for a stock',
    description: 'Use the search action in the header or press Cmd/Ctrl + K to quickly find a ticker and open its detail page.',
    icon: Search,
  },
  {
    title: 'Review the stock page',
    description: 'Each stock page focuses on the essentials: price chart, company profile, and financial information.',
    icon: LineChart,
  },
  {
    title: 'Save symbols to your watchlist',
    description: 'Add a stock to your watchlist from the stock detail page so you can revisit it quickly from one place.',
    icon: Star,
  },
  {
    title: 'Create price alerts',
    description: 'Open the watchlist, choose a saved symbol, and create an alert that watches for price moves above or below your threshold.',
    icon: Bell,
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      <div className="text-center pt-16 pb-12 space-y-4">
        <div className="inline-flex p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 mb-4">
          <HelpCircle className="text-blue-400 h-8 w-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">Using OpenStock</h1>
        <p className="text-xl text-gray-400">A compact guide to the core workflow.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-16">
        {sections.map(({ title, description, icon: Icon }) => (
          <div key={title} className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
            <div className="mb-4 bg-gray-800 p-2 rounded-lg w-fit">
              <Icon className="text-teal-400" />
            </div>
            <h2 className="font-bold text-white text-lg mb-2">{title}</h2>
            <p className="text-sm text-gray-400 leading-6">{description}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 text-center">
        <h3 className="text-xl font-bold text-white mb-2">What OpenStock is for</h3>
        <p className="text-gray-400 max-w-2xl mx-auto leading-7">
          OpenStock is focused on lightweight stock tracking: search, detail pages, watchlists, and price alerts. It is not a brokerage and it is not a social network.
        </p>
      </div>
    </div>
  );
}
