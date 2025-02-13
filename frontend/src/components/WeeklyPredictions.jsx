
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
  let storedArray = [];
  if (!predictions || predictions.length === 0) return null;

  const data = predictions.map((pred) => ({
    date: new Date(pred.date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    price: pred.price,
    confidence: pred.confidence * 100,
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
                  domain={["auto", "auto"]}
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
                    name === "Price"
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
                      {(() => {
                        //make a varibale to store date and compare the date if date is already exists if exist increase date by 1.
                        // Helper function to adjust days based on the mapping
                        const adjustDay = (dateStr) => {
                          const date = new Date(dateStr);
                          const day = date.getDay(); // Get the day of the week (0 = Sunday, 6 = Saturday)

                          if (day === 5) {
                            date.setDate(date.getDate() + 2);
                          }
                          if (day === 6) {
                            date.setDate(date.getDate() + 2);
                          }

                          let found = false;
                          for (let i = 0; i < storedArray.length; i++) {
                            console.log('dayssss',storedArray,'day',day)
                            if (storedArray[i] === day) {
                              date.setDate(date.getDate() + 2);
                              found = true;
                              break; // Stop the loop if a match is found
                            }
                          }
                          console.log('found', found)
                          if (found) {
                            console.log('Worked!');
                            // date.setDate(date.getDate() + 1);
                          }
                          storedArray.push(date.getDay());
                          return date;
                        };
                        // date.setDate(date.getDate())
                        // console.log(storedArray);

                        // Adjust and format the date
                        const adjustedDate = adjustDay(pred.date);
                        return adjustedDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        });
                      })()}
                    </p>
                    <p className="font-semibold text-lg">
                      Rs. {pred.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`flex items-center gap-1 ${
                        isPositive ? "text-green-600" : "text-red-600"
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
              Confidence levels naturally decrease for predictions further into
              the future. These predictions are based on historical patterns and
              current market trends. Always consider multiple factors when
              making investment decisions.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyPredictionCard;
