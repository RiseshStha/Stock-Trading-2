// import React from 'react';
// import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

// const WeeklyPredictions = ({ predictions, lastClose }) => {
//   const date = new Date(pred.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

//   function getNextValidDate(dateStr) {
//     const currentDate = new Date(dateStr);
//     let day = currentDate.getDay(); // Get the day of the week (0 = Sunday, 6 = Saturday)
  
//     // Keep incrementing the date if it's Friday (5) or Saturday (6)
//     while (day === 5 || day === 6) {
//       currentDate.setDate(currentDate.getDate() + 1); // Increment by one day
//       day = currentDate.getDay(); // Update the day
//     }
//     return currentDate;
//   }
//   const nextValidDate = getNextValidDate(pred.date);

// // Format the next valid date
//   const formattedDate = nextValidDate.toLocaleDateString('en-US', {
//     weekday: 'short',
//     month: 'short',
//     day: 'numeric',
//   });

//   console.log('Formated date',formattedDate)
  

//   const data = predictions.map(pred => ({
//     date: formattedDate,
//     price: pred.price,
//     confidence: pred.confidence * 100
//   }));

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <CardTitle>Weekly Price Predictions</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-6">
//           {/* Chart */}
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart data={data}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="date" />
//                 <YAxis 
//                   domain={['auto', 'auto']}
//                   tickFormatter={(value) => `Rs.${value.toLocaleString()}`}
//                 />
//                 <Tooltip 
//                   formatter={(value, name) => [
//                     name === 'Price' ? `Rs.${value.toLocaleString()}` : `${value.toFixed(1)}%`,
//                     name
//                   ]}
//                 />
//                 <Legend />
//                 <Line 
//                   type="monotone" 
//                   dataKey="price" 
//                   stroke="#2563eb" 
//                   strokeWidth={2}
//                   name="Price"
//                 />
//                 <Line 
//                   type="monotone" 
//                   dataKey="confidence" 
//                   stroke="#10b981" 
//                   strokeDasharray="5 5"
//                   name="Confidence"
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>

//           {/* Prediction List */}
//           <div className="space-y-3">
//             {predictions.map((pred, index) => {
//               const changePercent = ((pred.price - (index === 0 ? lastClose : predictions[index - 1].price)) / 
//                                    (index === 0 ? lastClose : predictions[index - 1].price)) * 100;
//               const isPositive = changePercent > 0;

//               return (
//                 <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                   <div>
//                     <p className="text-sm text-gray-600">
//                       {new Date(pred.date).toLocaleDateString('en-US', { 
//                         weekday: 'long', 
//                         month: 'short', 
//                         day: 'numeric' 
//                       })}
//                     </p>
//                     <p className="font-semibold">Rs. {pred.price.toLocaleString()}</p>
//                   </div>
//                   <div className="text-right">
//                     <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
//                       {isPositive ? (
//                         <ArrowUpRight className="w-4 h-4" />
//                       ) : (
//                         <ArrowDownRight className="w-4 h-4" />
//                       )}
//                       <span>{Math.abs(changePercent).toFixed(2)}%</span>
//                     </div>
//                     <p className="text-sm text-gray-600">
//                       Confidence: {(pred.confidence * 100).toFixed(0)}%
//                     </p>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Confidence Note */}
//           <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
//             <p className="font-semibold mb-2">Note on Predictions:</p>
//             <p>Confidence levels decrease for predictions further into the future. These predictions are based on historical patterns and current market trends. Always consider multiple factors when making investment decisions.</p>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default WeeklyPredictions;


import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";


const WeeklyPredictionCard = ({ predictions, lastClose }) => {
    if (!predictions || predictions.length === 0) return null;
  
    const data = predictions.map(pred => ({
      date: new Date(pred.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
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
                      name === 'Price'
                        ? `Rs.${value.toLocaleString()}`
                        : `${value.toFixed(1)}%`,
                      name,
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
                const changePercent =
                  ((pred.price -
                    (index === 0 ? lastClose : predictions[index - 1].price)) /
                    (index === 0 ? lastClose : predictions[index - 1].price)) *
                  100;
                const isPositive = changePercent > 0;
  
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div>
                      <p className="text-sm text-gray-600">
                        {new Date(pred.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="font-semibold text-lg">
                        Rs. {pred.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`flex items-center gap-1 ${
                          isPositive ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        <span className="font-medium">
                          {Math.abs(changePercent).toFixed(2)}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Confidence: {(pred.confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
  
            {/* Confidence Note */}
            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
              <p className="font-medium mb-2">Note on Predictions:</p>
              <p>
                Confidence levels naturally decrease for predictions further into the
                future. These predictions are based on historical patterns and current
                market trends. Always consider multiple factors when making investment
                decisions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  export default WeeklyPredictionCard;