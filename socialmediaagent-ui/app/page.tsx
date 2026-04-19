import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <div className="text-2xl font-black tracking-tighter text-primary">SocialAgent</div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-primary px-4">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="px-6 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-40 overflow-hidden bg-background">
          <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-7 z-10">
              <h1 className="text-6xl md:text-7xl lg:text-[4.5rem] leading-none font-black tracking-tight text-foreground mb-8">
                Your Personal <br />
                <span className="bg-gradient-to-r from-primary to-[#7c3aed] bg-clip-text text-transparent">
                  Social Newsroom.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed">
                Transform the chaos of social media into a curated stream of brand authority. High-end automation meets editorial excellence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="px-8 py-4 bg-gradient-to-br from-primary to-[#7c3aed] text-primary-foreground rounded-lg font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                    Start Curating
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" className="px-8 py-4 bg-white border-2 border-primary text-primary rounded-lg font-bold text-lg hover:bg-primary hover:text-white transition-all">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:col-span-5 relative">
              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl z-0">
                <img 
                  className="w-full h-full object-cover" 
                  alt="high-end modern workspace" 
                  src="https://landingi.com/wp-content/uploads/2024/11/social_media_benefits-1-1.webp"
                />
              </div>
              {/* Overlapping Glass Card */}
              <div className="absolute -bottom-10 -left-20 hidden lg:block w-72 p-6 bg-white/80 backdrop-blur-xl rounded-xl shadow-2xl border border-border/20 z-20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[0.6875rem] font-bold text-muted-foreground uppercase tracking-widest">Active Agent</div>
                    <div className="text-sm font-bold">Drafting Viral Thread</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-2/3"></div>
                  </div>
                  <div className="flex justify-between text-[0.6875rem] font-medium text-muted-foreground">
                    <span>Optimization</span>
                    <span>88%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative Background Element */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10"></div>
        </section>

        {/* Section 2: The Art of Automation */}
        <section className="py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
              <div className="space-y-12">
                <h2 className="text-5xl font-black tracking-tighter leading-none text-foreground">
                  The Art of <br />
                  <span className="text-primary">Automation.</span>
                </h2>
                <div className="space-y-16">
                  <div className="group">
                    <div className="text-xs font-bold tracking-[0.2em] text-muted-foreground mb-4 uppercase">Feature 01</div>
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">AI-Powered Drafting</h3>
                    <p className="text-muted-foreground leading-relaxed max-w-md">
                      Our agent doesn&apos;t just write; it composes. Trained on the world&apos;s most engaging editorial styles to mirror your unique brand voice.
                    </p>
                  </div>
                  <div className="group">
                    <div className="text-xs font-bold tracking-[0.2em] text-muted-foreground mb-4 uppercase">Feature 02</div>
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">Multi-Platform Cohesion</h3>
                    <p className="text-muted-foreground leading-relaxed max-w-md">
                      Maintain a singular aesthetic from LinkedIn to X. Unified narratives across every touchpoint without the repetitive fatigue.
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative grid grid-cols-2 gap-4 pt-12">
                <div className="space-y-4">
                  <Card className="aspect-square shadow-sm">
                    <img className="w-full h-full object-contain rounded-xl" alt="AI-powered social media" src="/ai.png" />
                  </Card>
                  <Card className="aspect-[3/4] shadow-lg">
                    <img className="w-full h-full object-contain rounded-xl" alt="Analytics" src="/analytics.png" />
                  </Card>
                </div>
                <div className="space-y-4 pt-12">
                  <Card className="aspect-[3/4] shadow-lg">
                    <img className="w-full h-full object-contain rounded-xl" alt="Multiple social media platforms" src="/multiple.png" />
                  </Card>
                  <Card className="aspect-square shadow-lg">
                    <img className="w-full h-full object-contain rounded-xl" alt="Planning" src="/planning.png" />
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Feature Highlight (3-column) */}
        <section className="py-32 bg-background">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-24">
              <h2 className="text-4xl font-bold tracking-tight mb-4">Draft, Schedule, Engage.</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">The complete editorial workflow, reimagined for the digital age.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Column 1 */}
              <div className="bg-card p-10 rounded-2xl hover:bg-muted/50 transition-all duration-300">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-8">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75a2.25 2.25 0 01-1.364 2.313l-2.5 2.5a2.25 2.25 0 01-3.182 0l-2.5-2.5A2.25 2.25 0 0112.75 18V14" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold mb-4">Strategic Drafting</h4>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  Generate context-aware content that aligns with current trends while staying rooted in your core brand pillars.
                </p>
              </div>
              {/* Column 2 */}
              <div className="bg-card p-10 rounded-2xl hover:bg-muted/50 transition-all duration-300">
                <div className="w-16 h-16 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-8">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold mb-4">Precision Scheduling</h4>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  Hit peak engagement windows automatically. Our algorithm learns when your audience is most receptive to authority.
                </p>
              </div>
              {/* Column 3 */}
              <div className="bg-card p-10 rounded-2xl hover:bg-muted/50 transition-all duration-300">
                <div className="w-16 h-16 rounded-xl bg-accent/30 flex items-center justify-center text-[#9f0044] mb-8">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold mb-4">Proactive Engagement</h4>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  Identify and engage with key industry voices. Transform passive broadcasting into meaningful digital community.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-8">
            <div className="relative bg-foreground text-background rounded-[2rem] p-12 md:p-20 overflow-hidden text-center">
              {/* Background Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-primary/30 to-transparent -z-0"></div>
              <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">Start your editorial <br />journey today.</h2>
                <p className="text-lg opacity-80 max-w-xl mx-auto mb-12">Join 2,500+ digital curators building authority through precision AI automation.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link href="/register">
                    <Button size="lg" className="px-10 py-5 bg-primary text-primary-foreground rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-2xl shadow-primary/40">
                      Get Early Access
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" className="px-10 py-5 bg-white border-2 border-primary text-primary rounded-full font-bold text-xl hover:bg-primary hover:text-white transition-all">
                      Request Demo
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 py-12 px-8">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-6">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="text-lg font-bold text-foreground">SocialAgent</div>
            <p className="text-sm text-muted-foreground text-center md:text-left">© 2024 SocialAgent AI. Editorial excellence in automation.</p>
          </div>
          <div className="flex gap-8">
            <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-all text-sm opacity-80 hover:opacity-100">Privacy Policy</Link>
            <Link href="/terms-of-service" className="text-muted-foreground hover:text-primary transition-all text-sm opacity-80 hover:opacity-100">Terms of Service</Link>
            <Link href="/contact" className="text-muted-foreground hover:text-primary transition-all text-sm opacity-80 hover:opacity-100">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}