import PaymentButton from "@/components/PaymentButton";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function BillPage({
  params,
}: {
  params: { billId: string };
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: bill } = await supabase
    .from("bills")
    .select("id, amount, status, patient_id")
    .eq("id", params.billId)
    .single();

  if (!bill)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-amber-700 text-lg font-semibold">
              Bill not found
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    );

  const statusColor =
    bill.status === "PENDING"
      ? "bg-amber-100 text-amber-800 border-amber-300"
      : "bg-green-100 text-green-800 border-green-300";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 px-4">
      <Card className="w-full max-w-md shadow-xl border border-amber-200 rounded-2xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-bold text-amber-800">
            Bill Details
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 text-gray-800">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600">Bill ID:</span>
            <span>{bill.id}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold text-gray-600">Amount:</span>
            <span className="text-xl font-bold text-amber-700">
              ₹{bill.amount}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-600">Status:</span>
            <Badge className={`${statusColor} px-3 py-1 rounded-full`}>
              {bill.status}
            </Badge>
          </div>

          <div className="pt-4 border-t border-amber-100">
            {bill.status === "PENDING" ? (
              <div className="flex justify-center">
                <PaymentButton billId={bill.id} amount={bill.amount} />
              </div>
            ) : (
              <p className="text-center text-green-700 font-medium">
                ✅ Payment Completed
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
