import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Activity, Shield, Clock, Check, Users, Sparkles, Heart, UserPlus, ScanText, Bell, Lock } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white selection:bg-teal-500 selection:text-white">
      {/* 1. Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 shadow-md shadow-teal-600/20">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">MediAI</span>
          </div>
          
          <nav className="hidden md:flex gap-8">
            <Link href="#features" className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors">How it Works</Link>
            <Link href="/testimonials" className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors">Testimonials</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="font-semibold text-slate-600 hover:text-slate-900">Log in</Button>
            </Link>
            <Link href="/auth/role-selection">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-600/10 rounded-xl px-5">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Main Section */}
      <main className="flex-1">
        {/* Hero Section */}
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#1C4148] to-[#0D2125] pt-20 pb-24 md:pt-32 md:pb-36">
          <div className="container mx-auto px-4 sm:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column */}
              <div className="max-w-2xl">
                <h1 className="text-5xl md:text-6xl lg:text-[5rem] font-black text-white leading-[1.05] tracking-tight">
                  AI-DRIVEN<br />
                  PERSONAL<br />
                  HEALTH
                </h1>
                <p className="mt-6 text-lg md:text-xl text-slate-300 font-medium max-w-lg leading-relaxed">
                  Your simplified companion for doctor connections and appointments.
                </p>
                
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <Link href="/auth/role-selection">
                    <Button size="lg" className="bg-[#1C6961] hover:bg-[#14504A] text-white font-bold px-8 py-6 rounded-xl border-none transition-all text-base shadow-lg shadow-[#1C6961]/20">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button variant="outline" size="lg" className="bg-[#BCE6C8] hover:bg-[#A3D8B1] text-[#0A1A1C] border-none font-bold px-8 py-6 rounded-xl transition-all text-base shadow-lg shadow-[#BCE6C8]/10">
                      View Features
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Column (Visual) */}
              <div className="relative flex items-center justify-center h-[500px] w-full mt-12 lg:mt-0">
                {/* Concentric Circles */}
                <div className="absolute w-[280px] h-[280px] rounded-full border border-[#BCE6C8]/20" />
                <div className="absolute w-[400px] h-[400px] rounded-full border border-[#BCE6C8]/15" />
                <div className="absolute w-[520px] h-[520px] rounded-full border border-[#BCE6C8]/10 hidden sm:block" />

                {/* Central Glow */}
                <div className="absolute w-[220px] h-[220px] rounded-full bg-[#BCE6C8]/30 blur-[50px]" />

                {/* Central White Circle */}
                <div className="relative z-10 w-48 h-48 bg-white rounded-full flex flex-col items-center justify-center shadow-[0_0_50px_rgba(188,230,200,0.4)] border-4 border-white">
                  <div className="flex items-center gap-2 mb-2 relative">
                    <div className="text-[#84C9A2] scale-125 transform -translate-x-1 opacity-70">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v.01"/><path d="M8 12v.01"/><path d="M12 12v.01"/></svg>
                    </div>
                    <div className="bg-[#1C6961] text-white font-black text-2xl rounded-2xl px-4 py-3 shadow-md z-10 relative tracking-wider">
                      AI
                    </div>
                    <div className="text-[#84C9A2] scale-125 transform translate-x-1 opacity-70">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12v.01"/><path d="M16 12v.01"/><path d="M20 12v.01"/></svg>
                    </div>
                  </div>
                  <span className="text-slate-900 font-bold text-[15px] mt-2">AI Assistant</span>
                </div>

                {/* Floating Cards */}
                <div className="absolute z-20 top-4 left-0 sm:left-[5%] md:left-0 lg:left-[-5%] bg-white rounded-3xl shadow-xl p-4 w-32 flex flex-col items-center gap-3 transition-transform hover:-translate-y-1">
                  <div className="w-14 h-14 bg-[#E8F5ED] rounded-2xl flex items-center justify-center text-[#1C6961]">
                    <UserPlus size={28} strokeWidth={2} />
                  </div>
                  <span className="text-[13px] font-bold text-slate-800 text-center">Doctor Sync</span>
                </div>

                <div className="absolute z-20 top-4 right-0 sm:right-[5%] md:right-0 lg:right-[-5%] bg-white rounded-3xl shadow-xl p-4 w-32 flex flex-col items-center gap-3 transition-transform hover:-translate-y-1">
                  <div className="w-14 h-14 bg-[#E8F5ED] rounded-2xl flex items-center justify-center text-[#1C6961]">
                    <ScanText size={28} strokeWidth={2} />
                  </div>
                  <span className="text-[13px] font-bold text-slate-800 text-center">OCR</span>
                </div>

                <div className="absolute z-20 bottom-4 left-0 sm:left-[5%] md:left-0 lg:left-[-5%] bg-white rounded-3xl shadow-xl p-4 w-32 flex flex-col items-center gap-3 transition-transform hover:translate-y-1">
                  <div className="w-14 h-14 bg-[#E8F5ED] rounded-2xl flex items-center justify-center text-[#1C6961]">
                    <Bell size={28} strokeWidth={2} />
                  </div>
                  <span className="text-[13px] font-bold text-slate-800 text-center leading-tight">Smart<br/>Reminders</span>
                </div>

                <div className="absolute z-20 bottom-4 right-0 sm:right-[5%] md:right-0 lg:right-[-5%] bg-white rounded-3xl shadow-xl p-4 w-32 flex flex-col items-center gap-3 transition-transform hover:translate-y-1">
                  <div className="w-14 h-14 bg-[#E8F5ED] rounded-2xl flex items-center justify-center text-[#1C6961]">
                    <div className="relative">
                      <Lock size={28} strokeWidth={2} />
                      <Heart size={14} strokeWidth={3} className="absolute -bottom-1 -right-2 text-[#1C6961] fill-white" />
                    </div>
                  </div>
                  <span className="text-[13px] font-bold text-slate-800 text-center leading-tight">Secure Medical<br/>Profile</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom decorative star/sparkle */}
          <div className="absolute bottom-8 right-8 text-slate-500/30">
            <Sparkles size={40} />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-slate-50 relative overflow-hidden border-t border-b border-slate-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#ccfbf1/15_0%,transparent_50%)] pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-50 text-teal-600 mb-3 shadow-sm border border-teal-100/50">
                <Sparkles size={16} />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Everything you need in one platform</h2>
              <p className="mt-3 text-lg text-slate-500 font-medium">Built for patients, doctors, and administrators.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Feature 1 */}
              <div className="group relative bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-slate-200/60 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300" />
                <div className="h-12 w-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-teal-500/20 text-white">
                  <Activity className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-700 transition-colors">AI Symptom Checker</h3>
                <p className="text-slate-600 leading-relaxed text-sm font-medium">Get instant, reliable guidance based on your symptoms before you even step into a clinic.</p>
              </div>

              {/* Feature 2 */}
              <div className="group relative bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-slate-200/60 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300" />
                <div className="h-12 w-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-teal-500/20 text-white">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-700 transition-colors">Verified Doctors</h3>
                <p className="text-slate-600 leading-relaxed text-sm font-medium">Every doctor on our platform goes through a rigorous verification process to ensure quality care.</p>
              </div>

              {/* Feature 3 */}
              <div className="group relative bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-slate-200/60 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300" />
                <div className="h-12 w-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-teal-500/20 text-white">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-700 transition-colors">Smart Reminders</h3>
                <p className="text-slate-600 leading-relaxed text-sm font-medium">Never miss a dose with intelligent OCR prescription reading and automated reminders.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-8">
            <div className="text-center mb-20">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-50 text-teal-600 mb-3 shadow-sm border border-teal-100/50">
                <Heart size={16} className="text-teal-600" />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">How MediAI Works</h2>
              <p className="mt-3 text-lg text-slate-500 font-medium max-w-2xl mx-auto">Getting certified medical guidance and reports is fast and secure.</p>
            </div>
            
            <div className="relative grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              {/* Line connecting steps */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-100 z-0" />
              
              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center text-center bg-white p-6 rounded-2xl hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-teal-500/30 mb-6 border-4 border-white z-10">
                  1
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Check Symptoms</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">Enter your symptoms into our smart AI assistant for an initial check-up.</p>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center text-center bg-white p-6 rounded-2xl hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-teal-500/30 mb-6 border-4 border-white z-10">
                  2
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Doctor Consultation</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">Connect instantly with certified doctors to verify the findings.</p>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center text-center bg-white p-6 rounded-2xl hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-teal-500/30 mb-6 border-4 border-white z-10">
                  3
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Get Verified Report</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">Download your official medical report signed by your physician.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <div className="container mx-auto px-4 sm:px-8 mb-24">
          <section className="py-16 bg-slate-950 text-white relative overflow-hidden rounded-[2.5rem] shadow-2xl shadow-slate-900/20 border border-slate-800/60">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#0d9488/20_0%,transparent_60%)] pointer-events-none" />
            <div className="relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-800/50">
                <div className="flex flex-col items-center justify-center">
                  <p className="text-4xl md:text-5xl font-black text-teal-400">99.4%</p>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-3">AI Accuracy</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <p className="text-4xl md:text-5xl font-black text-teal-400">10k+</p>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-3">Consultations</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <p className="text-4xl md:text-5xl font-black text-teal-400">500+</p>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-3">Verified MDs</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <p className="text-4xl md:text-5xl font-black text-teal-400">24/7</p>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-3">Care Access</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="bg-slate-950 text-slate-400 relative z-10 pt-20 pb-8">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-12">
            
            {/* Brand & Description (spans 2 cols on lg) */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 shadow-md shadow-teal-600/20">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">MediAI</span>
              </div>
              <p className="text-slate-400 leading-relaxed mb-6 max-w-sm">
                Revolutionizing healthcare access with AI-driven diagnostics, seamless doctor consultations, and secure medical record management. Your health, simplified.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-teal-400 hover:border-teal-500/30 transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-teal-400 hover:border-teal-500/30 transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-teal-400 hover:border-teal-500/30 transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
                </a>
              </div>
            </div>

            {/* Links Group 1 */}
            <div>
              <h3 className="text-white font-semibold mb-4 tracking-wide">Platform</h3>
              <ul className="space-y-3">
                <li><Link href="#features" className="hover:text-teal-400 transition-colors">Features</Link></li>
                <li><Link href="#how-it-works" className="hover:text-teal-400 transition-colors">How it Works</Link></li>
                <li><Link href="/testimonials" className="hover:text-teal-400 transition-colors">Testimonials</Link></li>
                <li><Link href="/auth/role-selection" className="hover:text-teal-400 transition-colors">Get Started</Link></li>
              </ul>
            </div>

            {/* Links Group 2 */}
            <div>
              <h3 className="text-white font-semibold mb-4 tracking-wide">Portals</h3>
              <ul className="space-y-3">
                <li><Link href="/auth/login" className="hover:text-teal-400 transition-colors">Patient Login</Link></li>
                <li><Link href="/auth/login" className="hover:text-teal-400 transition-colors">Doctor Portal</Link></li>
                <li><Link href="/auth/register" className="hover:text-teal-400 transition-colors">Create Account</Link></li>
                <li><Link href="/admin/dashboard" className="hover:text-teal-400 transition-colors">Admin Access</Link></li>
              </ul>
            </div>

            {/* Links Group 3 */}
            <div>
              <h3 className="text-white font-semibold mb-4 tracking-wide">Legal</h3>
              <ul className="space-y-3">
                <li><span className="hover:text-teal-400 transition-colors cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-teal-400 transition-colors cursor-pointer">Terms of Service</span></li>
                <li><span className="hover:text-teal-400 transition-colors cursor-pointer">Cookie Policy</span></li>
                <li><span className="hover:text-teal-400 transition-colors cursor-pointer">HIPAA Compliance</span></li>
              </ul>
            </div>
            
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 font-medium text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} MediAI. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                support@mediai.health
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-xs">
                <span className="inline-flex h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
                <span className="text-slate-400 font-semibold">Systems active</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
