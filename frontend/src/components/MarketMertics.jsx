import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const MarketMetrics = ({ metrics }) => {
  const {
    current_price,
    daily_change,
    daily_change_percent,
    weekly_high,
    weekly_low,
    monthly_high,
    monthly_low,
    average_volume
  } = metrics;

  const MetricItem = ({ label, value, change, changePercent }) => (
    <div className="space-y-1">
      <p className="text-sm text-gray-600">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">
          {typeof value === 'number' ? `Rs. ${value.toLocaleString()}` : value}
        </span>
        {changePercent && (
          <span className={`flex items-center text-sm ${changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {changePercent >= 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            {Math.abs(changePercent).toFixed(2)}%
          </span>
        )}
      </div>
      {change && (
        <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '+' : ''}{change.toLocaleString()}
        </p>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Market Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricItem 
            label="Current Price"
            value={current_price}
            change={daily_change}
            changePercent={daily_change_percent}
          />
          
          <MetricItem 
            label="Average Volume"
            value={average_volume.toLocaleString()}
          />
          
          <div className="space-y-4">
            <h4 className="font-semibold">Weekly Range</h4>
            <div className="grid grid-cols-2 gap-4">
              <MetricItem label="High" value={weekly_high} />
              <MetricItem label="Low" value={weekly_low} />
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">Monthly Range</h4>
            <div className="grid grid-cols-2 gap-4">
              <MetricItem label="High" value={monthly_high} />
              <MetricItem label="Low" value={monthly_low} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketMetrics;