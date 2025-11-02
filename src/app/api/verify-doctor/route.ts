import { NextResponse } from "next/server";


export async function POST(req: Request) {
  try {
    const { aadhaar, hprId } = await req.json();

    if (!aadhaar && !hprId) {
      return NextResponse.json({ error: "Either Aadhaar or HPR ID is required." }, { status: 400 });
    }

    
    const tokenRes = await fetch("https://dev.abdm.gov.in/gateway/v0.5/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: process.env.HPR_CLIENT_ID,
        clientSecret: process.env.HPR_CLIENT_SECRET,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      return NextResponse.json({ error: "Failed to get access token", details: err }, { status: 500 });
    }

    const { accessToken } = await tokenRes.json();

    // STEP 2️⃣ — Verify Doctor using Aadhaar or HPR ID
    let verifyUrl = "";
    let body: any = {};

    if (aadhaar) {
      verifyUrl = "https://hpridsbx.abdm.gov.in/api/v2/registration/aadhaar/checkHpIdAccountExist";
      body = { aadhaar };
    } else if (hprId) {
      // You can later replace this with the HPR details endpoint
      verifyUrl = `https://doctorsbx.abdm.gov.in/apis/v1/doctors/details/${hprId}`;
    }

    const verifyRes = await fetch(verifyUrl, {
      method: aadhaar ? "POST" : "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: aadhaar ? JSON.stringify(body) : undefined,
    });

    const verifyData = await verifyRes.json();

    // STEP 3️⃣ — Interpret response
    if (aadhaar && verifyData.status === true) {
      // Verified via Aadhaar → HPR ID found
      return NextResponse.json({
        verified: true,
        hprId: verifyData.data?.hpId,
        message: verifyData.message,
      });
    }

    if (hprId && verifyRes.ok) {
      // Verified via HPR ID lookup
      return NextResponse.json({
        verified: true,
        hprId,
        data: verifyData,
      });
    }

    // ❌ Verification failed
    return NextResponse.json({
      verified: false,
      error: verifyData.message || "Doctor not found in HPR",
    });

  } catch (err: any) {
    console.error("HPR verification error:", err);
    return NextResponse.json(
      { error: "Server error verifying doctor", details: err.message },
      { status: 500 }
    );
  }
}
