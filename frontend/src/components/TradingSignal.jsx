import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const TradingSignals = ({ signals, backtestResults }) => {
  // Get only the last 5 signals
  const recentSignals = signals.slice(0, 5);
  
  const SignalCard = ({ signal }) => {
    const isLowConfidence = signal.confidence < 0.6;
    const isMediumConfidence = signal.confidence >= 0.6 && signal.confidence < 0.8;
    
    return (
      <div className={`
        p-4 rounded-lg border
        ${signal.action === 'buy' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {signal.action === 'buy' ? (
              <ArrowUpCircle className="w-5 h-5 text-green-600" />
            ) : (
              <ArrowDownCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="font-semibold capitalize">{signal.action}</span>
          </div>
          <span className="text-sm">{signal.date}</span>
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-gray-600">Price: Rs. {signal.price.toLocaleString()}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className={`
              px-2 py-1 rounded text-xs
              ${isLowConfidence ? 'bg-yellow-100 text-yellow-800' : ''}
              ${isMediumConfidence ? 'bg-blue-100 text-blue-800' : ''}
              ${!isLowConfidence && !isMediumConfidence ? 'bg-green-100 text-green-800' : ''}
            `}>
              {(signal.confidence * 100).toFixed(0)}% confidence
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Trading Signals & Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Backtest Results */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Initial Capital</p>
              <p className="text-xl font-bold">
                Rs. {backtestResults.initial_capital.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Final Value</p>
              <p className="text-xl font-bold">
                Rs. {backtestResults.final_value.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Return</p>
              <p className={`text-xl font-bold ${backtestResults.return_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {backtestResults.return_pct >= 0 ? '+' : ''}{backtestResults.return_pct.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Recent Trades */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Trading Signals</h3>
            <div className="space-y-3">
              {recentSignals.map((signal, index) => (
                <SignalCard key={index} signal={signal} />
              ))}
            </div>
          </div>

          {/* Trading History */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Action</th>
                    <th className="px-4 py-2">Shares</th>
                    <th className="px-4 py-2">Price</th>
                    <th className="px-4 py-2">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {backtestResults.trades.slice(0, 5).map((trade, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">{trade.date}</td>
                      <td className="px-4 py-2 capitalize">
                        <span className={trade.action === 'buy' ? 'text-green-600' : 'text-red-600'}>
                          {trade.action}
                        </span>
                      </td>
                      <td className="px-4 py-2">{trade.shares}</td>
                      <td className="px-4 py-2">Rs. {trade.price.toLocaleString()}</td>
                      <td className="px-4 py-2">Rs. {trade.value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingSignals;