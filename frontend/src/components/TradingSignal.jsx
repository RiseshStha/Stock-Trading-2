// import React from 'react';
// import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
// import { TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

// const TradingSignals = ({ signals, backtestResults }) => {
//   // Get only the last 5 signals
//   const recentSignals = signals.slice(0, 5);
  
//   const SignalCard = ({ signal }) => {
//     const isLowConfidence = signal.confidence < 0.6;
//     const isMediumConfidence = signal.confidence >= 0.6 && signal.confidence < 0.8;
    
//     return (
//       <div className={`
//         p-4 rounded-lg border
//         ${signal.action === 'buy' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}
//       `}>
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             {signal.action === 'buy' ? (
//               <ArrowUpCircle className="w-5 h-5 text-green-600" />
//             ) : (
//               <ArrowDownCircle className="w-5 h-5 text-red-600" />
//             )}
//             <span className="font-semibold capitalize">{signal.action}</span>
//           </div>
//           <span className="text-sm">{signal.date}</span>
//         </div>
        
//         <div className="mt-2">
//           <p className="text-sm text-gray-600">Price: Rs. {signal.price.toLocaleString()}</p>
//           <div className="flex items-center gap-2 mt-1">
//             <div className={`
//               px-2 py-1 rounded text-xs
//               ${isLowConfidence ? 'bg-yellow-100 text-yellow-800' : ''}
//               ${isMediumConfidence ? 'bg-blue-100 text-blue-800' : ''}
//               ${!isLowConfidence && !isMediumConfidence ? 'bg-green-100 text-green-800' : ''}
//             `}>
//               {(signal.confidence * 100).toFixed(0)}% confidence
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <TrendingUp className="w-6 h-6" />
//           Trading Signals & Performance
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-6">
//           {/* Backtest Results */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="p-4 bg-gray-50 rounded-lg">
//               <p className="text-sm text-gray-600">Initial Capital</p>
//               <p className="text-xl font-bold">
//                 Rs. {backtestResults.initial_capital.toLocaleString()}
//               </p>
//             </div>
//             <div className="p-4 bg-gray-50 rounded-lg">
//               <p className="text-sm text-gray-600">Final Value</p>
//               <p className="text-xl font-bold">
//                 Rs. {backtestResults.final_value.toLocaleString()}
//               </p>
//             </div>
//             <div className="p-4 bg-gray-50 rounded-lg">
//               <p className="text-sm text-gray-600">Return</p>
//               <p className={`text-xl font-bold ${backtestResults.return_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//                 {backtestResults.return_pct >= 0 ? '+' : ''}{backtestResults.return_pct.toFixed(2)}%
//               </p>
//             </div>
//           </div>

//           {/* Recent Trades */}
//           <div>
//             <h3 className="text-lg font-semibold mb-4">Recent Trading Signals</h3>
//             <div className="space-y-3">
//               {recentSignals.map((signal, index) => (
//                 <SignalCard key={index} signal={signal} />
//               ))}
//             </div>
//           </div>

//           {/* Trading History */}
//           <div>
//             <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="text-left">
//                     <th className="px-4 py-2">Date</th>
//                     <th className="px-4 py-2">Action</th>
//                     <th className="px-4 py-2">Shares</th>
//                     <th className="px-4 py-2">Price</th>
//                     <th className="px-4 py-2">Value</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {backtestResults.trades.slice(0, 5).map((trade, index) => (
//                     <tr key={index} className="border-t">
//                       <td className="px-4 py-2">{trade.date}</td>
//                       <td className="px-4 py-2 capitalize">
//                         <span className={trade.action === 'buy' ? 'text-green-600' : 'text-red-600'}>
//                           {trade.action}
//                         </span>
//                       </td>
//                       <td className="px-4 py-2">{trade.shares}</td>
//                       <td className="px-4 py-2">Rs. {trade.price.toLocaleString()}</td>
//                       <td className="px-4 py-2">Rs. {trade.value.toLocaleString()}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default TradingSignals;

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  AlertTriangle, 
  TrendingUp,
  CandlestickChart,
  DollarSign,
  BarChart2
} from 'lucide-react';

const TradingSignals = ({ signals, backtestResults }) => {
  const SignalCard = ({ signal }) => {
    const isBuy = signal.action === 'buy';
    const confidenceLevel = signal.confidence;
    
    const getConfidenceColor = () => {
      if (confidenceLevel >= 0.7) return 'text-green-600 bg-green-50';
      if (confidenceLevel >= 0.5) return 'text-yellow-600 bg-yellow-50';
      return 'text-red-600 bg-red-50';
    };

    return (
      <div className={`p-4 rounded-lg border ${
        isBuy ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isBuy ? (
              <ArrowUpCircle className="w-5 h-5 text-green-600" />
            ) : (
              <ArrowDownCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="font-semibold capitalize">{signal.action}</span>
          </div>
          <span className="text-sm text-gray-600">{signal.date}</span>
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-gray-600">Price: Rs. {signal.price.toLocaleString()}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className={`px-2 py-1 rounded text-xs ${getConfidenceColor()}`}>
              {(signal.confidence * 100).toFixed(0)}% confidence
            </div>
          </div>
        </div>

        {/* Indicators */}
        <div className="mt-2 grid grid-cols-3 gap-2">
          {Object.entries(signal.indicators).map(([key, value], index) => (
            <div key={index} className="text-xs bg-white rounded p-2">
              <span className="text-gray-600">{key}: </span>
              <span className="font-medium">{value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Calculate total profit
  const calculateTotalProfit = () => {
    if (!backtestResults) return 0;
    return backtestResults.final_value - backtestResults.initial_capital;
  };

  const totalProfit = calculateTotalProfit();
  const profitPercentage = (totalProfit / backtestResults?.initial_capital * 100) || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Trading Signals & Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Trading Performance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-600">Total Profit</span>
              </div>
              <p className={`text-lg font-bold mt-2 ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Rs. {totalProfit.toLocaleString()}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-600">Return</span>
              </div>
              <p className={`text-lg font-bold mt-2 ${profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profitPercentage.toFixed(2)}%
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <BarChart2 className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm text-gray-600">Success Rate</span>
              </div>
              <p className="text-lg font-bold mt-2">
                {((backtestResults?.trades?.filter(t => 
                  (t.action === 'sell' && t.value > t.price) || 
                  (t.action === 'buy' && t.value < t.price)
                ).length / backtestResults?.trades?.length) * 100 || 0).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Recent Signals */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Trading Signals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {signals.slice(0, 4).map((signal, index) => (
                <SignalCard key={index} signal={signal} />
              ))}
            </div>
          </div>

          {/* Recent Trades Table */}
          {backtestResults?.trades && backtestResults.trades.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">P/L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {backtestResults.trades.slice(0, 5).map((trade, index) => {
                      const profitLoss = trade.action === 'sell' ? trade.value - trade.price : trade.price - trade.value;
                      return (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-600">{trade.date}</td>
                          <td className={`px-4 py-2 text-sm font-medium ${
                            trade.action === 'buy' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {trade.action.toUpperCase()}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">Rs. {trade.price.toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">Rs. {trade.value.toLocaleString()}</td>
                          <td className={`px-4 py-2 text-sm font-medium ${
                            profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {profitLoss >= 0 ? '+' : ''}{profitLoss.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              * Trading signals and performance metrics are based on historical data and technical analysis. 
              Past performance does not guarantee future results. Always conduct your own research before making investment decisions.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingSignals;