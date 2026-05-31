"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardRedirect() {
  const router = useRouter();
  const { role, token, authLoaded } = useAuth();

  useEffect(() => {
    if (authLoaded) {
      if (token && role) {
        router.replace(`/${role}/dashboard`);
      } else {
        router.replace("/login?role=patient");
      }
    }
  }, [authLoaded, token, role, router]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-600 font-medium">Redirecting to your dashboard...</p>
    </div>
  );
}
