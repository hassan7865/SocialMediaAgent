"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

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

  const onSubmit = async (values: LoginInput) => {
    await mutateAsync(values);
    router.push("/posts");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="relative flex flex-grow items-center justify-center overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
        <div className="absolute top-[-10%] right-[-5%] h-[60%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] h-[50%] w-[30%] rounded-full bg-secondary/5 blur-[100px]" />

        <div className="z-10 w-full max-w-[440px]">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-black tracking-tighter text-primary">SocialAgent</h1>
            <p className="mt-2 text-sm font-medium tracking-tight text-muted-foreground">The Editorial Workspace</p>
          </div>

          <Card className="rounded-[12px] border-none bg-[var(--surface-container-lowest)] shadow-[0px_20px_40px_rgba(21,28,39,0.04)] ring-0">
            <CardContent className="p-6 sm:p-8 md:p-10">
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
                <p className="mt-1 text-sm text-muted-foreground">Please enter your details to sign in.</p>
              </div>

              <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="px-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="name@company.com"
                    className="h-auto min-h-11 rounded-[8px] border-0 bg-[var(--surface-container-low)] px-4 py-3 placeholder:text-[var(--outline)]"
                    {...form.register("email")}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <Label htmlFor="login-password" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      Password
                    </Label>
                    <Link href="#" className="text-[11px] font-bold uppercase tracking-widest text-primary transition-colors hover:text-primary-container">
                      Forgot?
                    </Link>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className="h-auto min-h-11 rounded-[8px] border-0 bg-[var(--surface-container-low)] px-4 py-3 placeholder:text-[var(--outline)]"
                    {...form.register("password")}
                  />
                </div>
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="h-auto w-full rounded-[8px] bg-gradient-to-br from-primary to-primary-container py-3.5 text-sm font-bold tracking-tight shadow-lg shadow-primary/20"
                  >
                    {isPending ? "Logging in..." : "Log In"}
                  </Button>
                </div>
              </form>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                {"Don't have an account? "}
                <Link href="/register" className="font-bold text-primary underline-offset-4 transition-all hover:underline">
                  Sign Up
                </Link>
              </p>
            </CardContent>
          </Card>

          <div className="mt-12 flex items-center justify-center gap-8">
            <div className="flex items-center gap-2 opacity-40">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Secure Encryption</span>
            </div>
            <div className="flex items-center gap-2 opacity-40">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Cloud Workspace</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-outline-variant/10 bg-surface-container-lowest py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:px-6 lg:flex-row lg:px-8">
          <div className="text-lg font-bold text-on-surface">SocialAgent</div>
          <div className="mb-6 flex flex-wrap justify-center gap-8 md:mb-0">
            <Link href="#" className="text-xs font-medium uppercase tracking-widest text-on-surface-variant opacity-80 transition-opacity hover:text-primary hover:opacity-100">Privacy Policy</Link>
            <Link href="#" className="text-xs font-medium uppercase tracking-widest text-on-surface-variant opacity-80 transition-opacity hover:text-primary hover:opacity-100">Terms of Service</Link>
            <Link href="#" className="text-xs font-medium uppercase tracking-widest text-on-surface-variant opacity-80 transition-opacity hover:text-primary hover:opacity-100">Help Center</Link>
            <Link href="#" className="text-xs font-medium uppercase tracking-widest text-on-surface-variant opacity-80 transition-opacity hover:text-primary hover:opacity-100">Contact</Link>
          </div>
          <div className="text-xs font-medium uppercase tracking-widest text-on-surface-variant">© 2024 SocialAgent. The Editorial Workspace.</div>
        </div>
      </footer>
    </div>
  );
}
