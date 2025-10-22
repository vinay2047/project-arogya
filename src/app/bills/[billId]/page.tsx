import { createClient } from "@supabase/supabase-js";
import PaymentButton from "@/app/components/PaymentButton";

export default async function BillPage({ params }: { params: { billId: string } }) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const { data: bill } = await supabase
    .from("bills")
    .select("id, amount, status, patient_id")
    .eq("id", params.billId)
    .single();

  if (!bill) return <p>Bill not found</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Bill Details</h1>

      <p>Bill ID: {bill.id}</p>
      <p>Amount: ₹{bill.amount}</p>
      <p>Status: {bill.status}</p>

      {bill.status === "PENDING" ? (
        <PaymentButton billId={bill.id} amount={bill.amount} />
      ) : (
        <p className="text-green-600 font-semibold">✅ Paid</p>
      )}
    </div>
  );
}
