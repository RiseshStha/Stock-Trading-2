import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TemporalAnalysis = ({ temporalData }) => {
  const { daily, weekly, monthly } = temporalData;

  // Prepare data for charts
  const monthlyData = Object.entries(monthly).map(([month, data]) => ({
    name: month,
    average: data.mean,
    highest: data.max,
    lowest: data.min
  }));

  const dailyData = Object.entries(daily).map(([day, data]) => ({
    name: day,
    average: data.mean,
    highest: data.max,
    lowest: data.min
  }));

  const ChartSection = ({ data, title }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis 
              tickFormatter={(value) => `Rs.${value.toLocaleString()}`}
            />
            <Tooltip 
              formatter={(value) => [`Rs.${value.toLocaleString()}`, '']}
            />
            <Legend />
            <Bar dataKey="highest" fill="#10b981" name="Highest" />
            <Bar dataKey="average" fill="#6366f1" name="Average" />
            <Bar dataKey="lowest" fill="#ef4444" name="Lowest" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Temporal Price Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <ChartSection data={monthlyData} title="Monthly Price Patterns" />
          <ChartSection data={dailyData} title="Daily Price Patterns" />
        </div>
      </CardContent>
    </Card>
  );
};

export default TemporalAnalysis;