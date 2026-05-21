import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Activity, Shield, Clock } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">MediAI</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900">How it Works</Link>
            <Link href="/testimonials" className="text-sm font-medium text-slate-600 hover:text-slate-900">Testimonials</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/auth/role-selection">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden pt-24 pb-32">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />
          <div className="container mx-auto px-4 sm:px-8 text-center">
            <Badge className="mb-6 bg-teal-50 text-teal-700 hover:bg-teal-50 border-teal-200">Introducing MediAI 2.0</Badge>
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl">
              The Future of Healthcare, <br />
              <span className="text-teal-600">Powered by AI.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              A premium, intelligent healthcare ecosystem connecting patients and doctors. Experience real-time AI diagnosis, seamless report verification, and smart medicine reminders.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/auth/role-selection">
                <Button size="lg" className="gap-2">
                  Start Your Journey <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg">
                  Learn more
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Everything you need in one platform</h2>
              <p className="mt-4 text-lg text-slate-600">Built for patients, doctors, and administrators.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="h-12 w-12 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                  <Activity className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">AI Symptom Checker</h3>
                <p className="text-slate-600">Get instant, reliable guidance based on your symptoms before you even step into a clinic.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="h-12 w-12 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Verified Doctors</h3>
                <p className="text-slate-600">Every doctor on our platform goes through a rigorous verification process to ensure quality care.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="h-12 w-12 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                  <Clock className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Smart Reminders</h3>
                <p className="text-slate-600">Never miss a dose with intelligent OCR prescription reading and automated reminders.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
        <div className="container mx-auto px-4 sm:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-600">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-bold text-white">MediAI</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm flex-wrap justify-center">
              <Link href="#features" className="hover:text-teal-400 transition-colors">Features</Link>
              <Link href="/testimonials" className="hover:text-teal-400 transition-colors">Testimonials</Link>
              <Link href="/auth/login" className="hover:text-teal-400 transition-colors">Patient Portal</Link>
              <Link href="/auth/login" className="hover:text-teal-400 transition-colors">Doctor Portal</Link>
              <span className="hover:text-teal-400 transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-teal-400 transition-colors cursor-pointer">Terms</span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
                <span className="text-xs text-slate-500">All systems operational</span>
              </div>
              <span className="text-slate-700">|</span>
              <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} MediAI</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}


function Badge({ children, className }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${className}`}>
      {children}
    </span>
  )
}
