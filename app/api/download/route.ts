import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const industry = searchParams.get("industry");
  const country = searchParams.get("country");

  if (!industry || !country) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  // 🔥 调用你的生成API（关键）
  const res = await fetch("http://localhost:3000/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      industry,
      country,
      full: true,
    }),
  });

  const data = await res.json();
  console.log("DOWNLOAD DATA:", data);
  const leads = data.full || [];

  // 👉 转CSV
  const rows = [
    ["Company", "Website", "Email"],
    ...leads.map((l: any) => [l.Company, l.Website, l.Email]),
  ];

  const csv = rows.map((r) => r.join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=leads.csv",
    },
  });
}