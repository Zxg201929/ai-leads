"use client";

import { useState } from "react";

export default function Home() {
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!industry || !country) {
      alert("Enter industry and country");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          industry,
          country,
          full: false,
        }),
      });

      const data = await res.json();

      console.log("DATA:", data);

      // 👉 强制设置（避免结构问题）
      setLeads(data.leads || []);

    } catch (e) {
      console.error(e);
      alert("Error generating leads");
    }

    setLoading(false);
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Get B2B Leads in Seconds</h1>

      <input
        value={industry}
        onChange={(e) => setIndustry(e.target.value)}
        placeholder="coffee"
        style={{ display: "block", marginBottom: 10 }}
      />

      <input
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        placeholder="Brazil"
        style={{ display: "block", marginBottom: 10 }}
      />

      <button onClick={handleGenerate}>
        {loading ? "Generating..." : "Generate Free Preview"}
      </button>

      {/* 👉 强制显示调试 */}
      <pre style={{ marginTop: 20 }}>
        {JSON.stringify(leads, null, 2)}
      </pre>

      {leads.length > 0 && (
        <table border={1} style={{ marginTop: 20 }}>
          <thead>
            <tr>
              <th>Company</th>
              <th>Website</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l, i) => (
              <tr key={i}>
                <td>{l.company}</td>
                <td>{l.website}</td>
                <td>{l.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}