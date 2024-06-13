import React, { useState, useMemo } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useSpring, animated } from "react-spring";
import "tailwindcss/tailwind.css";

const generateSampleData = () => {
  const startDate = new Date("2024-01-01");
  const data = [];
  let baseValue = 50000;
  for (let i = 0; i < 14; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    baseValue += Math.floor(Math.random() * 10000 - 5000);
    data.push({
      date: date.toISOString().split("T")[0],
      Tbg: baseValue + Math.floor(Math.random() * 20000),
      Injection: baseValue * 5 + Math.floor(Math.random() * 20000),
      Oil: baseValue * 1.2 + Math.floor(Math.random() * 3000),
      Gas: Math.floor(Math.random() * 3000),
      ProducedWater: baseValue * 0.8 + Math.floor(Math.random() * 3000) - 1500,
      Csg: Math.floor(Math.random() * 3000),
    });
  }
  return data;
};

const sampleData = generateSampleData();

const AnimatedComposedChart = animated(ComposedChart);

const Charts = () => {
  const [chartTypes, setChartTypes] = useState({
    OilAndWater: "line",
    Gas: "line",
    stacked: false,
  });

  const toggleChartType = (field) => {
    setChartTypes((prev) => ({
      ...prev,
      [field]: prev[field] === "line" ? "bar" : "line",
    }));
  };

  const toggleStacked = () => {
    setChartTypes((prev) => ({
      ...prev,
      stacked: !prev.stacked,
    }));
  };

  const leftYAxisRange = useMemo(() => {
    const values = sampleData.flatMap((d) => [
      d.Oil,
      d.ProducedWater,
      d.Injection,
    ]);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    return [
      Math.floor(minValue / 50000) * 50000,
      Math.ceil(maxValue / 50000) * 50000,
    ];
  }, []);

  const rightYAxisRange = useMemo(() => {
    const values = sampleData.map((d) => d.Gas);
    const maxValue = Math.max(...values);
    return [0, Math.ceil(maxValue / 1000) * 1000];
  }, []);

  const props = useSpring({ opacity: 1 });

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-200 to-indigo-200 p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8 text-indigo-900">
        Production Data Chart
      </h1>
      <div className="flex mb-4">
        <button
          className="bg-indigo-500 text-white py-2 px-4 rounded mr-2 hover:bg-indigo-700 transition duration-300"
          onClick={() => toggleChartType("OilAndWater")}
        >
          Toggle Oil &amp; Water
        </button>
        <button
          className="bg-indigo-500 text-white py-2 px-4 rounded mr-2 hover:bg-indigo-700 transition duration-300"
          onClick={() => toggleChartType("Gas")}
        >
          Toggle Gas
        </button>
        <button
          className="bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-700 transition duration-300"
          onClick={toggleStacked}
        >
          {chartTypes.stacked ? "Unstacked" : "Stacked"}
        </button>
      </div>
      <div className="w-full max-w-6xl bg-white shadow-2xl rounded-lg p-8">
        <ResponsiveContainer width="100%" height={600}>
          <AnimatedComposedChart
            style={props}
            data={sampleData}
            stackOffset="sign"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis dataKey="date" tick={{ fill: "#666", fontSize: 12 }} />
            <YAxis
              yAxisId="left"
              tick={{ fill: "#666", fontSize: 12 }}
              label={{
                value: "BBLs",
                angle: -90,
                position: "insideLeft",
                fill: "#666",
              }}
              domain={leftYAxisRange}
              ticks={Array.from(
                {
                  length: (leftYAxisRange[1] - leftYAxisRange[0]) / 50000 + 1,
                },
                (_, i) => leftYAxisRange[0] + i * 50000
              )}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "#666", fontSize: 12 }}
              label={{
                value: "Gas",
                angle: -90,
                position: "insideRight",
                fill: "#666",
              }}
              domain={rightYAxisRange}
              ticks={Array.from(
                { length: rightYAxisRange[1] / 1000 + 1 },
                (_, i) => i * 1000
              )}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />
            <Legend wrapperStyle={{ cursor: "pointer" }} />
            {chartTypes.OilAndWater === "line" ? (
              <>
                <Line
                  type="monotone"
                  dataKey="Oil"
                  stroke="hsl(0, 70%, 50%)"
                  yAxisId="left"
                  dot={{ r: 2 }}
                  activeDot={{ r: 5, stroke: "#333", strokeWidth: 2 }}
                  animationDuration={500}
                  animationEasing="ease-in-out"
                />
                <Line
                  type="monotone"
                  dataKey="ProducedWater"
                  stroke="hsl(60, 70%, 50%)"
                  yAxisId="left"
                  dot={{ r: 2 }}
                  activeDot={{ r: 5, stroke: "#333", strokeWidth: 2 }}
                  animationDuration={500}
                  animationEasing="ease-in-out"
                />
              </>
            ) : (
              <>
                <Bar
                  dataKey="Oil"
                  fill="hsl(0, 70%, 50%)"
                  yAxisId="left"
                  animationDuration={500}
                  animationEasing="ease-in-out"
                  stackId={chartTypes.stacked ? "a" : undefined}
                />
                <Bar
                  dataKey="ProducedWater"
                  fill="hsl(60, 70%, 50%)"
                  yAxisId="left"
                  animationDuration={500}
                  animationEasing="ease-in-out"
                  stackId={chartTypes.stacked ? "a" : undefined}
                />
              </>
            )}
            {chartTypes.Gas === "line" ? (
              <Line
                type="monotone"
                dataKey="Gas"
                stroke="hsl(120, 70%, 50%)"
                yAxisId="right"
                dot={{ r: 2 }}
                activeDot={{ r: 5, stroke: "#333", strokeWidth: 2 }}
                animationDuration={500}
                animationEasing="ease-in-out"
              />
            ) : (
              <Bar
                dataKey="Gas"
                fill="hsl(120, 70%, 50%)"
                yAxisId="right"
                animationDuration={500}
                animationEasing="ease-in-out"
              />
            )}
            <Line
              type="monotone"
              dataKey="Injection"
              stroke="hsl(240, 70%, 50%)"
              yAxisId="left"
              dot={{ r: 2 }}
              activeDot={{ r: 5, stroke: "#333", strokeWidth: 2 }}
              animationDuration={500}
              animationEasing="ease-in-out"
            />
            <Line
              type="monotone"
              dataKey="Tbg"
              stroke="hsl(180, 70%, 50%)"
              yAxisId="left"
              dot={{ r: 2 }}
              activeDot={{ r: 5, stroke: "#333", strokeWidth: 2 }}
              animationDuration={500}
              animationEasing="ease-in-out"
            />
            <Line
              type="monotone"
              dataKey="Csg"
              stroke="hsl(300, 70%, 50%)"
              yAxisId="left"
              dot={{ r: 2 }}
              activeDot={{ r: 5, stroke: "#333", strokeWidth: 2 }}
              animationDuration={500}
              animationEasing="ease-in-out"
            />
          </AnimatedComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;
