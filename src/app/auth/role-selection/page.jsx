import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { User, Stethoscope, ShieldCheck } from "lucide-react"

export default function RoleSelectionPage() {
  const roles = [
    {
      id: "patient",
      title: "I am a Patient",
      description: "Book appointments, check symptoms, and manage your health records.",
      icon: User,
      href: "/auth/register?role=patient",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "hover:border-teal-600",
    },
    {
      id: "doctor",
      title: "I am a Doctor",
      description: "Manage patients, view AI reports, and track your schedule.",
      icon: Stethoscope,
      href: "/auth/register?role=doctor",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "hover:border-indigo-600",
    },
    {
      id: "admin",
      title: "I am an Admin",
      description: "Monitor platform health, verify doctors, and manage users.",
      icon: ShieldCheck,
      href: "/auth/login?role=admin", // Admins usually login directly, not register
      color: "text-slate-600",
      bgColor: "bg-slate-50",
      borderColor: "hover:border-slate-600",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Join MediAI Ecosystem</h1>
          <p className="text-slate-500">Select your role to continue</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Link key={role.id} href={role.href}>
              <Card className={`h-full transition-all duration-200 cursor-pointer border-2 border-transparent bg-white shadow-sm hover:shadow-md ${role.borderColor}`}>
                <CardContent className="p-8 text-center flex flex-col items-center">
                  <div className={`h-16 w-16 rounded-2xl ${role.bgColor} flex items-center justify-center mb-6`}>
                    <role.icon className={`h-8 w-8 ${role.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{role.title}</h3>
                  <p className="text-slate-500 text-sm">{role.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <p className="text-slate-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-teal-600 font-medium hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
