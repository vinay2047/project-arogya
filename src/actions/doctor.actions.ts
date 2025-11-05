"use server";

import { createClient } from "@/supabase/server";
import axios from "axios";

export default async function verifyDoctorAction(formData: FormData) {
  const hprId = formData.get("hprId")?.toString().trim();
  const aadhaar = formData.get("aadhaar")?.toString().trim() || null;
  const licenseNumber = formData.get("licenseNumber")?.toString().trim() || null;
  const specialization = formData.get("specialization")?.toString().trim() || null;
  const experienceYears = Number(formData.get("experienceYears")) || 0;
  const hospitalId = formData.get("hospitalId")?.toString().trim() || null;

  // 🏷️ Tags now come as a JSON array from the frontend
  let tags: string[] = [];
  try {
    const tagsRaw = formData.get("tags")?.toString() || "[]";
    tags = JSON.parse(tagsRaw);
    if (!Array.isArray(tags)) tags = [];
  } catch {
    tags = [];
  }

  // 📍 Location data from frontend
  const latitude = Number(formData.get("latitude")) || null;
  const longitude = Number(formData.get("longitude")) || null;

  if (!hprId) {
    return { verified: false, error: "HPR ID is required." };
  }

  try {
    // 🔑 Obtain ABDM API token
    const tokenRes = await axios.post(
      "https://live.abdm.gov.in/gateway/v0.5/sessions",
      {
        clientId: process.env.ABDM_CLIENT_ID,
        clientSecret: process.env.ABDM_CLIENT_SECRET,
        grantType: "client_credentials",
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const accessToken = tokenRes.data?.accessToken;
    if (!accessToken) throw new Error("Failed to obtain ABDM token");

    // ✅ Simulated HPR ID verification request (replace with actual endpoint/params)
    const verifyRes = await axios.post(
      "https://hprid.abdm.gov.in/api/v2/registration/aadhaar/checkHpIdAccountExist",
      {
        txnId: "dummy-txn-id",
        preverifiedCheck: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const verifyData = verifyRes.data;
    const verified = verifyData?.hprIdNumber?.includes(hprId);

    // 🧾 If verified, save to Supabase
    if (verified) {
      const supabase = await createClient();
      const { data: sessionData, error: sessionError } = await supabase.auth.getUser();

      if (sessionError || !sessionData.user) {
        return { verified: false, error: "No active user session." };
      }

      const userId = sessionData.user.id;

      const { error: insertError } = await supabase.from("doctor_profiles").insert([
        {
          user_id: userId,
          hpr_id: hprId,
          license_number: licenseNumber,
          specialization,
          experience_years: experienceYears,
          hospital_id: hospitalId,
          tags,
          verified_via_abdm: true,
          verified_at: new Date().toISOString(),
          latitude,
          longitude,
        },
      ]);

      if (insertError) {
        console.error("DB insert error:", insertError);
        return { verified: false, error: "Failed to save doctor profile." };
      }

      return {
        verified: true,
        hprId,
        message: "✅ Doctor verified and profile created successfully!",
      };
    } else {
      return {
        verified: false,
        message: "❌ No matching record found for this HPR ID.",
      };
    }
  } catch (error: any) {
    console.error("ABDM verification error:", error?.response?.data || error);
    return {
      verified: false,
      error:
        error?.response?.data?.message ||
        "An error occurred during verification. Please try again.",
    };
  }
}
