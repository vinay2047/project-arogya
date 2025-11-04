"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 px-6">
      <Navbar />
      
      <div className="flex flex-col items-center justify-center text-center px-6 pt-32 space-y-6">
        <h2 className="text-5xl font-semibold text-orange-900 tracking-tight">
          Welcome to Arogya
        </h2>
        
        <p className="text-lg text-orange-700 max-w-xl leading-relaxed">
          Smarter healthcare at your fingertips — find nearby doctors, book appointments,
          and manage your health with ease.
        </p>

        <a
          href="/auth/signup"
          className="mt-4 px-8 py-3 rounded-full bg-orange-600 text-white text-lg font-medium shadow-md
            hover:bg-orange-700 hover:shadow-lg transition"
        >
          Get Started
        </a>
      </div>
    </div>
  );
}
