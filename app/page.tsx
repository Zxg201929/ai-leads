"use client";
import { useState } from "react";

export default function Home() {
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!industry || !country) {
      alert("Please enter industry and country");
      return;
    }

    setLoading(true);
    setLeads([]);

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ industry, country }),
    });

    const data = await res.json();
    setLeads(data.preview || []);
    setLoading(false);
  }

  async function handleCheckout() {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ industry, country, full: true }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Payment error");
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 40 }}>

      {/* 🔥 标题 */}
      <h1 style={{ fontSize: 36 }}>Get B2B Leads in Seconds</h1>

      <p style={{ fontSize: 18 }}>
        Find real companies and verified emails for your outreach.
      </p>

      {/* 🔥 价值点 */}
      <div>
        <p>✔ Find companies in your target market</p>
        <p>✔ Get real business emails</p>
        <p>✔ Ready for cold outreach</p>
      </div>

      {/* 🔥 输入 */}
      <div style={{ marginTop: 20 }}>
        <input
          placeholder="Industry (e.g. coffee)"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          style={{ padding: 10, width: 250 }}
        />

        <br /><br />

        <input
          placeholder="Country (e.g. Vietnam)"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          style={{ padding: 10, width: 250 }}
        />

        <br /><br />

        <button onClick={handleGenerate} style={{ padding: "10px 20px" }}>
          {loading ? "Generating..." : "Generate Free Preview"}
        </button>
      </div>

      {/* 🔥 提示 */}
      <p style={{ marginTop: 20, color: "gray" }}>
        Preview (Free): See 3 sample leads below
      </p>

      {/* 🔥 表格 */}
      {leads.length > 0 && (
        <table
          border={1}
          cellPadding={10}
          style={{ marginTop: 20, width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>Company</th>
              <th>Website</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {[
              ...leads.filter(l => l.Email !== "N/A"),
              ...leads.filter(l => l.Email === "N/A"),
            ]
              .slice(0, 3)
              .map((item, index) => (
                <tr key={index}>
                  <td>{item.Company}</td>
                  <td>
                    <a href={item.Website} target="_blank">
                      Visit
                    </a>
                  </td>
                  <td>
                    {item.Email !== "N/A"
                      ? item.Email.replace(/(.{3}).+(@.+)/, "$1***$2")
                      : "Unlock after purchase"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}

      {/* 🔥 转化区 */}
      {leads.length > 0 && (
        <div style={{ marginTop: 30 }}>

          <p>
            Manual research: 2–5 hours  
            <br />
            This tool: 10 seconds
          </p>

          <p style={{ color: "green" }}>
            🔥 Instant download. No subscription. One-time payment.
          </p>

          <p style={{ fontWeight: "bold" }}>
            If this looks good, get full list (100–120 leads) instantly for $10.
          </p>

          <p style={{ color: "green" }}>
            ✔ High-quality leads • Real company websites • Business emails included
          </p>

          <p>
            ✔ 100–120 targeted leads / Save 3–5 hours of manual research
          </p>

          <button
            onClick={handleCheckout}
            style={{
              marginTop: 10,
              background: "black",
              color: "white",
              padding: "12px 24px",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Get 100–120 Leads Instantly ($10)
          </button>

          <p style={{ fontSize: 12, marginTop: 10 }}>
            Typical freelancer cost: $20–$50  
            <br />
            Your price: $10
          </p>

        </div>
      )}

      {/* 🔥 信任区 */}
      <div style={{ marginTop: 40 }}>
        <p>✔ Real company websites</p>
        <p>✔ Emails from official sources</p>
        <p>✔ No spam or fake data</p>
      </div>

      {/* 🔥 使用案例 */}
      <div style={{ marginTop: 40 }}>
        <h3>💼 Example Use Case</h3>

        <p>
          A freelancer used this tool to find coffee companies in Brazil.
          He contacted 50 companies and got 3 replies within 2 days.
        </p>

        <p style={{ color: "green" }}>
          ✔ Leads → Outreach → Replies → Clients
        </p>
      </div>

      {/* 🔥 免责声明 */}
      <div style={{ marginTop: 50, fontSize: 12, color: "#666" }}>
        <p><b>Disclaimer:</b></p>
        <p>
          Data is collected from publicly available sources.<br />
          Email accuracy may vary.<br />
          This tool is intended for business research and outreach only.<br />
          Users are responsible for complying with local data regulations.
        </p>
      </div>

    </div>
  );
}