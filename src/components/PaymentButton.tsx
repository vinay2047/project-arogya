"use client";

import Script from "next/script";
import { useState } from "react";

interface PaymentButtonProps {
  billId: string;
  amount: number;
  patientName?: string;
  email?: string;
}

export default function PaymentButton({
  billId,
  amount,
  patientName = "Test User",
  email = "test@example.com",
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const startPayment = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bill_id: billId, amount }),
      });

      const data = await res.json();
      if (!data.order) throw new Error("Failed to create order");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: "INR",
        name: "HealthCare Platform",
        description: "Consultation Payment",
        order_id: data.order.id,
        handler: async function (response: any) {
          // Verify payment
          await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          alert("Payment Successful!");
        },
        prefill: {
          name: patientName,
          email,
        },
        theme: { color: "#2b6cb0" },
      };

      const razor = new (window as any).Razorpay(options);
      razor.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed to start.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button
        onClick={startPayment}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        disabled={loading}
      >
        {loading ? "Processing..." : `Pay ₹${amount}`}
      </button>
    </>
  );
}
