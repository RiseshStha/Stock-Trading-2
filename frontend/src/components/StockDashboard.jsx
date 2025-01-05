// StockDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Alert, AlertDescription } from './ui/alert';
import { RefreshCw } from 'lucide-react';
import TrendAnalysisCard from './TrendAnalysisCard';
import TradingSignals from './TradingSignal';
import TemporalAnalysis from './TemporalAnalysis';
import MarketMetrics from './MarketMertics';
import StockChart from './StockChart';
import { Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const StockDashboard = () => {
  // State management
  const [stockData, setStockData] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [trendAnalysis, setTrendAnalysis] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [supportResistance, setSupportResistance] = useState(null);
  const [tradingSignals, setTradingSignals] = useState([]);
  const [backtestResults, setBacktestResults] = useState(null);
  const [temporalPatterns, setTemporalPatterns] = useState(null);
  const [marketMetrics, setMarketMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weeklyPredictions, setWeeklyPredictions] = useState(null);

  // Debug effect for data verification
  useEffect(() => {
    if (stockData.length > 0 && tradingSignals.length > 0) {
      console.log('Sample stock data date:', stockData[0].Date);
      console.log('Sample signal date:', tradingSignals[0].date);
      console.log('Number of trading signals:', tradingSignals.length);
      console.log('Number of price points:', stockData.length);
      console.log('Trading Signals:', tradingSignals);
      console.log('Stock Data:', stockData);
    }
  }, [stockData, tradingSignals]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchHistoricalData(),
        fetchTradingData(),
        fetchTemporalData(),
        fetchMarketMetrics()
      ]);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/historical');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.status === 'success') {
        // Format dates consistently
        const formattedData = data.data.map(item => ({
          ...item,
          Date: new Date(item.Date).toISOString().split('T')[0]
        }));
        
        const sortedData = [...formattedData].reverse();
        setStockData(sortedData);
        setTrendAnalysis(data.trend_analysis);
        setPerformanceMetrics(data.performance_metrics);
        setSupportResistance(data.support_resistance);

        // Prepare data for prediction
        const priceData = sortedData.map(d => ({
          Date: d.Date,
          Open: d.Open || d.Close,
          High: d.High || d.Close,
          Low: d.Low || d.Close,
          Close: d.Close,
          Volume: d.Volume || 0
        }));

        // Fetch prediction
        await fetchPrediction(priceData);
      }
    } catch (err) {
      throw new Error(`Error fetching historical data: ${err.message}`);
    }
  };

  const fetchTradingData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/trading/signals');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (data.status === 'success') {
        // Format dates consistently
        const formattedSignals = data.signals.map(signal => ({
          ...signal,
          date: new Date(signal.date).toISOString().split('T')[0]
        }));
        console.log('Formatted trading signals:', formattedSignals);
        setTradingSignals(formattedSignals);
        setBacktestResults(data.backtest_results);
      }
    } catch (err) {
      throw new Error(`Error fetching trading data: ${err.message}`);
    }
  };

  const fetchPrediction = async (priceData) => {
    try {
      // Daily prediction
      const dailyResponse = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prices: priceData }),
      });
  
      // Weekly prediction
      const weeklyResponse = await fetch('http://localhost:5000/api/predict/weekly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prices: priceData }),
      });
  
      if (!dailyResponse.ok || !weeklyResponse.ok) {
        throw new Error(`HTTP error!`);
      }
  
      const dailyData = await dailyResponse.json();
      const weeklyData = await weeklyResponse.json();
  
      if (dailyData.status === 'success' && weeklyData.status === 'success') {
        setPrediction(dailyData.prediction);
        setWeeklyPredictions(weeklyData.weekly_predictions);
        setTrendAnalysis(dailyData.trend_analysis);
        setSupportResistance(dailyData.support_resistance);
      }
    } catch (err) {
      throw new Error(`Error fetching predictions: ${err.message}`);
    }
  };

  const WeeklyPredictionCard = ({ predictions, lastClose }) => {
    if (!predictions || predictions.length === 0) return null;
  
    const data = predictions.map(pred => ({
      date: new Date(pred.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      price: pred.price,
      confidence: pred.confidence * 100
    }));
  
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Price Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis 
                    yAxisId="price"
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => `Rs.${value.toLocaleString()}`}
                  />
                  <YAxis 
                    yAxisId="confidence"
                    orientation="right"
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'Price' ? `Rs.${value.toLocaleString()}` : `${value.toFixed(1)}%`,
                      name
                    ]}
                  />
                  <Legend />
                  <Line 
                    yAxisId="price"
                    type="monotone" 
                    dataKey="price" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    name="Price"
                  />
                  <Line 
                    yAxisId="confidence"
                    type="monotone" 
                    dataKey="confidence" 
                    stroke="#10b981" 
                    strokeDasharray="5 5"
                    name="Confidence"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
  
            {/* Prediction List */}
            <div className="space-y-3">
              {predictions.map((pred, index) => {
                const changePercent = ((pred.price - (index === 0 ? lastClose : predictions[index - 1].price)) / 
                                     (index === 0 ? lastClose : predictions[index - 1].price)) * 100;
                const isPositive = changePercent > 0;
  
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">
                        {new Date(pred.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="font-semibold">Rs. {pred.price.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        <span>{Math.abs(changePercent).toFixed(2)}%</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Confidence: {(pred.confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const fetchTemporalData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/analysis/temporal');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (data.status === 'success') {
        setTemporalPatterns(data.temporal_patterns);
      }
    } catch (err) {
      throw new Error(`Error fetching temporal data: ${err.message}`);
    }
  };

  const fetchMarketMetrics = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/metrics');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (data.status === 'success') {
        setMarketMetrics(data.metrics);
      }
    } catch (err) {
      throw new Error(`Error fetching market metrics: ${err.message}`);
    }
  };

  const PredictionCard = ({ value, lastClose }) => {
    const changePercent = ((value - lastClose) / lastClose * 100);
    const isPositive = changePercent > 0;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Next Day Prediction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Predicted Close</p>
              <p className="text-3xl font-bold">Rs. {value.toLocaleString()}</p>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Close</span>
                <span className="font-semibold">
                  Rs. {lastClose.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600">Expected Change</span>
                <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <button 
          onClick={fetchAllData}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  const lastClose = stockData.length > 0 ? stockData[stockData.length - 1]?.Close : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Stock Price Analysis</h1>
        <button 
          onClick={fetchAllData}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </button>
      </div>
      
      {/* Market Metrics */}
      {marketMetrics && (
        <div className="mb-8">
          <MarketMetrics metrics={marketMetrics} />
        </div>
      )}
      
      {/* Main Chart */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>Price History & Trading Signals</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[700px]">
                <StockChart 
                  data={stockData} 
                  supportResistance={supportResistance}
                  tradingSignals={tradingSignals}
                />
                {/* <TestStockChart /> */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Prediction and Trend Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {prediction && <PredictionCard value={prediction} lastClose={lastClose} />}
        <TrendAnalysisCard 
          trend={trendAnalysis}
          performance={performanceMetrics}
          supportResistance={supportResistance}
        />
      </div>
      <div className="lg:col-span-2">
    {weeklyPredictions && (
      <WeeklyPredictionCard 
        predictions={weeklyPredictions}
        lastClose={lastClose}
      />
    )}
  </div>
      
      {/* Trading Signals and Temporal Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tradingSignals.length > 0 && backtestResults && (
          <TradingSignals 
            signals={tradingSignals}
            backtestResults={backtestResults}
          />
        )}
        {temporalPatterns && (
          <TemporalAnalysis temporalData={temporalPatterns} />
        )}
      </div>
    </div>
  );
};

export default StockDashboard;