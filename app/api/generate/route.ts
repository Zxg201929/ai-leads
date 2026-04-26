import { NextResponse } from "next/server";
import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;

// 👉 抓邮箱
async function extractEmails(url: string) {
  try {
    const res = await fetch(url);
    const html = await res.text();

    const matches = html.match(
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
    );

    return matches || [];
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  const { industry, country, full } = await req.json();

  // 🔥 用 Google Maps 搜索
  const response = await client.textSearch({
    params: {
      query: `${industry} in ${country}`,
      key: GOOGLE_API_KEY,
    },
  });

  const results = response.data.results;

  const leads = [];

  for (const place of results.slice(0, full ? 50 : 3)) {
    const website = place.website || "";

    let email = "N/A";

    if (website) {
      const emails = await extractEmails(website);
      email = emails[0] || "N/A";
    }

    leads.push({
      company: place.name,
      website: website || "N/A",
      email: full ? email : "🔒 locked",
    });
  }

  return NextResponse.json({ leads });
}