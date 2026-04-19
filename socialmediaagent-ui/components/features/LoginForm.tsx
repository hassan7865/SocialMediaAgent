"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { useUpdateAuth } from "@/hooks/useAuth";
import { LoginInput, loginSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const { mutateAsync, isPending } = useUpdateAuth();
  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (values: LoginInput) => {
    await mutateAsync(values);
    router.push("/posts");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-surface-container-lowest text-foreground">
      <main className="relative flex flex-grow items-center justify-center overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
        {/* Enhanced background effects */}
        <div className="absolute top-[-10%] right-[-5%] h-[60%] w-[40%] rounded-full bg-gradient-to-r from-primary/10 to-primary-container/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] h-[50%] w-[30%] rounded-full bg-gradient-to-r from-secondary/10 to-secondary-container/5 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[30%] w-[30%] rounded-full bg-gradient-to-r from-tertiary/5 to-tertiary-container/5 blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="z-10 w-full max-w-[420px]">
          {/* Clean header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black tracking-tighter text-foreground">
              SocialAgent
            </h1>
            <p className="mt-2 text-sm font-medium tracking-tight text-muted-foreground">
              The Editorial Workspace
            </p>
          </div>

          <Card className="rounded-xl border-none bg-gradient-to-br from-surface-container-lowest/95 to-surface-container-low/90 backdrop-blur-xl shadow-[0px_20px_40px_rgba(21,28,39,0.06)] ring-1 ring-white/10 transition-all duration-300 hover:shadow-[0px_25px_50px_rgba(21,28,39,0.08)]">
            <CardContent className="p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
                <p className="mt-1 text-sm text-muted-foreground">Please enter your details to sign in.</p>
              </div>

              <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="px-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="name@company.com"
                      className="h-auto min-h-10 rounded-lg border-0 bg-surface-container-low/80 pl-10 pr-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:bg-surface-container-low focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                      {...form.register("email")}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <Label htmlFor="login-password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Password
                    </Label>
                    <Link href="#" className="text-xs font-bold uppercase tracking-widest text-primary transition-all hover:text-primary-container">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-auto min-h-10 rounded-lg border-0 bg-surface-container-low/80 pl-10 pr-10 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:bg-surface-container-low focus:ring-2 focus:ring-primary/20 transition-all duration-300"
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
                <div className="pt-3">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="h-auto w-full rounded-lg bg-gradient-to-r from-primary to-primary-container bg-clip-padding py-2.5 text-sm font-bold tracking-tight shadow-lg shadow-primary/25 hover:shadow-primary/30 hover:scale-[1.01] transition-all duration-300 disabled:hover:scale-100"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        <>
                          Log In
                          <span className="text-base transition-transform group-hover:translate-x-0.5">→</span>
                        </>
                      )}
                    </span>
                  </Button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {"Don't have an account? "}
                  <Link href="/register" className="font-bold text-primary underline-offset-4 transition-all hover:underline hover:text-primary-container">
                    Sign Up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-10 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 opacity-60 hover:opacity-80 transition-opacity">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest">Secure</span>
            </div>
            <div className="flex items-center gap-2 opacity-60 hover:opacity-80 transition-opacity">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" style={{ animationDelay: '0.5s' }} />
              <span className="text-xs font-bold uppercase tracking-widest">Cloud</span>
            </div>
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
