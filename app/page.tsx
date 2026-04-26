"use client";

import { useState } from "react";

export default function Home() {
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);

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

    setLeads(data.leads || []);
    setLoading(false);
  };

  const handleCheckout = async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        industry,
        country,
      }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    }
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Get B2B Leads in Seconds</h1>

      <input
        value={industry}
        onChange={(e) => setIndustry(e.target.value)}
        placeholder="coffee"
      />

      <br />

      <input
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        placeholder="Vietnam"
      />

      <br />

      <button onClick={handleGenerate}>
        {loading ? "Loading..." : "Generate Free Preview"}
      </button>

      {leads.length > 0 && (
        <>
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

          <button
            onClick={handleCheckout}
            style={{
              marginTop: 20,
              padding: 10,
              background: "black",
              color: "white",
            }}
          >
            Get Full Leads ($10)
          </button>
        </>
      )}
    </main>
  );
}