"use client";

export default function GoogleLoginButton() {
  return (
    <button
      onClick={() => (window.location.href = "/api/auth/google")}
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      Sign in with Google
    </button>
  );
}
