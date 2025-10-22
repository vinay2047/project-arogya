import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export default async function BillsPage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const { data: bills } = await supabase.from("bills").select("id, amount, status");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Your Bills</h1>
      {bills?.length ? (
        <ul className="space-y-2">
          {bills.map((bill) => (
            <li
              key={bill.id}
              className="p-4 border rounded-md flex justify-between items-center hover:bg-gray-50"
            >
              <div>
                <p>Bill ID: {bill.id}</p>
                <p>Amount: ₹{bill.amount}</p>
              </div>
              <Link href={`/bills/${bill.id}`} className="text-blue-600 hover:underline">
                View
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No bills found.</p>
      )}
    </div>
  );
}
