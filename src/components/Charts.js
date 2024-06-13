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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useSpring, animated } from "react-spring";
import { useTheme } from "./ThemeContext";
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
  const { theme, toggleTheme } = useTheme();

  const [hiddenKeys, setHiddenKeys] = useState({});
  const [chartTypes, setChartTypes] = useState({
    OilAndWater: "line",
    Gas: "line",
    stacked: false,
  });

  const toggleVisibility = (dataKey) => {
    setHiddenKeys((prev) => ({
      ...prev,
      [dataKey]: !prev[dataKey],
    }));
  };

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

  const colors = {
    Oil: theme === "light" ? "#FF7F0E" : "#FFBB78",
    ProducedWater: theme === "light" ? "#2CA02C" : "#98DF8A",
    Injection: theme === "light" ? "#1F77B4" : "#AEC7E8",
    Tbg: theme === "light" ? "#D62728" : "#FF9896",
    Csg: theme === "light" ? "#9467BD" : "#C5B0D5",
    Gas: theme === "light" ? "#8C564B" : "#C49C94",
  };

  const containerStyles = {
    backgroundColor: theme === "light" ? "#FFFFFF" : "#1E1E1E",
    color: theme === "light" ? "#000000" : "#FFFFFF",
  };

  return (
    <div
      className="min-h-screen p-8 flex flex-col items-center"
      style={containerStyles}
    >
      <h1
        className="text-4xl font-bold mb-8"
        style={{ color: containerStyles.color }}
      >
        Production Data Dashboard
      </h1>
      <div className="flex flex-wrap justify-center mb-8">
        <button
          className="py-2 px-4 rounded m-2 transition duration-300"
          style={{
            backgroundColor: colors.Oil,
            color: containerStyles.backgroundColor,
          }}
          onClick={() => toggleChartType("OilAndWater")}
        >
          Toggle Oil & Water
        </button>
        <button
          className="py-2 px-4 rounded m-2 transition duration-300"
          style={{
            backgroundColor: colors.Gas,
            color: containerStyles.backgroundColor,
          }}
          onClick={() => toggleChartType("Gas")}
        >
          Toggle Gas
        </button>
        <button
          className="py-2 px-4 rounded m-2 transition duration-300"
          style={{
            backgroundColor: theme === "light" ? "#333333" : "#CCCCCC",
            color: containerStyles.backgroundColor,
          }}
          onClick={toggleStacked}
        >
          {chartTypes.stacked ? "Unstacked" : "Stacked"}
        </button>
      </div>
      <div
        className="w-full max-w-6xl shadow-2xl rounded-lg p-8 mb-8"
        style={{ backgroundColor: theme === "light" ? "#F0F0F0" : "#2E2E2E" }}
      >
        <ResponsiveContainer width="100%" height={600}>
          <AnimatedComposedChart
            style={props}
            data={sampleData}
            stackOffset="sign"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme === "light" ? "#CCCCCC" : "#444444"}
            />
            <XAxis
              dataKey="date"
              tick={{
                fill: theme === "light" ? "#666666" : "#BBBBBB",
                fontSize: 12,
              }}
            />
            <YAxis
              yAxisId="left"
              tick={{
                fill: theme === "light" ? "#666666" : "#BBBBBB",
                fontSize: 12,
              }}
              label={{
                value: "BBLs",
                angle: -90,
                position: "insideLeft",
                fill: theme === "light" ? "#666666" : "#BBBBBB",
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
              tick={{
                fill: theme === "light" ? "#666666" : "#BBBBBB",
                fontSize: 12,
              }}
              label={{
                value: "Gas",
                angle: -90,
                position: "insideRight",
                fill: theme === "light" ? "#666666" : "#BBBBBB",
              }}
              domain={rightYAxisRange}
              ticks={Array.from(
                { length: rightYAxisRange[1] / 1000 + 1 },
                (_, i) => i * 1000
              )}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === "light" ? "#FFFFFF" : "#333333",
                borderRadius: "8px",
                border: `1px solid ${
                  theme === "light" ? "#CCCCCC" : "#444444"
                }`,
              }}
            />
            <Legend
              wrapperStyle={{ cursor: "pointer", color: containerStyles.color }}
              onClick={(e) => toggleVisibility(e.dataKey)}
              formatter={(value) => (
                <span
                  style={{
                    textDecoration: hiddenKeys[value] ? "line-through" : "none",
                    color: hiddenKeys[value]
                      ? theme === "light"
                        ? "#CCCCCC"
                        : "#666666"
                      : containerStyles.color,
                  }}
                >
                  {value}
                </span>
              )}
            />
            {!hiddenKeys.Oil && (
              <Line
                type="monotone"
                dataKey="Oil"
                stroke={colors.Oil}
                yAxisId="left"
                dot={{ r: 2 }}
                activeDot={{
                  r: 5,
                  stroke: containerStyles.color,
                  strokeWidth: 2,
                }}
                animationDuration={500}
                animationEasing="ease-in-out"
              />
            )}
            {!hiddenKeys.ProducedWater && (
              <Line
                type="monotone"
                dataKey="ProducedWater"
                stroke={colors.ProducedWater}
                yAxisId="left"
                dot={{ r: 2 }}
                activeDot={{
                  r: 5,
                  stroke: containerStyles.color,
                  strokeWidth: 2,
                }}
                animationDuration={500}
                animationEasing="ease-in-out"
              />
            )}
            {!hiddenKeys.Gas && (
              <Line
                type="monotone"
                dataKey="Gas"
                stroke={colors.Gas}
                yAxisId="right"
                dot={{ r: 2 }}
                activeDot={{
                  r: 5,
                  stroke: containerStyles.color,
                  strokeWidth: 2,
                }}
                animationDuration={500}
                animationEasing="ease-in-out"
              />
            )}
            {!hiddenKeys.Injection && (
              <Line
                type="monotone"
                dataKey="Injection"
                stroke={colors.Injection}
                yAxisId="left"
                dot={{ r: 2 }}
                activeDot={{
                  r: 5,
                  stroke: containerStyles.color,
                  strokeWidth: 2,
                }}
                animationDuration={500}
                animationEasing="ease-in-out"
              />
            )}
            {!hiddenKeys.Tbg && (
              <Line
                type="monotone"
                dataKey="Tbg"
                stroke={colors.Tbg}
                yAxisId="left"
                dot={{ r: 2 }}
                activeDot={{
                  r: 5,
                  stroke: containerStyles.color,
                  strokeWidth: 2,
                }}
                animationDuration={500}
                animationEasing="ease-in-out"
              />
            )}
            {!hiddenKeys.Csg && (
              <Line
                type="monotone"
                dataKey="Csg"
                stroke={colors.Csg}
                yAxisId="left"
                dot={{ r: 2 }}
                activeDot={{
                  r: 5,
                  stroke: containerStyles.color,
                  strokeWidth: 2,
                }}
                animationDuration={500}
                animationEasing="ease-in-out"
              />
            )}
            {chartTypes.OilAndWater === "bar" && !hiddenKeys.Oil && (
              <Bar
                dataKey="Oil"
                fill={colors.Oil}
                yAxisId="left"
                animationDuration={500}
                animationEasing="ease-in-out"
                stackId={chartTypes.stacked ? "a" : undefined}
              />
            )}
            {chartTypes.OilAndWater === "bar" && !hiddenKeys.ProducedWater && (
              <Bar
                dataKey="ProducedWater"
                fill={colors.ProducedWater}
                yAxisId="left"
                animationDuration={500}
                animationEasing="ease-in-out"
                stackId={chartTypes.stacked ? "a" : undefined}
              />
            )}
            {chartTypes.Gas === "bar" && !hiddenKeys.Gas && (
              <Bar
                dataKey="Gas"
                fill={colors.Gas}
                yAxisId="right"
                animationDuration={500}
                animationEasing="ease-in-out"
              />
            )}
          </AnimatedComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="w-full max-w-6xl shadow-2xl rounded-lg p-8">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: containerStyles.color }}
        >
          Distribution of Gas over Time
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={sampleData}
              dataKey="Gas"
              nameKey="date"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill={colors.Gas}
              label={(entry) => entry.date}
            >
              {sampleData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors.Gas} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;
