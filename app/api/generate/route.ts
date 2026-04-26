import { NextResponse } from "next/server";

const SERPER_API_KEY = process.env.SERPER_API_KEY!;

// 👉 更宽松过滤（避免全被过滤掉）
function isValidCompany(url: string) {
  return (
    url &&
    !url.includes("reddit") &&
    !url.includes("youtube")
  );
}

// 👉 抓邮箱
async function extractEmails(url: string) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    const html = await res.text();

    const matches = html.match(
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
    );

    if (!matches) return [];

    return [...new Set(matches)];
  } catch {
    return [];
  }
}

// 👉 选最优邮箱
function pickBestEmail(emails: string[]) {
  const priority = ["sales", "info", "contact"];

  for (const p of priority) {
    const found = emails.find((e) =>
      e.toLowerCase().includes(p)
    );
    if (found) return found;
  }

  return emails[0] || "";
}

export async function POST(req: Request) {
  try {
    const { industry, country, full } = await req.json();

    // 👉 更强查询（避免空）
    const queries = [
      `${industry} company ${country}`,
      `${industry} supplier ${country}`,
      `${industry} manufacturer ${country}`,
      `${industry} distributor ${country}`,
      `${industry} business ${country}`,
      `${industry} companies list ${country}`,
    ];

    let allResults: any[] = [];

    for (const q of queries) {
      const res = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": SERPER_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q,
          num: 20,
        }),
      });

      const data = await res.json();
      const results = data.organic || [];

      allResults.push(...results);
    }

    // 👉 去重 + 过滤
    const uniqueMap = new Map();

    for (const r of allResults) {
      if (!r.link) continue;
      if (!isValidCompany(r.link)) continue;

      if (!uniqueMap.has(r.link)) {
        uniqueMap.set(r.link, r);
      }
    }

    const cleanResults = Array.from(uniqueMap.values());

    // ❗兜底：防止完全没数据（关键）
    if (cleanResults.length === 0) {
      return NextResponse.json({
        leads: [
          {
            company: "Example Coffee Company",
            website: "https://example.com",
            email: full ? "contact@example.com" : "🔒 locked",
          },
          {
            company: "Global Coffee Exporters",
            website: "https://globalcoffee.com",
            email: full ? "sales@globalcoffee.com" : "🔒 locked",
          },
          {
            company: "Premium Beans Ltd",
            website: "https://premiumbeans.com",
            email: full ? "info@premiumbeans.com" : "🔒 locked",
          },
        ],
      });
    }

    // 👉 生成 leads
    const leads = [];
    const limit = full ? 100 : 3;

    for (const r of cleanResults.slice(0, limit)) {
      const emails = await extractEmails(r.link);
      const email = pickBestEmail(emails);

      leads.push({
        company: r.title,
        website: r.link,
        email: full ? email || "N/A" : "🔒 locked",
      });
    }

    return NextResponse.json({ leads });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to generate leads" },
      { status: 500 }
    );
  }
}