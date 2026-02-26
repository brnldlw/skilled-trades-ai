"use client";
import { useState } from "react";

export default function HVACUnitsPage() {
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [propertyType, setPropertyType] = useState("Residential");
  const [symptom, setSymptom] = useState("");
  const [result, setResult] = useState("");

  const handleDiagnose = async () => {
    // Minimal test API call
    setResult(`Received: ${manufacturer}, ${model}, ${propertyType}, ${symptom}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">HVAC Units Test</h1>
      <label>Property Type:</label>
      <select value={propertyType} onChange={e => setPropertyType(e.target.value)}>
        <option>Residential</option>
        <option>Commercial</option>
      </select>
      <label>Manufacturer:</label>
      <input value={manufacturer} onChange={e => setManufacturer(e.target.value)} />
      <label>Model:</label>
      <input value={model} onChange={e => setModel(e.target.value)} />
      <label>Symptom:</label>
      <textarea value={symptom} onChange={e => setSymptom(e.target.value)} />
      <button onClick={handleDiagnose} className="mt-4 bg-blue-500 text-white p-2 rounded">
        Diagnose
      </button>
      <pre className="mt-4 bg-gray-100 p-2">{result}</pre>
    </div>
  );
}