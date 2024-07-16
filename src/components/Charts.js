import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { SketchPicker } from "react-color";
import "tailwindcss/tailwind.css";
import debounce from "lodash/debounce";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRedo,
  faCog,
  faPrint,
  faChartBar,
  faChartLine,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";

const ChartComponent = () => {
  const userID = "admin";
  const theme = "light"; // Default theme
  const chartRef = useRef(null);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartTypes, setChartTypes] = useState({
    Oil: "bar",
    ProducedWater: "bar",
    InjectedWater: "bar",
    Gas: "line",
    Tbg: "line",
    Csg: "line",
  });
  const [colors, setColors] = useState({
    Oil: "#FF7F0E",
    ProducedWater: "#2CA02C",
    InjectedWater: "#1F77B4",
    Tbg: "#D62728",
    Csg: "#9467BD",
    Gas: "#8C564B",
  });
  const [colorPicker, setColorPicker] = useState({
    visible: false,
    field: null,
  });
  const [logarithmic, setLogarithmic] = useState(false);
  const [stacked, setStacked] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [disabledSeries, setDisabledSeries] = useState([]);
  const [fromDate, setFromDate] = useState(
    moment().subtract(30, "days").format("YYYY-MM-DD")
  );
  const [thruDate, setThruDate] = useState(moment().format("YYYY-MM-DD"));
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedLeaseID, setSelectedLeaseID] = useState("~ALL~");
  const [leases, setLeases] = useState([]);
  const [tags, setTags] = useState(["All"]);

  const fetchPreferences = useCallback(async () => {
    try {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      const baseUrl =
        parts.length > 2
          ? `https://${parts.shift()}.ogfieldticket.com`
          : "https://test.ogfieldticket.com";

      const response = await fetch(
        `${baseUrl}/api/userdetails.php?id=${userID}&chartsPref=true`
      );
      const data = await response.json();

      if (data.success && data.ChartsPref) {
        const { chartTypes, colors, logarithmic, disabledSeries } =
          data.ChartsPref;
        setChartTypes(chartTypes || {});
        setColors(colors || {});
        setLogarithmic(logarithmic || false);
        setDisabledSeries(disabledSeries || []);
      }
    } catch (error) {
      console.error("Error fetching user preferences:", error);
    }
  }, [userID]);

  const fetchLeases = useCallback(async () => {
    try {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      const baseUrl =
        parts.length > 2
          ? `https://${parts.shift()}.ogfieldticket.com`
          : "https://test.ogfieldticket.com";

      const response = await fetch(`${baseUrl}/api/leases.php`);
      if (!response.ok) throw new Error("Network response was not ok");
      const leaseData = await response.json();
      setLeases(leaseData);
      const uniqueTags = [
        ...new Set(
          leaseData.flatMap((lease) =>
            [lease.Tag1, lease.Tag2, lease.Tag3, lease.Tag4].filter(Boolean)
          )
        ),
      ];
      setTags(["All", ...uniqueTags]);
    } catch (error) {
      console.error("Error fetching leases:", error);
    }
  }, []);

  const fetchChartData = useCallback(async () => {
    setIsLoading(true);
    try {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      const baseUrl =
        parts.length > 2
          ? `https://${parts.shift()}.ogpumper.com`
          : "https://test.ogpumper.com";

      const rpt = selectedLeaseID === "~ALL~" ? "C" : "P";
      const response = await fetch(
        `${baseUrl}/service_testprod.php?Rpt=${rpt}D&QD=30&LeaseID=${encodeURIComponent(
          selectedLeaseID
        )}&From=${fromDate}&Thru=${thruDate}&Tag=${selectedTag}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      const formattedData = result.map((item) => ({
        GaugeDate: item.GaugeDate,
        Oil: parseFloat(item.Produced) || 0,
        ProducedWater: parseFloat(item.ProducedWaterTotal) || 0,
        InjectedWater: parseFloat(item.InjectedWaterTotal) || 0,
        Gas: parseFloat(item.Gas) || 0,
        Tbg: parseFloat(item.tbg) || 0,
        Csg: parseFloat(item.csg) || 0,
      }));
      setData(formattedData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, thruDate, selectedLeaseID, selectedTag]);

  useEffect(() => {
    fetchPreferences();
    fetchLeases();
  }, [fetchPreferences, fetchLeases]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const debouncedSavePreferences = useCallback(
    debounce(async () => {
      try {
        const hostname = window.location.hostname;
        const parts = hostname.split(".");
        const baseUrl =
          parts.length > 2
            ? `https://${parts.shift()}.ogfieldticket.com`
            : "https://test.ogfieldticket.com";

        const response = await fetch(`${baseUrl}/api/userdetails.php`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            UserID: userID,
            ChartsPref: { chartTypes, colors, logarithmic, disabledSeries },
          }),
        });

        const data = await response.json();
        if (!data.success)
          console.error("Error saving user preferences:", data.message);
      } catch (error) {
        console.error("Error saving user preferences:", error);
      }
    }, 300),
    [userID, chartTypes, colors, logarithmic, disabledSeries]
  );

  useEffect(() => {
    debouncedSavePreferences();
  }, [
    chartTypes,
    colors,
    logarithmic,
    disabledSeries,
    debouncedSavePreferences,
  ]);

  const handleToggle = (field) => {
    setChartTypes((prev) => ({
      ...prev,
      [field]: prev[field] === "line" ? "bar" : "line",
    }));
  };

  const handleColorChange = (color) => {
    setColors((prev) => ({ ...prev, [colorPicker.field]: color.hex }));
    setColorPicker({ visible: false, field: null });
  };

  const handleLegendClick = ({ dataKey }) => {
    setDisabledSeries((prev) =>
      prev.includes(dataKey)
        ? prev.filter((item) => item !== dataKey)
        : [...prev, dataKey]
    );
  };

  const resetLegend = () => setDisabledSeries([]);

  const renderLegendText = (value, entry) => {
    const { color } = entry;
    return (
      <span style={{ color: disabledSeries.includes(value) ? "#ccc" : color }}>
        {value} ({entry.payload.yAxisId === "left" ? "BBLS" : "MCF"})
      </span>
    );
  };

  const handlePrint = () => {
    const printContents = chartRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
    const leaseName =
      leases.find((lease) => lease.LeaseID === selectedLeaseID)?.LeaseName ||
      "All Leases";
    const style = `
      <style>
        @media print {
          @page {
            size: landscape;
            margin: 0.5cm;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
          }
          #printContainer {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          #headerInfo {
            margin-bottom: 10px;
            font-size: 12px;
          }
          #headerInfo h1 {
            font-size: 18px;
            margin: 0 0 10px 0;
          }
          #headerInfo p {
            margin: 2px 0;
          }
          #chartContainer {
            flex-grow: 1;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          #chartContainer > div {
            width: 100% !important;
            height: 100% !important;
          }
          .recharts-wrapper {
            width: 100% !important;
            height: 100% !important;
          }
          .reset-legend-button {
            display: none !important;
          }
          .recharts-legend-wrapper {
            bottom: 0 !important;
          }
        }
      </style>
    `;
    const headerInfo = `
      <div id="headerInfo">
        <p><strong>Date Range:</strong> ${fromDate} to ${thruDate}</p>
        <p><strong>Lease:</strong> ${leaseName}</p>
        <p><strong>Tag:</strong> ${selectedTag}</p>
        <p><strong>Y-Axis Scale:</strong> ${
          logarithmic ? "Logarithmic" : "Linear"
        }</p>
      </div>
    `;
    document.body.innerHTML =
      style +
      `
      <div id="printContainer">
        ${headerInfo}
        <div id="chartContainer">${printContents}</div>
      </div>
    `;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };
  return (
    <div
      className={`min-h-screen p-8 flex flex-col items-center ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
      } relative transition-colors duration-500`}
    >
      {" "}
      <div className="w-full max-w-7xl mb-8 flex flex-wrap justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0 flex-wrap mr-4">
          <div className="flex items-center mr-4">
            <label className="mr-2 whitespace-nowrap">From:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className={`p-2 border rounded ${
                theme === "dark"
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-black border-gray-300"
              } w-32`}
            />
          </div>
          <div className="flex items-center">
            <label className="mr-2 whitespace-nowrap">To:</label>
            <input
              type="date"
              value={thruDate}
              onChange={(e) => setThruDate(e.target.value)}
              className={`p-2 border rounded ${
                theme === "dark"
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-black border-gray-300"
              } w-32`}
            />
          </div>
        </div>
        <div
          className={`flex-1 flex flex-wrap justify-end items-center transition-all duration-300 ${
            isSidePanelOpen ? "transform -translate-x-64" : ""
          }`}
        >
          <div className="flex items-center mb-4 md:mb-0 flex-wrap mr-4">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className={`p-2 border rounded ${
                theme === "dark"
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-black border-gray-300"
              } mr-2 w-32`}
            >
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
            <select
              value={selectedLeaseID}
              onChange={(e) => setSelectedLeaseID(e.target.value)}
              className={`p-2 border rounded ${
                theme === "dark"
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-black border-gray-300"
              } w-40`}
            >
              <option value="~ALL~">All Leases</option>
              {leases.map((lease) => (
                <option key={lease.LeaseID} value={lease.LeaseID}>
                  {lease.LeaseName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center flex-wrap">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
              onClick={fetchChartData}
            >
              Update Chart
            </button>
            <button
              className="px-4 py-2 bg-green-500 text-white rounded mr-2"
              onClick={handlePrint}
            >
              <FontAwesomeIcon icon={faPrint} className="mr-2" /> Print
            </button>
            <button
              className={`px-4 py-2 bg-blue-500 text-white rounded relative ${
                isSidePanelOpen ? "z-50" : ""
              }`}
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            >
              <FontAwesomeIcon
                icon={isSidePanelOpen ? faTimes : faCog}
                className="mr-2"
              />
              {isSidePanelOpen ? "Close" : "Settings"}
            </button>
          </div>
        </div>
      </div>
      {/* Rest of the component remains unchanged */}
      <div
        className={`fixed right-0 top-0 h-full shadow-lg transition-transform transform ${
          isSidePanelOpen ? "translate-x-0" : "translate-x-full"
        } w-64 p-6 z-40 overflow-y-auto ${
          theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"
        }`}
      >
        <h2 className="text-2xl font-bold mb-4">Settings</h2>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Chart Type</h3>
          {Object.entries(chartTypes).map(([field, type]) => (
            <div key={field} className="flex items-center mb-2">
              <span className="mr-2">{field}</span>
              <button
                className="px-2 py-1 bg-blue-500 text-white rounded"
                onClick={() => handleToggle(field)}
              >
                {type === "line" ? (
                  <FontAwesomeIcon icon={faChartBar} />
                ) : (
                  <FontAwesomeIcon icon={faChartLine} />
                )}
              </button>
            </div>
          ))}
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Colors</h3>
          {Object.entries(colors).map(([field, color]) => (
            <div key={field} className="flex items-center mb-2">
              <span className="mr-2">{field}</span>
              <div
                className="w-8 h-8 mr-2 cursor-pointer"
                style={{ backgroundColor: color }}
                onClick={() => setColorPicker({ visible: true, field })}
              />
            </div>
          ))}
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Y-Axis Scale</h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              className={`mr-2 ${
                theme === "dark"
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-black border-gray-300"
              }`}
              checked={logarithmic}
              onChange={() => setLogarithmic(!logarithmic)}
            />
            Logarithmic
          </label>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Stacked Options</h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              className={`mr-2 ${
                theme === "dark"
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-black border-gray-300"
              }`}
              checked={stacked}
              onChange={() => setStacked(!stacked)}
            />
            Stacked Gas and Tbg
          </label>
        </div>
      </div>
      {colorPicker.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <SketchPicker
              color={colors[colorPicker.field]}
              onChangeComplete={handleColorChange}
            />
            <button
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
              onClick={() => setColorPicker({ visible: false, field: null })}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div
        ref={chartRef}
        className={`w-full max-w-full shadow-2xl rounded-lg p-8 mb-8 ${
          theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"
        } transition-colors duration-500`}
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={700}>
            <ComposedChart
              data={data}
              className={theme === "dark" ? "text-white" : "text-black"}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme === "dark" ? "#444" : "#ccc"}
              />
              <XAxis
                dataKey="GaugeDate"
                stroke={theme === "dark" ? "#fff" : "#000"}
              />
              <YAxis
                yAxisId="left"
                scale={logarithmic ? "log" : "linear"}
                domain={logarithmic ? [0.1, 1000000] : [0, "auto"]}
                allowDataOverflow={true}
                label={{
                  value: "BBLS",
                  angle: -90,
                  position: "insideLeft",
                  fill: theme === "dark" ? "#fff" : "#000",
                }}
                tickFormatter={(value) => (value === 1000000 ? "1M" : value)}
                stroke={theme === "dark" ? "#fff" : "#000"}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                scale={logarithmic ? "log" : "linear"}
                domain={[0.1, "auto"]}
                allowDataOverflow={true}
                label={{
                  value: "MCF",
                  angle: -90,
                  position: "insideRight",
                  fill: theme === "dark" ? "#fff" : "#000",
                }}
                stroke={theme === "dark" ? "#fff" : "#000"}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === "dark" ? "#333" : "#fff",
                  borderColor: theme === "dark" ? "#444" : "#ccc",
                  color: theme === "dark" ? "#fff" : "#000",
                }}
              />
              <Legend
                onClick={handleLegendClick}
                formatter={renderLegendText}
                wrapperStyle={{ color: theme === "dark" ? "#fff" : "#000" }}
              />
              {!disabledSeries.includes("Oil") &&
                (chartTypes.Oil === "bar" ? (
                  <Bar yAxisId="left" dataKey="Oil" fill={colors.Oil} />
                ) : (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="Oil"
                    stroke={colors.Oil}
                    dot={false}
                  />
                ))}
              {!disabledSeries.includes("ProducedWater") &&
                (chartTypes.ProducedWater === "bar" ? (
                  <Bar
                    yAxisId="left"
                    dataKey="ProducedWater"
                    fill={colors.ProducedWater}
                  />
                ) : (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="ProducedWater"
                    stroke={colors.ProducedWater}
                    dot={false}
                  />
                ))}
              {!disabledSeries.includes("InjectedWater") &&
                (chartTypes.InjectedWater === "bar" ? (
                  <Bar
                    yAxisId="left"
                    dataKey="InjectedWater"
                    fill={colors.InjectedWater}
                  />
                ) : (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="InjectedWater"
                    stroke={colors.InjectedWater}
                    dot={false}
                  />
                ))}
              {!disabledSeries.includes("Csg") &&
                (chartTypes.Csg === "bar" ? (
                  <Bar yAxisId="right" dataKey="Csg" fill={colors.Csg} />
                ) : (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="Csg"
                    stroke={colors.Csg}
                    dot={false}
                  />
                ))}
              {!disabledSeries.includes("Gas") &&
                (stacked ? (
                  <Bar
                    yAxisId="right"
                    dataKey="Gas"
                    stackId="a"
                    fill={colors.Gas}
                  />
                ) : chartTypes.Gas === "bar" ? (
                  <Bar yAxisId="right" dataKey="Gas" fill={colors.Gas} />
                ) : (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="Gas"
                    stroke={colors.Gas}
                    dot={false}
                  />
                ))}
              {!disabledSeries.includes("Tbg") &&
                (stacked ? (
                  <Bar
                    yAxisId="right"
                    dataKey="Tbg"
                    stackId="a"
                    fill={colors.Tbg}
                  />
                ) : chartTypes.Tbg === "bar" ? (
                  <Bar yAxisId="right" dataKey="Tbg" fill={colors.Tbg} />
                ) : (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="Tbg"
                    stroke={colors.Tbg}
                    dot={false}
                  />
                ))}
            </ComposedChart>
          </ResponsiveContainer>
        )}

        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded flex items-center reset-legend-button"
          onClick={resetLegend}
        >
          <FontAwesomeIcon icon={faRedo} className="mr-2" /> Reset Legend
        </button>
      </div>
    </div>
  );
};

export default ChartComponent;
