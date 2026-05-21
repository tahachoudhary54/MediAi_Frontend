"use client"
import GenericAdminPage from "@/components/shared/GenericAdminPage"
import { Megaphone } from "lucide-react"
export default function AdminCMS() {
  return <GenericAdminPage title="Content Management" description="Manage homepage content, health tips, and FAQs." icon={Megaphone} />
}
