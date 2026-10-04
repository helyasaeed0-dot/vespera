// @ts-nocheck
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-02-24.acacia" as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing webhook signature or secret" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("Stripe Webhook Signature Error:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    try {
      await db.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { stripeIntentId: paymentIntent.id },
          include: { items: true },
        });

        if (order && order.paymentStatus !== "PAID") {
          // 1. Update Payment & Order status
          await tx.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: "PAID",
              status: "PROCESSING",
            },
          });

          // 2. Safely deduct inventory stock
          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            });
          }
        }
      });
    } catch (dbError) {
      console.error("Error updating order upon Stripe webhook payment:", dbError);
      return NextResponse.json({ error: "Database transaction failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
