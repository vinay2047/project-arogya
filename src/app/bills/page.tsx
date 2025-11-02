import Link from "next/link";
import { createClient } from "../../supabase/server";

export default async function BillsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">
          Please log in to view your bills
        </h1>
      </div>
    );
  }

  const { data: bills, error } = await supabase
    .from("bills")
    .select("id, amount, status")
    .eq("patient_id", user.id);

  if (error) {
    console.error("Error fetching bills:", error.message);
  }

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
                <p>Status: {bill.status}</p>
              </div>
              <Link
                href={`/bills/${bill.id}`}
                className="text-blue-600 hover:underline"
              >
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
