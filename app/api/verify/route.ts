import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const session_id = searchParams.get("session_id");

  if (!session_id) {
    return Response.json({ paid: false });
  }

  const session = await stripe.checkout.sessions.retrieve(session_id);

  if (session.payment_status === "paid") {
    return Response.json({ paid: true });
  }

  return Response.json({ paid: false });
}