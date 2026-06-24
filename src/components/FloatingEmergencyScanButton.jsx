"use client"

import Link from "next/link"
import { ScanFace, Scan } from "lucide-react"
import { motion } from "framer-motion"

export function FloatingEmergencyScanButton() {
  return (
    <Link href="/emergency-scan">
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-28 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-teal-600 text-white shadow-xl shadow-teal-600/30 ring-4 ring-white focus:outline-none focus:ring-teal-400"
      >
        <Scan className="h-7 w-7 pointer-events-none" />
        <span className="absolute -top-2 -left-2 flex items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold ring-2 ring-white pointer-events-none px-2 py-0.5">
          SCAN
        </span>
      </motion.button>
    </Link>
  )
}
