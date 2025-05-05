/**********************************************************************
 *  CrudeCalculator.jsx
 *  -------------------------------------------------------------------
 *  • Live‑updating crude‑oil calculator (API MPMS formulas)
 *  • Field‑ticket aesthetic with TailwindCSS + dark / light support
 *  • Inputs left  |  Results right  (responsive)
 *  • Keeps EVERY calculation line from the original snippet
 *********************************************************************/

import React, { useState } from "react";
import { useTheme } from "ogcommon";

function CrudeCalculator() {
  /* --------------------------- theme --------------------------- */
  const { theme } = useTheme();
  const card =
    theme === "dark" ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900";
  const border = theme === "dark" ? "border-gray-600" : "border-gray-200";
  const input =
    theme === "dark"
      ? "bg-gray-700 border-gray-600 placeholder-gray-400 text-gray-100"
      : "bg-white border-gray-300 placeholder-gray-500";
  const readOnly =
    theme === "dark"
      ? "bg-gray-700 border-gray-600 text-blue-300"
      : "bg-gray-100 border-gray-300 text-blue-700";

  /* ---------------------- input state vars --------------------- */
  const [uom, setUom] = useState("Barrel");
  const [obsGravity, setObsGravity] = useState(""); // Observed API gravity
  const [obsTemp, setObsTemp] = useState(""); // Observed temperature (°F)
  const [bsw, setBsw] = useState("0"); // BS&W (%) default 0
  const [gov, setGov] = useState(""); // Gross Observed Volume
  const [openTemp, setOpenTemp] = useState(""); // Open (high) temp
  const [closeTemp, setCloseTemp] = useState(""); // Close (low) temp

  /* -------- effective observed temperature (average) ----------- */
  let effectiveObsTemp = null;
  const openVal = parseFloat(openTemp);
  const closeVal = parseFloat(closeTemp);
  if (!isNaN(openVal) && !isNaN(closeVal)) {
    effectiveObsTemp = (openVal + closeVal) / 2.0;
  } else if (obsTemp !== "") {
    effectiveObsTemp = parseFloat(obsTemp);
  }

  /* ------------------------- numbers --------------------------- */
  const gravityVal = parseFloat(obsGravity);
  const bswPercent = parseFloat(bsw); // e.g. 0.1 for 0.1 %
  const govVal = parseFloat(gov);

  /* --------------------- output variables ---------------------- */
  let api60 = "";
  let vcf = "";
  let gsv = "";
  let cswFactor = "";
  let nsv = "";

  /* ------------------------ calculation ------------------------ */
  if (
    !isNaN(gravityVal) &&
    !isNaN(govVal) &&
    !isNaN(bswPercent) &&
    effectiveObsTemp !== null &&
    !isNaN(effectiveObsTemp)
  ) {
    /* 1. Round inputs to nearest tenth (if needed) */
    const API_obs = Math.round(gravityVal * 10) / 10;
    const T_obs = Math.round(effectiveObsTemp * 10) / 10;

    /* 2. Temperature difference from 60 °F */
    const deltaT = T_obs - 60.0;

    /* 3. Convert observed API to density (kg/m³) using water density */
    const densityWater = 999.016; // kg/m³ at 60°F
    const density_obs = (141.5 * densityWater) / (API_obs + 131.5);

    /* 4‑6. Iterate to find density60 and α until convergence */
    let density60 = density_obs; // initial guess
    let alpha;
    for (let iter = 0; iter < 20; iter++) {
      /* Thermal expansion coefficient α  (K₀ = 341.0957, K₁ = 0) */
      alpha = 341.0957 / density60 ** 2 + 0.0 / density60;
      /* 5. Volume Correction Factor for this iteration */
      const vcf_iter = Math.exp(-alpha * deltaT * (1 + 0.8 * alpha * deltaT));
      /* 6. Update density60 */
      const newDensity60 = density_obs / vcf_iter;
      if (Math.abs(newDensity60 - density60) < 0.05) {
        density60 = newDensity60;
        break;
      }
      density60 = newDensity60;
    }

    /* 7. Final outputs */
    const API60 = (141.5 * densityWater) / density60 - 131.5;
    const VCF = Math.exp(-alpha * deltaT * (1 + 0.8 * alpha * deltaT));
    const CSW = (100.0 - bswPercent) / 100.0;
    const GSV = govVal * VCF;
    const NSV_val = GSV * CSW;

    /* 8. Format */
    api60 = API60.toFixed(1);
    vcf = VCF.toFixed(5);
    gsv = GSV.toFixed(2);
    cswFactor = CSW.toFixed(5);
    nsv = NSV_val.toFixed(2);
  }

  /* --------------------------- JSX ----------------------------- */
  return (
    <div className={`max-w-5xl mx-auto p-6 shadow-lg rounded-lg ${card}`}>
      <h2 className="text-2xl font-semibold mb-6">Crude Calculator</h2>

      <div className="grid md:grid-cols-2 gap-10">
        {/* -------------------- INPUT PANEL -------------------- */}
        <div>
          {/* UOM */}
          <div className="mb-5">
            <label className="block font-medium mb-1">UOM</label>
            <select
              value={uom}
              onChange={(e) => setUom(e.target.value)}
              className={`w-full border rounded-md px-3 py-2 ${input}`}
            >
              <option>Barrel</option>
              <option>Gallon</option>
              <option>Liter</option>
            </select>
          </div>

          {/* Observed Gravity */}
          <div className="mb-5">
            <label className="block font-medium mb-1">
              Observed Gravity (API)
            </label>
            <input
              id="obsGravity"
              type="number"
              step="0.1"
              value={obsGravity}
              onChange={(e) => setObsGravity(e.target.value)}
              className={`w-full border rounded-md px-3 py-2 ${input}`}
              placeholder="e.g. 40.8"
            />
          </div>

          {/* Observed Temperature */}
          <div className="mb-5">
            <label className="block font-medium mb-1">
              Observed Temperature (°F)
            </label>
            <input
              id="obsTemp"
              type="number"
              step="0.1"
              value={obsTemp}
              onChange={(e) => setObsTemp(e.target.value)}
              className={`w-full border rounded-md px-3 py-2 ${input}`}
              placeholder="e.g. 78.0"
              disabled={!isNaN(openVal) && !isNaN(closeVal)}
            />
          </div>

          {/* BS&W */}
          <div className="mb-5">
            <label className="block font-medium mb-1">
              Observed BS&amp;W (%)
            </label>
            <input
              id="bsw"
              type="number"
              step="0.001"
              value={bsw}
              onChange={(e) => setBsw(e.target.value)}
              className={`w-full border rounded-md px-3 py-2 ${input}`}
              placeholder="e.g. 0.100"
            />
          </div>

          {/* GOV */}
          <div className="mb-5">
            <label className="block font-medium mb-1">
              Gross Units (GOV) – {uom}
            </label>
            <input
              id="gov"
              type="number"
              step="0.01"
              value={gov}
              onChange={(e) => setGov(e.target.value)}
              className={`w-full border rounded-md px-3 py-2 ${input}`}
              placeholder="e.g. 185.60"
            />
          </div>

          {/* Open & Close Temps */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">
                Open Temperature (°F)
              </label>
              <input
                id="openTemp"
                type="number"
                step="0.1"
                value={openTemp}
                onChange={(e) => setOpenTemp(e.target.value)}
                className={`w-full border rounded-md px-3 py-2 ${input}`}
                placeholder="79.0"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                Close Temperature (°F)
              </label>
              <input
                id="closeTemp"
                type="number"
                step="0.1"
                value={closeTemp}
                onChange={(e) => setCloseTemp(e.target.value)}
                className={`w-full border rounded-md px-3 py-2 ${input}`}
                placeholder="78.0"
              />
            </div>
          </div>
        </div>

        {/* -------------------- RESULTS PANEL ------------------ */}
        <div
          className={`rounded-lg p-6 border ${border} flex flex-col justify-start`}
        >
          <h3 className="text-xl font-semibold mb-4">Results</h3>

          <Result label="Gravity @ 60°F (API₆₀)" value={api60} css={readOnly} />
          <Result
            label="Volume Correction Factor (VCF)"
            value={vcf}
            css={readOnly}
          />
          <Result
            label={`Gross Standard Volume (GSV) – ${uom}`}
            value={gsv}
            css={readOnly}
          />
          <Result
            label="Correction for Sediment & Water (CSW)"
            value={cswFactor}
            css={readOnly}
          />
          <Result
            label={`Net Standard Volume (NSV) – ${uom}`}
            value={nsv}
            css={readOnly}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- tiny helper to render read‑only output field ---------- */
const Result = ({ label, value, css }) => (
  <div className="mb-4">
    <label className="block font-medium mb-1">{label}</label>
    <input
      type="text"
      readOnly
      value={value}
      className={`w-full border rounded-md px-3 py-2 font-mono ${css}`}
    />
  </div>
);

export default CrudeCalculator;
