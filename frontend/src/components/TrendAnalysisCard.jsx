import React from 'react';
import { TrendingUp, TrendingDown, MinusCircle, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { cn } from '../lib/utils';

const PriceCard = ({ label, value, prefix = 'Rs. ' }) => (
  <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 hover:border-gray-300 transition-colors">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="font-semibold">{prefix}{value.toLocaleString()}</span>
  </div>
);

const PerformanceCard = ({ title, date, percentage, isPositive }) => (
  <div className={cn(
    "p-4 rounded-lg border transition-all hover:shadow-md",
    isPositive ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
  )}>
    <p className="text-sm font-medium text-gray-600">{title}</p>
    <p className="text-lg font-bold mt-1">{date}</p>
    <p className={cn(
      "font-semibold flex items-center gap-1",
      isPositive ? "text-green-600" : "text-red-600"
    )}>
      {isPositive ? (
        <ArrowUp className="w-4 h-4" />
      ) : (
        <ArrowDown className="w-4 h-4" />
      )}
      {isPositive ? '+' : ''}{percentage}%
    </p>
  </div>
);

const PriceLevelsSection = ({ title, levels, colorScheme }) => (
  <div className={cn(
    "p-4 rounded-lg border",
    colorScheme === 'blue' ? "bg-blue-50 border-blue-200" : "bg-purple-50 border-purple-200"
  )}>
    <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
    <div className="space-y-2">
      {levels?.map((level, index) => (
        <PriceCard
          key={index}
          label={`Level ${index + 1}`}
          value={level}
        />
      ))}
    </div>
  </div>
);

const TrendSection = ({ trend }) => {
  const trendColors = {
    uptrend: "bg-green-50 border-green-200",
    downtrend: "bg-red-50 border-red-200",
    default: "bg-yellow-50 border-yellow-200"
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'uptrend':
        return <ArrowUp className="w-6 h-6 text-green-500" />;
      case 'downtrend':
        return <ArrowDown className="w-6 h-6 text-red-500" />;
      default:
        return <MinusCircle className="w-6 h-6 text-yellow-500" />;
    }
  };

  return (
    <div className={cn(
      "p-4 rounded-lg border transition-colors duration-300",
      trendColors[trend] || trendColors.default
    )}>
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-gray-600" />
        Current Trend
      </h3>
      <div className="text-2xl font-bold capitalize flex items-center gap-2">
        {trend || 'Unknown'}
        {getTrendIcon()}
      </div>
    </div>
  );
};

const LoadingState = () => (
  <Card className="w-full bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
    <CardHeader>
      <CardTitle>Market Trend Analysis</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-center h-48">
        <div className="animate-pulse space-y-4 w-full max-w-sm">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const TrendAnalysisCard = ({ trend, performance, supportResistance }) => {
  if (!performance || !supportResistance) {
    return <LoadingState />;
  }

  return (
    <Card className="w-full bg-white shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="border-b bg-gray-50">
        <CardTitle className="flex items-center gap-3">
          {trend === 'uptrend' ? (
            <TrendingUp className="w-6 h-6 text-green-500" />
          ) : trend === 'downtrend' ? (
            <TrendingDown className="w-6 h-6 text-red-500" />
          ) : (
            <MinusCircle className="w-6 h-6 text-yellow-500" />
          )}
          Market Trend Analysis
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-8">
          {/* Current Trend */}
          <TrendSection trend={trend} />

          {/* Performance Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance Highlights */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Performance Highlights</h3>
              <div className="space-y-4">
                <PerformanceCard
                  title="Best Day"
                  date={performance.best_day?.date || 'N/A'}
                  percentage={performance.best_day?.return || 0}
                  isPositive={true}
                />
                <PerformanceCard
                  title="Worst Day"
                  date={performance.worst_day?.date || 'N/A'}
                  percentage={performance.worst_day?.return || 0}
                  isPositive={false}
                />
              </div>
            </div>

            {/* Price Levels */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Key Price Levels</h3>
              <div className="space-y-4">
                <PriceLevelsSection
                  title="Resistance Levels"
                  levels={supportResistance.resistance_levels}
                  colorScheme="blue"
                />
                <PriceLevelsSection
                  title="Support Levels"
                  levels={supportResistance.support_levels}
                  colorScheme="purple"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendAnalysisCard;