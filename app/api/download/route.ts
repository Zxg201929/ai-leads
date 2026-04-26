import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const industry = searchParams.get("industry");
  const country = searchParams.get("country");

  if (!industry || !country) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  // 👉 模拟真实 leads（后面可以接API）
  const leads = [];

  for (let i = 1; i <= 100; i++) {
    leads.push({
      company: `${industry} Company ${i}`,
      website: `https://company${i}.com`,
      email: `contact${i}@company${i}.com`,
    });
  }

  // 👉 转 CSV
  const csv = [
    "Company,Website,Email",
    ...leads.map(
      (l) => `${l.company},${l.website},${l.email}`
    ),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${industry}-${country}-leads.csv"`,
    },
  });
}