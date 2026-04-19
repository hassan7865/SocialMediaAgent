"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Mail, Lock, User, Eye, EyeOff, Sparkles, Zap, BarChart3 } from "lucide-react";
import { useState } from "react";

import { useCreateAuth } from "@/hooks/useAuth";
import { RegisterInput, registerSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateAuth();
  const form = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (values: RegisterInput) => {
    await mutateAsync(values);
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-surface-container-lowest text-foreground">
      <main className="relative flex flex-grow items-center justify-center overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
        {/* Enhanced background effects */}
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-gradient-to-r from-primary/10 to-primary-container/5 blur-[120px] animate-pulse" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full bg-gradient-to-r from-secondary/10 to-secondary-container/5 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[30%] w-[30%] rounded-full bg-gradient-to-r from-tertiary/5 to-tertiary-container/5 blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 grid w-full max-w-5xl grid-cols-1 items-center gap-8 md:gap-12 md:grid-cols-2">
          <div className="hidden pr-12 md:block">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/15 to-primary-container/10 px-3 py-1.5 backdrop-blur-sm border border-primary/20">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">New Era of Curation</span>
            </div>
            <h1 className="mb-6 text-4xl leading-tight font-black tracking-tighter text-foreground">
              Your Personal <br />
              <span className="bg-gradient-to-r from-primary via-primary-container to-secondary bg-clip-text text-transparent">Social Newsroom.</span>
            </h1>
            <p className="mb-8 max-w-md text-lg leading-relaxed text-muted-foreground">
              Join the workspace where artificial intelligence meets editorial excellence. Manage your authority across all platforms from a single, high-end interface.
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-primary/20 to-primary-container/15 backdrop-blur-sm border border-primary/30 text-primary shadow-md shadow-primary/15 group-hover:scale-105 transition-all duration-300">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground mb-0.5">AI-Powered Drafting</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">Intelligent suggestions for your brand voice.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-secondary/20 to-secondary-container/15 backdrop-blur-sm border border-secondary/30 text-secondary shadow-md shadow-secondary/15 group-hover:scale-105 transition-all duration-300">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground mb-0.5">Precision Analytics</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">Deep insights without the spreadsheet clutter.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-md">
            <Card className="rounded-xl border-none bg-gradient-to-br from-surface-container-lowest/95 to-surface-container-low/90 backdrop-blur-xl shadow-[0px_20px_40px_rgba(21,28,39,0.06)] ring-1 ring-white/10 transition-all duration-300 hover:shadow-[0px_25px_50px_rgba(21,28,39,0.08)]">
              <CardContent className="p-6 sm:p-8">
                <div className="mb-6">
                  <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">Create your account</h2>
                  <p className="text-sm text-muted-foreground">Start your 14-day free trial. No credit card required.</p>
                </div>

                <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="ml-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Full Name
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="register-name"
                        className="h-auto min-h-10 rounded-lg border-0 bg-surface-container-low/80 pl-10 pr-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:bg-surface-container-low focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                        placeholder="Alex Rivers"
                        {...form.register("full_name")}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="ml-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Email Address
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="register-email"
                        type="email"
                        className="h-auto min-h-10 rounded-lg border-0 bg-surface-container-low/80 pl-10 pr-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:bg-surface-container-low focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                        placeholder="alex@workspace.com"
                        {...form.register("email")}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="ml-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Password
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        className="h-auto min-h-10 rounded-lg border-0 bg-surface-container-low/80 pl-10 pr-10 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:bg-surface-container-low focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                        placeholder="••••••••"
                        {...form.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="h-auto w-full gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-container bg-clip-padding py-2.5 text-sm font-bold tracking-tight shadow-lg shadow-primary/25 hover:shadow-primary/30 hover:scale-[1.01] transition-all duration-300 disabled:hover:scale-100 group"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Get Started
                          <span className="text-base transition-transform group-hover:translate-x-0.5">→</span>
                        </>
                      )}
                    </span>
                  </Button>

                  <div className="pt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Already have an account?
                      <Link href="/login" className="ml-2 font-bold text-primary underline-offset-4 transition-all hover:underline hover:text-primary-container">
                        Log in
                      </Link>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-outline-variant/20 bg-gradient-to-r from-surface-container-lowest/80 to-surface-container-low/60 backdrop-blur-sm py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:px-6 lg:flex-row lg:px-8">
          <div className="text-lg font-bold text-on-surface">SocialAgent</div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/privacy-policy" className="text-xs font-medium uppercase tracking-widest text-on-surface-variant opacity-70 transition-all hover:text-primary hover:opacity-100">Privacy</Link>
            <Link href="/terms-of-service" className="text-xs font-medium uppercase tracking-widest text-on-surface-variant opacity-70 transition-all hover:text-primary hover:opacity-100">Terms</Link>
            <Link href="/help-center" className="text-xs font-medium uppercase tracking-widest text-on-surface-variant opacity-70 transition-all hover:text-primary hover:opacity-100">Help</Link>
            <Link href="/contact" className="text-xs font-medium uppercase tracking-widest text-on-surface-variant opacity-70 transition-all hover:text-primary hover:opacity-100">Contact</Link>
          </div>
          <div className="text-xs font-medium uppercase tracking-widest text-on-surface-variant opacity-70">© 2026 SocialAgent</div>
        </div>
      </footer>
    </div>
  );
}
