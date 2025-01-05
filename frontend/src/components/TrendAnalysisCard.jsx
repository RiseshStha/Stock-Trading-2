import React from 'react';
import { TrendingUp, TrendingDown, MinusCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

const TrendAnalysisCard = ({ trend, performance, supportResistance }) => {
  // Add null checks
  if (!performance || !supportResistance) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Market Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            Loading trend analysis...
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'uptrend':
        return <TrendingUp className="w-6 h-6 text-green-500" />;
      case 'downtrend':
        return <TrendingDown className="w-6 h-6 text-red-500" />;
      default:
        return <MinusCircle className="w-6 h-6 text-yellow-500" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getTrendIcon()}
          Market Trend Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Trend */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Current Trend</h3>
            <div className="text-xl font-bold capitalize">
              {trend || 'Unknown'}
            </div>
          </div>

          {/* Best/Worst Performance */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Performance Highlights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Best Day</p>
                <p className="font-semibold">{performance.best_day?.date || 'N/A'}</p>
                <p className="text-green-600">+{performance.best_day?.return || 0}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Worst Day</p>
                <p className="font-semibold">{performance.worst_day?.date || 'N/A'}</p>
                <p className="text-red-600">{performance.worst_day?.return || 0}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Best Month</p>
                <p className="font-semibold">{performance.best_month?.month || 'N/A'}</p>
                <p className="text-green-600">+{performance.best_month?.return || 0}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Worst Month</p>
                <p className="font-semibold">{performance.worst_month?.month || 'N/A'}</p>
                <p className="text-red-600">{performance.worst_month?.return || 0}%</p>
              </div>
            </div>
          </div>

          {/* Support/Resistance Levels */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Key Price Levels</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Support Levels</p>
                <ul className="space-y-1">
                  {supportResistance.support_levels?.map((level, index) => (
                    <li key={index} className="font-medium">
                      Rs. {level.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm text-gray-600">Resistance Levels</p>
                <ul className="space-y-1">
                  {supportResistance.resistance_levels?.map((level, index) => (
                    <li key={index} className="font-medium">
                      Rs. {level.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendAnalysisCard;