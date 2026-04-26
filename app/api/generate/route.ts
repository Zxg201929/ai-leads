import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { industry, country, full } = body;

    if (!industry || !country) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    // 🔥 扩展关键词（保证数量）
    const queries = [
      `${industry} companies in ${country}`,
      `${industry} manufacturers ${country}`,
      `${industry} suppliers ${country}`,
      `${industry} exporters ${country}`,
      `${industry} wholesalers ${country}`,
      `${industry} distributors ${country}`,
      `${industry} importers ${country}`,
      `${industry} brands ${country}`,
    ];

    let allResults: any[] = [];

    // 🔥 SERPER搜索
    for (const q of queries) {
      for (let page = 0; page < 5; page++) {
        const res = await fetch("https://google.serper.dev/search", {
          method: "POST",
          headers: {
            "X-API-KEY": process.env.SERPER_API_KEY!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            q,
            num: 10,
            start: page * 10,
          }),
        });

        if (!res.ok) {
          console.log("SERPER ERROR:", res.status);
          continue;
        }

        const data = await res.json();
        const results = data.organic || [];
        allResults.push(...results);
      }
    }

    console.log("ALL RESULTS:", allResults.length);

    // 🔥 URL清洗
    let results = allResults.map((r: any) => {
      try {
        const url = new URL(r.link);
        return {
          ...r,
          link: url.origin + url.pathname,
        };
      } catch {
        return r;
      }
    });

    // 🔥 去重（按URL）
    results = Array.from(
      new Map(results.map((r: any) => [r.link.toLowerCase(), r])).values()
    );

    console.log("AFTER DEDUPE:", results.length);

    // 🔥 轻过滤（避免删太多）
    results = results.filter((r: any) => {
      const link = r.link?.toLowerCase() || "";

      return (
        r.link &&
        r.link.startsWith("http") &&
        !link.includes("wikipedia") &&
        !link.includes("statista")
      );
    });

    console.log("AFTER FILTER:", results.length);

    const leads: any[] = [];

    // =====================
    // 🔥 免费预览（快）
    // =====================
    if (!full) {
      for (const r of results.slice(0, 5)) {
        leads.push({
          Company: cleanText(r.title),
          Website: r.link,
          Email: "Preview locked",
        });
      }
    }

    // =====================
    // 🔥 付费版本（核心）
    // =====================
    else {
      for (const r of results.slice(0, 120)) {
        let email = "N/A";
        let type = "general";

        // 🔥 多路径抓邮箱（命中率关键）
        const pages = [
          r.link,
          r.link + "/contact",
          r.link + "/contact-us",
          r.link + "/about",
          r.link + "/about-us",
          r.link + "/company",
        ];

        for (const url of pages) {
          try {
            const res = await fetch(url, {
              headers: { "User-Agent": "Mozilla/5.0" },
            });

            const html = await res.text();

            const match = html.match(
              /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
            );

            if (match) {
              const found = match[0];

              // ❌ 过滤垃圾邮箱
              if (
                found.includes("example") ||
                found.includes("test") ||
                found.includes("email.com")
              ) {
                continue;
              }

              // 🔥 优先级逻辑
              if (found.includes("sales")) {
                email = found;
                type = "sales";
                break;
              }

              if (found.includes("contact")) {
                email = found;
                type = "contact";
              }

              if (found.includes("info")) {
                email = found;
                type = "info";
              }

              // fallback
              if (email === "N/A") {
                email = found;
              }
            }
          } catch {}
        }

        leads.push({
          Company: cleanText(r.title),
          Website: r.link,
          Email: email,
          Type: type,
        });
      }
    }

    console.log("LEADS BEFORE DEDUPE:", leads.length);

    // 🔥 最终去重（按网站）
    const uniqueMap = new Map();
    for (const l of leads) {
      const key = l.Website.toLowerCase();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, l);
      }
    }

    const finalLeads = Array.from(uniqueMap.values());

    console.log("FINAL LEADS:", finalLeads.length);

    return NextResponse.json({
      preview: finalLeads.slice(0, 3),
      full: finalLeads,
    });

  } catch (error) {
    console.error("ERROR:", error);
    return NextResponse.json(
      { error: "Failed to generate leads" },
      { status: 500 }
    );
  }
}

// 🔥 清洗乱码
function cleanText(text: string) {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[^\x00-\x7F]/g, "");
}