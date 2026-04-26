"use client";

import { useState } from "react";

export default function Home() {
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!industry || !country) {
      alert("Please enter industry and country");
      return;
    }

    setLoading(true);
    setLeads([]);

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

      console.log("API result:", data);

      if (data.leads) {
        setLeads(data.leads);
      } else {
        alert("No leads found");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate leads");
    }

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
    } else {
      alert("Checkout failed");
    }
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Get B2B Leads in Seconds</h1>
      <p>Find real companies and verified emails for your outreach.</p>

      <ul>
        <li>✓ Find companies in your target market</li>
        <li>✓ Get real business emails</li>
        <li>✓ Ready for cold outreach</li>
      </ul>

      <input
        placeholder="Industry (e.g. coffee)"
        value={industry}
        onChange={(e) => setIndustry(e.target.value)}
        style={{ display: "block", marginTop: 20, padding: 8, width: 300 }}
      />

      <input
        placeholder="Country (e.g. Brazil)"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        style={{ display: "block", marginTop: 10, padding: 8, width: 300 }}
      />

      <button
        onClick={handleGenerate}
        style={{ marginTop: 10, padding: "8px 16px" }}
      >
        {loading ? "Generating..." : "Generate Free Preview"}
      </button>

      <p style={{ marginTop: 20 }}>
        Preview (Free): See 3 sample leads below
      </p>

      {leads.length > 0 && (
        <table border={1} cellPadding={8} style={{ marginTop: 10 }}>
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
                <td>
                  <a href={l.website} target="_blank">
                    Visit
                  </a>
                </td>
                <td>{l.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {leads.length > 0 && (
        <>
          <p style={{ marginTop: 20 }}>
            Instant download. No subscription. One-time payment.
          </p>

          <p>
            If this looks good, get full list (100–120 leads) instantly for $10.
          </p>

          <button
            onClick={handleCheckout}
            style={{
              marginTop: 10,
              padding: "10px 20px",
              background: "black",
              color: "white",
            }}
          >
            Get 100–120 Leads Instantly ($10)
          </button>
        </>
      )}

      <div style={{ marginTop: 40, fontSize: 12, color: "gray" }}>
        <b>Disclaimer:</b>
        <p>Data is collected from publicly available sources.</p>
        <p>Email accuracy may vary.</p>
        <p>This tool is for business research and outreach only.</p>
      </div>
    </main>
  );
}