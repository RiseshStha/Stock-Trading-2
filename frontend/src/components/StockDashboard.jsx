import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import TradingSignals from "./TradingSignal";
import TemporalAnalysis from "./TemporalAnalysis";
import StockChart from "./StockChart";
import WeeklyPredictionCard from "./WeeklyPredictions";
import TrendAnalysisCard from './TrendAnalysisCard';
import {
  LineChart,
  Activity,
  RefreshCw,
  Bell,
  Settings,
  Search,
  Users,
  BarChart2,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// MarketMetrics Component
const MarketMetrics = ({ metrics }) => {
  const MetricCard = ({ title, value, change, icon: Icon }) => (
    <Card className="bg-white hover:shadow-lg transition-shadow duration-300 pt-4">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold mt-1">Rs. {value.toLocaleString()}</p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 mt-1 ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {change >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(change).toFixed(2)}%
                </span>
              </div>
            )}
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <MetricCard
        title="Current Price"
        value={metrics.current_price}
        change={metrics.daily_change_percent}
        icon={LineChart}
      />
      <MetricCard
        title="24h Volume"
        value={metrics.average_volume}
        icon={BarChart2}
      />
      <MetricCard
        title="Weekly High"
        value={metrics.weekly_high}
        icon={ArrowUpRight}
      />
      <MetricCard
        title="Weekly Low"
        value={metrics.weekly_low}
        icon={ArrowDownRight}
      />
    </>
  );
};

// StockDashboard Component
const StockDashboard = () => {
  // State Management
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
  const [retraining, setRetraining] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch Functions
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchHistoricalData(),
        fetchTradingData(),
        fetchTemporalData(),
        fetchMarketMetrics(),
      ]);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/historical");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.status === "success") {
        const formattedData = data.data.map((item) => ({
          ...item,
          Date: new Date(item.Date).toISOString().split("T")[0],
        }));

        const sortedData = [...formattedData].reverse();
        setStockData(sortedData);
        setTrendAnalysis(data.trend_analysis);
        setPerformanceMetrics(data.performance_metrics);
        setSupportResistance(data.support_resistance);

        const priceData = sortedData.map((d) => ({
          Date: d.Date,
          Open: d.Open || d.Close,
          High: d.High || d.Close,
          Low: d.Low || d.Close,
          Close: d.Close,
          Volume: d.Volume || 0,
        }));

        await fetchPrediction(priceData);
      }
    } catch (err) {
      throw new Error(`Error fetching historical data: ${err.message}`);
    }
  };

  const fetchTradingData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/trading/signals");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === "success") {
        const formattedSignals = data.signals.map((signal) => ({
          ...signal,
          date: new Date(signal.date).toISOString().split("T")[0],
        }));
        setTradingSignals(formattedSignals);
        setBacktestResults(data.backtest_results);
      }
    } catch (err) {
      throw new Error(`Error fetching trading data: ${err.message}`);
    }
  };

  const fetchTemporalData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/analysis/temporal");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === "success") {
        setTemporalPatterns(data.temporal_patterns);
      }
    } catch (err) {
      throw new Error(`Error fetching temporal data: ${err.message}`);
    }
  };

  const fetchMarketMetrics = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/metrics");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === "success") {
        setMarketMetrics(data.metrics);
      }
    } catch (err) {
      throw new Error(`Error fetching market metrics: ${err.message}`);
    }
  };

  const fetchPrediction = async (priceData) => {
    try {
      const dailyResponse = await fetch("http://localhost:5000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prices: priceData }),
      });

      const weeklyResponse = await fetch("http://localhost:5000/api/predict/weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prices: priceData }),
      });

      if (!dailyResponse.ok || !weeklyResponse.ok) throw new Error("HTTP error!");

      const [dailyData, weeklyData] = await Promise.all([
        dailyResponse.json(),
        weeklyResponse.json()
      ]);

      if (dailyData.status === "success" && weeklyData.status === "success") {
        setPrediction(dailyData.prediction);
        setWeeklyPredictions(weeklyData.weekly_predictions);
        setTrendAnalysis(dailyData.trend_analysis);
        setSupportResistance(dailyData.support_resistance);
      }
    } catch (err) {
      throw new Error(`Error fetching predictions: ${err.message}`);
    }
  };

  const retrainModel = async () => {
    try {
      setRetraining(true);
      setError(null);

      const response = await fetch("http://localhost:5000/api/retrain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.status === "success") {
        console.log("Model retrained successfully:", data.metrics);
        await fetchAllData();
      } else {
        throw new Error(data.error || "Retraining failed");
      }
    } catch (err) {
      console.error("Error retraining model:", err);
      setError("Failed to retrain model: " + err.message);
    } finally {
      setRetraining(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            {/* Primary spinner */}
            <div className="w-16 h-16 rounded-full border-4 border-blue-200 animate-spin">
              <div className="absolute top-1 right-1 w-3 h-3 bg-blue-600 rounded-full"></div>
            </div>
            {/* Secondary spinner (optional) */}
            <div className="absolute inset-0 w-16 h-16 rounded-full border-t-4 border-blue-600 animate-spin opacity-30"></div>
          </div>
          <p className="text-gray-600 font-medium animate-pulse">
            Loading market data...
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-8">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <button 
          onClick={fetchAllData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Loading Data
        </button>
      </div>
    );
  }

  const lastClose = stockData.length > 0 ? stockData[stockData.length - 1]?.Close : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <LineChart className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">UNL Stock Analysis</h1>
                <p className="text-sm text-gray-500">Real-time Market Intelligence</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search markets..."
                  className="bg-transparent border-none focus:outline-none ml-2 text-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Bell className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={retrainModel}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  disabled={retraining}
                >
                  <RefreshCw className={`w-4 h-4 ${retraining ? 'animate-spin' : ''}`} />
                  {retraining ? 'Retraining...' : 'Retrain Model'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Market Metrics */}
        {marketMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MarketMetrics metrics={marketMetrics} />
          </div>
        )}

        {/* Main Chart */}
        <div className="grid gap-6 mb-8">
          <Card className="overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="border-b bg-gray-50/50 px-6 py-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-blue-600" />
                Price History & Trading Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[600px]">
                <StockChart 
                  data={stockData} 
                  supportResistance={supportResistance}
                  tradingSignals={tradingSignals}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TrendAnalysisCard 
            trend={trendAnalysis}
            performance={performanceMetrics}
            supportResistance={supportResistance}
          />
          {weeklyPredictions && (
            <WeeklyPredictionCard 
              predictions={weeklyPredictions}
              lastClose={lastClose}
            />
          )}
          </div>
          {/* Trading Signals and Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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

        {/* Market Insights Section */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-blue-600" />
                Market Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Volume Analysis */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Volume Analysis</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {marketMetrics?.average_volume.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Average Daily Volume</p>
                </div>

                {/* Price Range */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Price Range</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">High</span>
                      <span className="font-medium text-green-600">
                        Rs. {marketMetrics?.weekly_high.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Low</span>
                      <span className="font-medium text-red-600">
                        Rs. {marketMetrics?.weekly_low.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance */}
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Performance</h3>
                  <div className="flex items-center gap-2">
                    {marketMetrics?.daily_change_percent >= 0 ? (
                      <ArrowUpRight className="w-5 h-5 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-red-500" />
                    )}
                    <span className={`text-lg font-bold ${
                      marketMetrics?.daily_change_percent >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {Math.abs(marketMetrics?.daily_change_percent || 0).toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Daily Change</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">Real-time Market Data</span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">System Operational</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Live Updates</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">
                  Last Update: {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StockDashboard;