import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();

  
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, message: "Invalid signature" });
    }

    
    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("bill_id")
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    if (fetchError || !payment) {
      console.error("Payment record not found:", fetchError);
      return NextResponse.json({ success: false, message: "Payment not found" });
    }

    
    const { error: paymentUpdateError } = await supabase
      .from("payments")
      .update({
        status: "SUCCESS",
        razorpay_payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq("razorpay_order_id", razorpay_order_id);

    if (paymentUpdateError) throw paymentUpdateError;

    
    const { error: billUpdateError } = await supabase
      .from("bills")
      .update({ status: "PAID" })
      .eq("id", payment.bill_id);

    if (billUpdateError) throw billUpdateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
