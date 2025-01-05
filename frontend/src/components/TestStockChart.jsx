import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

class TestStockChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chartData: null
        };
    }

    componentDidMount() {
        this.prepareChartData();
    }

    prepareChartData() {
        const dummyPriceData = [
            { Date: '2020-08-05', Close: 19210, High: 19210, Low: 19210, Volume: 0 },
            { Date: '2021-06-15', Close: 19998, High: 19998, Low: 19816, Volume: 0 },
            { Date: '2021-09-26', Close: 19696, High: 19696, Low: 19696, Volume: 0 },
            { Date: '2024-01-01', Close: 42140, High: 43000, Low: 42140, Volume: 0 },
            { Date: '2024-08-14', Close: 50997.3, High: 50997.3, Low: 49995, Volume: 0 },
            { Date: '2024-12-31', Close: 45500, High: 45500, Low: 44900, Volume: 0 }
        ];

        const dummySignals = [
            { action: 'buy', confidence: 0.65, date: '2024-12-31', price: 45500 },
            { action: 'buy', confidence: 0.5, date: '2024-08-14', price: 50997.3 },
            { action: 'buy', confidence: 0.5, date: '2024-01-01', price: 42140 },
            { action: 'sell', confidence: 0.5, date: '2023-12-27', price: 43500 },
            { action: 'sell', confidence: 0.5, date: '2023-02-15', price: 22000 },
            { action: 'sell', confidence: 0.5, date: '2022-06-20', price: 17751 }
        ];

        // Format data for charting
        const labels = dummyPriceData.map(item => item.Date);
        const closeData = dummyPriceData.map(item => item.Close);

        const buySignals = dummySignals.filter(signal => signal.action === 'buy');
        const sellSignals = dummySignals.filter(signal => signal.action === 'sell');

        // Prepare dataset for chart
        const chartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Close Price',
                    data: closeData,
                    borderColor: '#42a5f5',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'Buy Signals',
                    data: buySignals.map(signal => signal.price),
                    backgroundColor: 'green',
                    borderColor: 'green',
                    pointRadius: 6,
                    pointBackgroundColor: 'green',
                    pointHoverBackgroundColor: 'green',
                    pointHoverRadius: 8,
                    pointStyle: 'circle',
                    fill: false,
                    showLine: false
                },
                {
                    label: 'Sell Signals',
                    data: sellSignals.map(signal => signal.price),
                    backgroundColor: 'red',
                    borderColor: 'red',
                    pointRadius: 6,
                    pointBackgroundColor: 'red',
                    pointHoverBackgroundColor: 'red',
                    pointHoverRadius: 8,
                    pointStyle: 'cross',
                    fill: false,
                    showLine: false
                }
            ]
        };

        this.setState({ chartData });
    }

    render() {
        return (
            <div className="container mx-auto p-4">
                <div className="text-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-700">Financial Chart with Buy/Sell Signals</h1>
                </div>
                <div className="bg-white p-4 rounded shadow-md">
                    {this.state.chartData ? (
                        <Line data={this.state.chartData} />
                    ) : (
                        <p>Loading chart...</p>
                    )}
                </div>
            </div>
        );
    }
}

export default TestStockChart;
