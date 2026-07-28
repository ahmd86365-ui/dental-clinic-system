"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Lock, LogIn, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, type SignInState } from "@/app/(admin)/login/actions";

const initialState: SignInState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full gap-2">
      <LogIn className="size-4" />
      {pending ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            dir="ltr"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="pr-8"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">كلمة المرور</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type="password"
            dir="ltr"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="pr-8"
          />
        </div>
      </div>

      {state.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
