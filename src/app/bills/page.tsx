import Link from "next/link";
import { createClient } from "../../supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IndianRupee } from "lucide-react";

export default async function BillsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-100 text-center px-4">
        <h1 className="text-3xl font-semibold text-amber-900 mb-4">
          Please log in to view your bills
        </h1>
        <p className="text-amber-700 mb-6">
          You need to be signed in to view your billing details.
        </p>
        <Link
          href="/auth/login"
          className="px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-lg shadow-md hover:from-amber-700 hover:to-orange-600 transition-all duration-300"
        >
          Go to Login
        </Link>
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-100 p-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-xl border border-amber-200/60 rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-semibold text-amber-900">
              Your Bills
            </CardTitle>
            <p className="text-amber-700 text-sm mt-1">
              View and manage your billing information
            </p>
          </CardHeader>

          <CardContent>
            {bills?.length ? (
              <ul className="space-y-4">
                {bills.map((bill) => (
                  <li
                    key={bill.id}
                    className="flex justify-between items-center p-4 rounded-xl border border-amber-100 shadow-sm bg-gradient-to-r from-amber-50 to-orange-50 hover:shadow-md transition-all duration-300"
                  >
                    <div>
                      <p className="font-medium text-amber-900">
                        Bill ID: {bill.id}
                      </p>
                      <p className="flex items-center text-amber-800 mt-1">
                        <IndianRupee className="w-4 h-4 mr-1 text-amber-700" />
                        {bill.amount}
                      </p>
                      <Badge
                        className={`mt-2 ${
                          bill.status === "PAID"
                            ? "bg-green-600 hover:bg-green-700"
                            : bill.status === "OVERDUE"
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-amber-600 hover:bg-amber-700"
                        }`}
                      >
                        {bill.status}
                      </Badge>
                    </div>

                    <Button
                      asChild
                      className="bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white shadow-md"
                    >
                      <Link href={`/bills/${bill.id}`}>View</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-amber-700 py-6">
                <p className="text-lg font-medium">No bills found.</p>
                <p className="text-sm mt-1">
                  Once you have appointments, your bills will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
