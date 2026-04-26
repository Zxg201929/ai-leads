"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const params = useSearchParams();

  const industry = params.get("industry");
  const country = params.get("country");

  useEffect(() => {
    if (!industry || !country) return;

    const link = document.createElement("a");
    link.href = `/api/download?industry=${industry}&country=${country}`;
    link.click();
  }, [industry, country]);

  return (
    <div style={{ padding: 40 }}>
      <h1>✅ Payment Successful</h1>
      <p>Your download will start automatically.</p>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SuccessContent />
    </Suspense>
  );
}