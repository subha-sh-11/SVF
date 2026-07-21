"use client";

import "@/rep/rep.css";
import dynamic from "next/dynamic";

// The rep app is a client-only SPA (react-router). Load it without SSR.
const RepRoot = dynamic(() => import("@/rep/RepRoot"), { ssr: false });

export default function RepCatchAll() {
  return <RepRoot />;
}
