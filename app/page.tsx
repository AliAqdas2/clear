import Image from "next/image";
import Link from "next/link";
import { 
  Menu, 
  PlayCircle, 
  TrendingUp, 
  Handshake, 
  Clock, 
  Check, 
  BarChart3, 
  Calendar, 
  Eye, 
  BellOff, 
  Lock, 
  Share2, 
  Users, 
  Camera 
} from "lucide-react";

export default function Home() {
  return (
    <>
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-sm border-b border-[#f0f4f2]">
        <div className="px-4 md:px-10 py-3 mx-auto max-w-[1280px]">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 text-text-main">
              <div className="flex items-center justify-center size-12 rounded-lg">
                <Image src="/logo.png" alt="Clear" width={48} height={48} className="rounded-lg" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Clear</h2>
            </div>
            {/* Desktop Nav */}
            <nav className="hidden md:flex flex-1 justify-end items-center gap-8">
              <div className="flex items-center gap-8 mr-4">
                <a className="text-sm font-semibold text-text-main/80 hover:text-primary transition-colors" href="#features">Features</a>
                <a className="text-sm font-semibold text-text-main/80 hover:text-primary transition-colors" href="#about">About</a>
                <Link className="text-sm font-semibold text-text-main/80 hover:text-primary transition-colors" href="/login">Login</Link>
              </div>
              <Link href="/signup" className="flex items-center justify-center rounded-lg h-10 px-5 bg-primary hover:bg-primary-hover text-text-main text-sm font-bold shadow-sm transition-colors">
                <span>Get Started</span>
              </Link>
            </nav>
            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-text-main">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-col">
        {/* Hero Section */}
        <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#19e65e_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.05]"></div>
          <div className="px-4 md:px-10 mx-auto max-w-[1280px]">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <div className="flex flex-col gap-6 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 w-fit">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <span className="text-xs font-bold text-green-800 uppercase tracking-wide">100% Free Forever</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-text-main">
                  Financial Clarity, <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-600">Instantly.</span>
                </h1>
                <p className="text-lg md:text-xl text-text-muted leading-relaxed max-w-lg">
                  Manage your cash flow and social loans with total honesty. No hidden fees. No judgment. Just clear numbers to help you find peace.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                  <Link href="/signup" className="flex items-center justify-center h-12 px-8 rounded-lg bg-primary hover:bg-primary-hover text-text-main text-base font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5">
                    Get Started - It&apos;s Free!
                  </Link>
                  <a href="#features" className="flex items-center justify-center h-12 px-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-text-main text-base font-bold transition-colors">
                    <PlayCircle className="mr-2 w-5 h-5" />
                    See how it works
                  </a>
                </div>
                <div className="flex items-center gap-4 text-sm text-text-muted mt-4">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAvMSkQdXawxyp9pjJHLuOWIzi-zahgQJfWjabcayQN2dfGS8DDo2hU5a3idCvtcv4ai86ibD-eOubmpIKE2WGEeMZLScBlNSTGWkXQMPTWL47acQOxZD4LMGralAACGfelNREL93XM6HbW1nSlrV6WKPwl7zCJeQXN3hajSkwEm0xI9Vz5JqBaHdT2yDBVVUZLLcPy61-t1i8KIDm2QdShrv6fmhPt9hOYsSKn0PoknH1ZRwvErrqUHikd9s4_xlMCYNoZy_98tyO8')", backgroundSize: "cover"}}></div>
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD7b_9Lws8CyIK6Q7bU5Ll7NGHUkh4avrRFqyJm-W8VHaqjvDg2WZP4ZCdLTNbq8Y_zLvL1O9KDI9slPBuhQxDVuYGjRPlSNyAbexuLgJ9OuXUbThlLU1NxdCtxeU83EWSW-g6bDRe-ugtyCD0IBb6Crb8SOYgyUNOMEqo8qyqAjznlK57n8Bouk_nGunbB6O3cLpj6g831sNs0NqHmwVQbzJWOrRr6Iy8bpg8wAn6cf1WdlZ6MoU5DVYmrIR73BjtJ9a2IVsRUDmfk')", backgroundSize: "cover"}}></div>
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCuT_Qjn1vZmlMw8RYIngWQeuCvmnsZuqULZN_fEvqrXnw3wsLCgeqwf6UJW4mmqKQdsACJK_oV2L6PSkmVRgIfd7yV8ntqcSJ0MeLc88oQmU0ZY_x6WrX5hVjkPle5RhVnqo_sfYLjenriyS1OMx7nIS8c9N_rsukOrKAn960Kv2xjCN1fw3TXEioyPFybF39JCnwueXBdDzctmAkx3cheesUlgiXhjWz2NOfe1TaWyJlYSZYrcx8ys9wLTT86_0glGGIt5grXO1pc')", backgroundSize: "cover"}}></div>
                  </div>
                  <p>Joined by 10,000+ users finding clarity.</p>
                </div>
              </div>
              {/* Visual Content / Mockup */}
              <div className="relative w-full h-full min-h-[400px] flex items-center justify-center">
                {/* Abstract decorative blobs */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl -z-10"></div>
                {/* Main Card */}
                <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 overflow-hidden">
                  {/* Header of Card */}
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <p className="text-sm text-text-muted">Total Available Balance</p>
                      <h3 className="text-3xl font-extrabold text-text-main mt-1">$4,250.00</h3>
                    </div>
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  {/* Graph Placeholder */}
                  <div className="relative h-32 w-full mb-8">
                    <div className="absolute bottom-0 left-0 w-full h-full flex items-end justify-between px-2 gap-1">
                      <div className="w-1/6 bg-gray-100 rounded-t h-[40%]"></div>
                      <div className="w-1/6 bg-gray-100 rounded-t h-[60%]"></div>
                      <div className="w-1/6 bg-gray-100 rounded-t h-[30%]"></div>
                      <div className="w-1/6 bg-primary/30 rounded-t h-[50%]"></div>
                      <div className="w-1/6 bg-primary/60 rounded-t h-[75%]"></div>
                      <div className="w-1/6 bg-primary rounded-t h-[90%] shadow-[0_0_15px_rgba(25,230,94,0.5)]"></div>
                    </div>
                  </div>
                  {/* List Items */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          <Handshake className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-main">Loan from Alex</p>
                          <p className="text-xs text-text-muted">Confirmed Today</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-primary">+$150.00</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-main">Upcoming Rent</p>
                          <p className="text-xs text-text-muted">Due in 3 days</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-400">-$1,200.00</span>
                    </div>
                  </div>
                </div>
                {/* Floating Notification */}
                <div className="absolute -bottom-6 -right-6 md:right-0 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3 animate-bounce" style={{animationDuration: "3s"}}>
                  <div className="bg-primary/20 p-2 rounded-full text-primary">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-main">Loan Repaid</p>
                    <p className="text-[10px] text-text-muted">You are all clear!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-background-off" id="features">
          <div className="px-4 md:px-10 mx-auto max-w-[1280px]">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-text-main mb-4">Experience Financial Peace</h2>
              <p className="text-text-muted text-lg">A calm, transparent approach to personal finance with tools designed for clarity, not confusion.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-text-main mb-3">Real-time Clarity</h3>
                <p className="text-text-muted leading-relaxed">Visualize your cash flow timeline instantly. Know exactly where you stand today and where you&apos;ll be tomorrow.</p>
              </div>
              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Handshake className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-text-main mb-3">Social Loans</h3>
                <p className="text-text-muted leading-relaxed">Track loans with friends based on mutual consent. Send requests, confirm receipts, and repay with zero awkwardness.</p>
              </div>
              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-14 h-14 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Calendar className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-text-main mb-3">Time-Awareness</h3>
                <p className="text-text-muted leading-relaxed">Calendar-based financial forecasting. See your future balance based on recurring bills and income dates.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mockup Section (Detailed View) */}
        <section className="py-20 lg:py-28 bg-white overflow-hidden">
          <div className="px-4 md:px-10 mx-auto max-w-[1280px]">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 relative">
                {/* Decorative bg */}
                <div className="absolute -inset-4 bg-gradient-to-r from-gray-100 to-gray-50 rounded-[2rem] -rotate-3 -z-10"></div>
                {/* Image Container */}
                <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-100">
                  <div className="w-full bg-gray-50 aspect-[4/3] relative flex flex-col">
                    {/* Fake Browser Header */}
                    <div className="bg-white border-b border-gray-200 px-4 py-3 flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    {/* Fake UI Content */}
                    <div className="flex-1 bg-white p-6 grid grid-cols-3 gap-6">
                      {/* Sidebar */}
                      <div className="col-span-1 border-r border-gray-100 pr-4 space-y-4 hidden sm:block">
                        <div className="h-8 bg-gray-100 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-50 rounded w-full"></div>
                        <div className="h-4 bg-gray-50 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-50 rounded w-4/6"></div>
                        <div className="mt-8 h-20 bg-primary/10 rounded-lg w-full"></div>
                      </div>
                      {/* Main Content */}
                      <div className="col-span-3 sm:col-span-2 space-y-4">
                        <div className="flex justify-between">
                          <div className="h-8 bg-gray-100 rounded w-1/3"></div>
                          <div className="h-8 bg-primary rounded w-1/4"></div>
                        </div>
                        <div className="grid grid-cols-7 gap-2 mt-4">
                          {/* Calendar days */}
                          <div className="aspect-square bg-gray-50 rounded"></div>
                          <div className="aspect-square bg-gray-50 rounded"></div>
                          <div className="aspect-square bg-gray-50 rounded relative border-2 border-primary/50">
                            <div className="absolute bottom-1 right-1 w-2 h-2 bg-primary rounded-full"></div>
                          </div>
                          <div className="aspect-square bg-gray-50 rounded"></div>
                          <div className="aspect-square bg-gray-50 rounded"></div>
                          <div className="aspect-square bg-gray-50 rounded"></div>
                          <div className="aspect-square bg-gray-50 rounded"></div>
                        </div>
                        <div className="space-y-2 mt-4">
                          <div className="h-12 bg-gray-50 rounded flex items-center px-3 gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                            <div className="h-2 bg-gray-200 w-1/2 rounded"></div>
                          </div>
                          <div className="h-12 bg-gray-50 rounded flex items-center px-3 gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                            <div className="h-2 bg-gray-200 w-1/3 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-primary uppercase bg-primary/10 rounded-full">
                  Transparent Dashboard
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-text-main mb-6">
                  See the full picture. <br/>
                  <span className="text-text-muted">No surprises.</span>
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-primary shadow-sm">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-text-main">Total Visibility</h4>
                      <p className="text-text-muted">Aggregate all your income sources and upcoming expenses in a single, calm view.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-primary shadow-sm">
                      <BellOff className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-text-main">Quiet Alerts</h4>
                      <p className="text-text-muted">Get notified only when it matters. No spam, no upsells, just helpful reminders about due dates.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-primary shadow-sm">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-text-main">Privacy First</h4>
                      <p className="text-text-muted">Your data is yours. We don&apos;t sell it to advertisers. We just help you count it.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-background-off">
          <div className="px-4 md:px-10 mx-auto max-w-[960px]">
            <div className="bg-white rounded-3xl p-8 md:p-16 text-center border border-gray-100 shadow-xl relative overflow-hidden">
              {/* Decorative Circle */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-text-main mb-6 tracking-tight">
                100% Free. <br className="hidden md:block"/>No subscription required.
              </h2>
              <p className="text-lg text-text-muted mb-10 max-w-xl mx-auto">
                Join thousands of users finding clarity in their finances today. Start managing your social loans and cash flow without spending a dime.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
                <Link href="/signup" className="w-full sm:w-auto flex items-center justify-center h-14 px-8 rounded-xl bg-primary hover:bg-primary-hover text-text-main text-lg font-bold shadow-lg transition-transform hover:-translate-y-1">
                  Create Free Account
                </Link>
              </div>
              <p className="mt-4 text-xs text-text-muted">No credit card required. Instant access.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="px-4 md:px-10 mx-auto max-w-[1280px]">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 text-text-main mb-4">
                <div className="flex items-center justify-center size-6 rounded bg-primary/20">
                  <Image src="/logo.png" alt="Clear" width={24} height={24} className="rounded" />
                </div>
                <h2 className="text-lg font-bold">Clear</h2>
              </div>
              <p className="text-sm text-text-muted">Making personal finance transparent, calm, and friendly.</p>
            </div>
            <div>
              <h4 className="font-bold text-text-main mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li><a className="hover:text-primary transition-colors" href="#">Features</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Pricing (It&apos;s Free)</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-text-main mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li><a className="hover:text-primary transition-colors" href="#">About Us</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Contact</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-text-main mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li><a className="hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-100">
            <p className="text-sm text-text-muted mb-4 md:mb-0">© 2023 Clear App. All rights reserved.</p>
            <div className="flex gap-4">
              <a className="text-text-muted hover:text-primary transition-colors" href="#" aria-label="Twitter">
                <Share2 className="w-5 h-5" />
              </a>
              <a className="text-text-muted hover:text-primary transition-colors" href="#" aria-label="LinkedIn">
                <Users className="w-5 h-5" />
              </a>
              <a className="text-text-muted hover:text-primary transition-colors" href="#" aria-label="Instagram">
                <Camera className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
