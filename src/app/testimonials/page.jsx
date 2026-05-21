"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Activity, Star, Quote, ArrowLeft } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Patient",
    content: "MediAI changed the way I manage my chronic condition. The AI symptom checker is incredibly accurate, and the medicine reminders ensure I never miss a dose. It feels like having a doctor in my pocket.",
    rating: 5,
    initials: "SJ",
    color: "bg-teal-100 text-teal-700"
  },
  {
    name: "Dr. Michael Chen",
    role: "Cardiologist",
    content: "As a healthcare provider, I've seen many platforms, but MediAI stands out for its seamless integration. The report verification system saves me hours of administrative work, allowing me to focus on what matters: my patients.",
    rating: 5,
    initials: "MC",
    color: "bg-slate-100 text-slate-700"
  },
  {
    name: "Emma Williams",
    role: "Patient",
    content: "The interface is so clean and easy to use. I was able to get my prescription verified in minutes. The peace of mind that comes with knowing I'm getting verified care from top-tier doctors is priceless.",
    rating: 5,
    initials: "EW",
    color: "bg-teal-100 text-teal-700"
  },
  {
    name: "Robert Taylor",
    role: "Diabetes Patient",
    content: "The automated reminders and the way it tracks my health trends has been a lifesaver. MediAI isn't just an app; it's a partner in my health journey. Highly recommended for anyone looking for modern healthcare.",
    rating: 4,
    initials: "RT",
    color: "bg-slate-100 text-slate-700"
  }
]

export default function TestimonialsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">MediAI</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/#features" className="text-sm font-medium text-slate-600 hover:text-slate-900">Features</Link>
            <Link href="/#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900">How it Works</Link>
            <Link href="/testimonials" className="text-sm font-medium text-teal-600">Testimonials</Link>
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
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-20 bg-slate-50">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />
          <div className="container mx-auto px-4 sm:px-8 text-center">
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
              Trusted by <span className="text-teal-600">Thousands</span> <br />
              Around the Globe.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Don't just take our word for it. Hear from the patients and healthcare professionals who are transforming their lives with MediAI.
            </p>
          </div>
        </section>

        {/* Testimonials Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.map((t, i) => (
                <Card key={i} className="relative overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-8">
                    <Quote className="absolute top-6 right-8 h-12 w-12 text-slate-100 -z-0" />
                    <div className="relative z-10">
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, starI) => (
                          <Star
                            key={starI}
                            className={`h-4 w-4 ${starI < t.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`}
                          />
                        ))}
                      </div>
                      <p className="text-lg text-slate-700 italic mb-8 leading-relaxed">
                        "{t.content}"
                      </p>
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg ${t.color}`}>
                          {t.initials}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{t.name}</h4>
                          <p className="text-sm text-slate-500">{t.role}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-teal-600 text-white text-center">
          <div className="container mx-auto px-4 sm:px-8">
            <h2 className="text-3xl font-bold mb-6">Ready to experience the future of healthcare?</h2>
            <p className="text-teal-50 mb-10 max-w-xl mx-auto">Join the MediAI community today and take the first step towards a smarter, healthier you.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/role-selection">
                <Button size="lg" className="bg-white text-teal-600 hover:bg-teal-50 w-full sm:w-auto">
                  Get Started Now
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-teal-600 w-full sm:w-auto">
                  Existing User? Log In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="container mx-auto px-4 sm:px-8 text-center text-slate-500">
          <div className="flex items-center justify-center gap-2 mb-4 grayscale opacity-50">
            <Activity className="h-5 w-5" />
            <span className="font-bold">MediAI</span>
          </div>
          <p>&copy; {new Date().getFullYear()} MediAI Ecosystem. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
