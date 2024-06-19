import React, { useEffect, useRef, useState } from "react";
import { AgChart } from "ag-charts-community";
import "ag-charts-enterprise";
import { useTheme } from "./ThemeContext";
import { SketchPicker } from "react-color";
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
      Gas: Math.floor(Math.random() * 3000 - 1500),
      ProducedWater: baseValue * 0.8 + Math.floor(Math.random() * 3000) - 1500,
      Csg: Math.floor(Math.random() * 3000 - 1500),
    });
  }
  return data;
};

const sampleData = generateSampleData();

const AgChartComponent = () => {
  const chartRef = useRef(null);
  const { theme } = useTheme();
  const [toggle, setToggle] = useState({
    Oil: "line",
    ProducedWater: "line",
    Gas: "line",
  });
  const [colors, setColors] = useState({
    Oil: "#FF7F0E",
    ProducedWater: "#2CA02C",
    Injection: "#1F77B4",
    Tbg: "#D62728",
    Csg: "#9467BD",
    Gas: "#8C564B",
  });
  const [colorPicker, setColorPicker] = useState({
    visible: false,
    field: null,
    position: { x: 0, y: 0 },
  });

  const handleToggle = (field) => {
    setToggle((prevToggle) => ({
      ...prevToggle,
      [field]: prevToggle[field] === "line" ? "bar" : "line",
    }));
  };

  const handleColorChange = (color) => {
    setColors((prevColors) => ({
      ...prevColors,
      [colorPicker.field]: color.hex,
    }));
  };

  const handleLegendItemClick = (event) => {
    const { itemId, x, y } = event;
    setColorPicker({
      visible: !colorPicker.visible,
      field: itemId,
      position: { x, y },
    });
  };

  useEffect(() => {
    const chartOptions = {
      container: chartRef.current,
      autoSize: true,
      data: sampleData,
      title: {
        text: "Production Data Dashboard",
        fontSize: 24,
      },
      subtitle: {
        text: "Generated Data from 2024-01-01",
      },
      series: [
        {
          type: toggle.Oil,
          xKey: "date",
          yKey: "Oil",
          yName: "Oil",
          stroke: colors.Oil,
          fill: colors.Oil,
          id: "Oil",
        },
        {
          type: toggle.ProducedWater,
          xKey: "date",
          yKey: "ProducedWater",
          yName: "Produced Water",
          stroke: colors.ProducedWater,
          fill: colors.ProducedWater,
          id: "ProducedWater",
        },
        {
          type: toggle.Gas,
          xKey: "date",
          yKey: "Gas",
          yName: "Gas",
          stroke: colors.Gas,
          fill: colors.Gas,
          id: "Gas",
        },
        {
          type: "line",
          xKey: "date",
          yKey: "Injection",
          yName: "Injection",
          stroke: colors.Injection,
          id: "Injection",
        },
        {
          type: "line",
          xKey: "date",
          yKey: "Tbg",
          yName: "Tbg",
          stroke: colors.Tbg,
          id: "Tbg",
        },
        {
          type: "line",
          xKey: "date",
          yKey: "Csg",
          yName: "Csg",
          stroke: colors.Csg,
          id: "Csg",
        },
      ],
      axes: [
        {
          type: "category",
          position: "bottom",
        },
        {
          type: "number",
          position: "left",
          keys: ["Oil", "ProducedWater", "Injection"],
          label: {
            formatter: (params) => params.value.toLocaleString(),
          },
          title: {
            text: "BBLs",
            fontWeight: "bold",
          },
          gridStyle: [
            {
              stroke: "#CCCCCC",
              lineDash: [4, 2],
            },
          ],
        },
        {
          type: "number",
          position: "right",
          keys: ["Gas", "Tbg", "Csg"],
          label: {
            formatter: (params) => `${params.value} units`,
          },
          title: {
            text: "Units",
            fontWeight: "bold",
          },
          gridStyle: [
            {
              stroke: "#CCCCCC",
              lineDash: [4, 2],
            },
          ],
        },
      ],
      legend: {
        position: "bottom",
        listeners: {
          legendItemClick: handleLegendItemClick,
        },
      },
      tooltip: {
        enabled: true,
        renderer: ({ datum, yKey, title }) => `
          <div style="padding: 4px;">
            <strong>${title}</strong><br/>
            ${yKey}: ${datum[yKey]}
          </div>`,
      },
      animation: {
        duration: 1000,
      },
    };

    const chart = AgChart.create(chartOptions);

    return () => {
      chart.destroy();
    };
  }, [theme, toggle, colors]);

  return (
    <div
      className="min-h-screen p-8 flex flex-col items-center"
      style={{
        backgroundColor: theme === "light" ? "#FFFFFF" : "#1E1E1E",
        color: theme === "light" ? "#000000" : "#FFFFFF",
      }}
    >
      <h1 className="text-4xl font-bold mb-8">Production Data Dashboard</h1>
      <div className="w-full max-w-6xl shadow-2xl rounded-lg p-8 mb-8">
        <div className="flex justify-end space-x-4 mb-4">
          {["Oil", "ProducedWater", "Gas"].map((field) => (
            <button
              key={field}
              className="px-4 py-2 border rounded bg-blue-500 text-white"
              onClick={() => handleToggle(field)}
            >
              Toggle {field}
            </button>
          ))}
        </div>
        {colorPicker.visible && (
          <div
            className="absolute z-10"
            style={{
              left: `${colorPicker.position.x}px`,
              top: `${colorPicker.position.y}px`,
            }}
          >
            <SketchPicker
              color={colors[colorPicker.field]}
              onChangeComplete={handleColorChange}
            />
          </div>
        )}
        <div ref={chartRef} className="w-full h-[600px]" />
      </div>
    </div>
  );
};

export default AgChartComponent;
