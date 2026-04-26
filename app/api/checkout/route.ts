import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { industry, country } = body;

    // 👉 你的域名（本地测试用 localhost，上线后换成你的域名）
    const DOMAIN = "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `B2B Leads: ${industry} in ${country}`,
              description: "100–120 targeted leads with emails",
            },
            unit_amount: 1000, // $10
          },
          quantity: 1,
        },
      ],

      mode: "payment",

      // 🔥 支付成功后跳转（关键）
      success_url: `${DOMAIN}/success?industry=${encodeURIComponent(
        industry
      )}&country=${encodeURIComponent(country)}`,

      cancel_url: `${DOMAIN}`,

      // 👉 可选：记录数据（后面做安全验证用）
      metadata: {
        industry,
        country,
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Checkout session failed" },
      { status: 500 }
    );
  }
}