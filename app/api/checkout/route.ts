import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
apiVersion: "2025-02-24.acacia",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      monthly_amount,
      portfolio_id,
      gift_aid,
      charities,
    } = body;

    // Validate
    if (!monthly_amount || monthly_amount < 2) {
      return NextResponse.json(
        { error: "Monthly amount must be at least £2" },
        { status: 400 }
      );
    }

    // Get authenticated user
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // Server Component context
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: "", ...options });
            } catch (error) {
              // Ignore
            }
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Build a description of the portfolio for the checkout
    const charityNames =
      charities?.map((c: any) => c.name).join(", ") || "Kind Curve Portfolio";
    const giftAidLabel = gift_aid ? " (+ 25% Gift Aid)" : "";

    // Create Stripe Checkout Session for a recurring subscription
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: Math.round(monthly_amount * 100), // pence
            recurring: {
              interval: "month",
            },
            product_data: {
              name: "Kind Curve Monthly Giving",
              description: `£${monthly_amount}/month to: ${charityNames}${giftAidLabel}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        portfolio_id: portfolio_id || "",
        monthly_amount: String(monthly_amount),
        gift_aid: String(gift_aid || false),
      },
      success_url: `${req.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/commit`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe session error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
