"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

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

  const onSubmit = async (values: RegisterInput) => {
    await mutateAsync(values);
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="relative flex flex-grow items-center justify-center overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full bg-secondary/5 blur-[120px]" />

        <div className="relative z-10 grid w-full max-w-5xl grid-cols-1 items-center gap-8 md:gap-12 md:grid-cols-2">
          <div className="hidden pr-12 md:block">
            <div className="mb-6 inline-block rounded-full bg-primary/10 px-3 py-1">
              <span className="text-[0.6875rem] font-bold uppercase tracking-widest text-primary">New Era of Curation</span>
            </div>
            <h1 className="mb-6 text-5xl leading-tight font-black tracking-tighter text-foreground">
              Your Personal <br />
              <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">Social Newsroom.</span>
            </h1>
            <p className="mb-8 max-w-md text-lg leading-relaxed text-muted-foreground">
              Join the workspace where artificial intelligence meets editorial excellence. Manage your authority across all platforms from a single, high-end interface.
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-container-highest)] text-primary">
                  <span className="text-sm">AI</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">AI-Powered Drafting</p>
                  <p className="text-xs text-muted-foreground">Intelligent suggestions for your brand voice.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-container-highest)] text-secondary">
                  <span className="text-sm">AN</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Precision Analytics</p>
                  <p className="text-xs text-muted-foreground">Deep insights without the spreadsheet clutter.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full">
            <Card className="rounded-[12px] border-[color:var(--border)]/10 bg-[var(--surface-container-lowest)] shadow-[0px_20px_40px_rgba(21,28,39,0.04)] ring-0">
              <CardContent className="p-8 md:p-10">
                <div className="mb-8">
                  <h2 className="mb-2 text-2xl font-extrabold tracking-tight text-foreground">Create your account</h2>
                  <p className="text-sm text-muted-foreground">Start your 14-day free trial. No credit card required.</p>
                </div>

                <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="ml-1 text-[0.75rem] font-bold uppercase tracking-widest text-muted-foreground">
                      Full Name
                    </Label>
                    <Input
                      id="register-name"
                      className="h-auto min-h-11 rounded-lg border-0 bg-surface-container-low py-3 placeholder:text-outline"
                      placeholder="Alex Rivers"
                      {...form.register("full_name")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="ml-1 text-[0.75rem] font-bold uppercase tracking-widest text-muted-foreground">
                      Email Address
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      className="h-auto min-h-11 rounded-lg border-0 bg-surface-container-low py-3 placeholder:text-outline"
                      placeholder="alex@workspace.com"
                      {...form.register("email")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="ml-1 text-[0.75rem] font-bold uppercase tracking-widest text-muted-foreground">
                      Password
                    </Label>
                    <Input
                      id="register-password"
                      type="password"
                      className="h-auto min-h-11 rounded-lg border-0 bg-surface-container-low py-3 placeholder:text-outline"
                      placeholder="••••••••"
                      {...form.register("password")}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="h-auto w-full gap-2 rounded-[8px] bg-gradient-to-br from-primary to-primary-container py-3.5 text-sm font-bold tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/30"
                  >
                    {isPending ? "Creating..." : "Get Started"}
                    <span aria-hidden className="text-[18px]">→</span>
                  </Button>

                  <div className="pt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Already have an account?
                      <Link href="/login" className="ml-1 font-bold text-primary underline-offset-4 hover:underline">Log in</Link>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-outline-variant/10 bg-surface-container-lowest py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:px-6 lg:flex-row lg:px-8">
          <div className="text-lg font-bold text-on-surface">SocialAgent</div>
          <div className="flex flex-wrap justify-center gap-8">
            <Link href="#" className="text-xs font-medium uppercase tracking-widest text-on-surface-variant transition-opacity hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="text-xs font-medium uppercase tracking-widest text-on-surface-variant transition-opacity hover:text-primary">Terms of Service</Link>
            <Link href="#" className="text-xs font-medium uppercase tracking-widest text-on-surface-variant transition-opacity hover:text-primary">Help Center</Link>
            <Link href="#" className="text-xs font-medium uppercase tracking-widest text-on-surface-variant transition-opacity hover:text-primary">Contact</Link>
          </div>
          <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant">© 2024 SocialAgent. The Editorial Workspace.</p>
        </div>
      </footer>
    </div>
  );
}
