import React, { useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { RefreshCw } from 'lucide-react';

// Register ChartJS components and plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

const StockChart = ({ data, supportResistance, tradingSignals }) => {
  const chartRef = useRef(null);
  
  // Process trading signals
  const buySignals = tradingSignals?.filter(signal => signal.action === 'buy') || [];
  const sellSignals = tradingSignals?.filter(signal => signal.action === 'sell') || [];

  // Handle reset zoom
  const handleResetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  // Prepare chart data
  const chartData = {
    labels: data.map(item => item.Date),
    datasets: [
      // Main price line
      {
        label: 'Close Price',
        data: data.map(item => item.Close),
        borderColor: '#2563eb',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointRadius: 0,
        order: 2
      },
      // Buy Signals
      {
        label: 'Buy Signal',
        data: data.map(item => {
          const buySignal = buySignals.find(signal => signal.date === item.Date);
          return buySignal ? buySignal.price : null;
        }),
        backgroundColor: '#10b981',
        borderColor: '#064e3b',
        pointRadius: 12,
        pointStyle: 'triangle',
        pointHoverRadius: 15,
        pointBorderWidth: 2,
        showLine: false,
        order: 1
      },
      // Sell Signals
      {
        label: 'Sell Signal',
        data: data.map(item => {
          const sellSignal = sellSignals.find(signal => signal.date === item.Date);
          return sellSignal ? sellSignal.price : null;
        }),
        backgroundColor: '#ef4444',
        borderColor: '#7f1d1d',
        pointRadius: 12,
        pointStyle: 'rectRot',
        pointHoverRadius: 15,
        pointBorderWidth: 2,
        showLine: false,
        order: 1
      }
    ]
  };

  // Enhanced chart options with zoom
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          maxTicksLimit: 10,
          callback: function(value) {
            const date = new Date(this.getLabelForValue(value));
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }
        }
      },
      y: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: value => `Rs.${value.toLocaleString()}`
        }
      }
    },
    plugins: {
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
            modifierKey: 'ctrl'  // Requires holding ctrl key to zoom
          },
          pinch: {
            enabled: true
          },
          mode: 'xy',  // Allow zooming on both axes
          drag: {
            enabled: false  // Disabled drag-to-zoom
          }
        },
        pan: {
          enabled: true,
          mode: 'xy'  // Allow panning on both axes
        },
        limits: {
          x: {min: 'original', max: 'original'},
          y: {min: 'original', max: 'original'}
        }
      },
      legend: {
        labels: {
          usePointStyle: true,
          pointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += `Rs.${context.parsed.y.toLocaleString()}`;
              
              if (label.includes('Signal')) {
                const date = context.raw.date;
                const signal = [...buySignals, ...sellSignals].find(s => s.date === date);
                if (signal) {
                  label += ` (Confidence: ${(signal.confidence * 100).toFixed(0)}%)`;
                }
              }
            }
            return label;
          },
          title: function(tooltipItems) {
            const date = new Date(tooltipItems[0].label);
            return date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
          }
        }
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Price History & Trading Signals</CardTitle>
        <button
          onClick={handleResetZoom}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Reset Zoom
        </button>
      </CardHeader>
      <CardContent>
        <div className="h-96 relative">
          <Line ref={chartRef} data={chartData} options={options} />
        </div>
        
        {/* Zoom Instructions */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold mb-2">Chart Controls:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p>• Hold CTRL + Mouse Wheel to zoom in/out</p>
              <p>• Click and drag to pan when zoomed</p>
            </div>
            <div className="space-y-2">
              <p>• Pinch to zoom on touch devices</p>
            </div>
          </div>
        </div>

        {/* Signal Guide */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold mb-2">Signal Guide:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 transform rotate-45"></div>
              <span>Buy Signal (Triangle)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 transform rotate-45"></div>
              <span>Sell Signal (Diamond)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockChart;