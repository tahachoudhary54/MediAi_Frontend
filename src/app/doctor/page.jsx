"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DoctorRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/doctor/dashboard");
  }, [router]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-600 font-medium">Redirecting to Doctor Dashboard...</p>
    </div>
  );
}
