import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// Use service role for webhook — no user session available
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    if (!metadata?.user_id) {
      console.error("No user_id in session metadata");
      return NextResponse.json({ received: true });
    }

    const userId = metadata.user_id;
    const portfolioId = metadata.portfolio_id;
    const giftAid = metadata.gift_aid === "true";

    // Update portfolio with payment confirmation
    if (portfolioId) {
      const { error } = await supabase
        .from("portfolios")
        .update({
          stripe_subscription_id: session.subscription as string,
          stripe_customer_id: session.customer as string,
          payment_status: "active",
          gift_aid: giftAid,
        })
        .eq("id", portfolioId)
        .eq("user_id", userId);

      if (error) {
        console.error("Error updating portfolio:", error);
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;

    // Mark portfolio as cancelled
    const { error } = await supabase
      .from("portfolios")
      .update({ payment_status: "cancelled", is_active: false })
      .eq("stripe_subscription_id", subscription.id);

    if (error) {
      console.error("Error cancelling portfolio:", error);
    }
  }

  return NextResponse.json({ received: true });
}
