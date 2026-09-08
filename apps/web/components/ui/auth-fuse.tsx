"use client";

import * as React from "react";
import { Suspense, useState, useId, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  apiLogin,
  apiResendCode,
  apiSignup,
  apiVerifyEmail,
  googleAuthUrl,
  saveSession,
} from "@/lib/auth-client";

export interface TypewriterProps {
  text: string | string[];
  speed?: number;
  cursor?: string;
  loop?: boolean;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
}

export function Typewriter({
  text,
  speed = 100,
  cursor = "|",
  loop = false,
  deleteSpeed = 50,
  delay = 1500,
  className,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textArrayIndex, setTextArrayIndex] = useState(0);

  const textArray = Array.isArray(text) ? text : [text];
  const currentText = textArray[textArrayIndex] || "";

  useEffect(() => {
    if (!currentText) return;

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < currentText.length) {
            setDisplayText((prev) => prev + currentText[currentIndex]);
            setCurrentIndex((prev) => prev + 1);
          } else if (loop) {
            setTimeout(() => setIsDeleting(true), delay);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText((prev) => prev.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentIndex(0);
            setTextArrayIndex((prev) => (prev + 1) % textArray.length);
          }
        }
      },
      isDeleting ? deleteSpeed : speed,
    );

    return () => clearTimeout(timeout);
  }, [currentIndex, isDeleting, currentText, loop, speed, deleteSpeed, delay, displayText, text]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">{cursor}</span>
    </span>
  );
}

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input dark:border-input/50 bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary-foreground/60 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-6",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "AuthFuseButton";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input dark:border-input/50 bg-background px-3 py-3 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:bg-accent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "AuthFuseInput";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, ...props }, ref) => {
    const id = useId();
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    return (
      <div className="grid w-full items-center gap-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          <Input id={id} type={showPassword ? "text" : "password"} className={cn("pe-10", className)} ref={ref} {...props} />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
          </button>
        </div>
      </div>
    );
  },
);
PasswordInput.displayName = "AuthFusePasswordInput";

function GoogleButton() {
  return (
    <Button variant="outline" type="button" asChild>
      <a href={googleAuthUrl()}>
        <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.44c-.28 1.48-1.13 2.73-2.4 3.58v2.98h3.88c2.27-2.09 3.57-5.17 3.57-8.8z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.92l-3.88-2.98c-1.08.72-2.45 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.92H1.3v3.08C3.26 21.3 7.31 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.31 14.33c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.69H1.3A11.98 11.98 0 000 12.05c0 1.94.46 3.77 1.3 5.36l4.01-3.08z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.76 0 3.35.61 4.6 1.8l3.45-3.45C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.3 6.69l4.01 3.08c.94-2.82 3.58-4.92 6.69-4.92z"
          />
        </svg>
        Continue with Google
      </a>
    </Button>
  );
}

function SignInForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const session = await apiLogin(String(form.get("email") ?? ""), String(form.get("password") ?? ""));
      saveSession(session);
      toast.success("Welcome back!");
      router.replace(nextPath);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSignIn} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign in to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">Enter your email below to sign in</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
        </div>
        <PasswordInput name="password" label="Password" required autoComplete="current-password" placeholder="Password" />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" variant="outline" className="mt-2" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </div>
    </form>
  );
}

function SignUpForm({ onVerifying }: { onVerifying: (pending: { email: string; password: string }) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    try {
      await apiSignup(email, password);
      toast.success("Account created — check your email for a code.");
      onVerifying({ email, password });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create your account";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSignUp} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-balance text-sm text-muted-foreground">Enter your details below to sign up</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
        </div>
        <PasswordInput name="password" label="Password" required autoComplete="new-password" minLength={8} placeholder="At least 8 characters" />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" variant="outline" className="mt-2" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
      </div>
    </form>
  );
}

function VerifyForm({ email, password, nextPath }: { email: string; password: string; nextPath: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      await apiVerifyEmail(email, String(form.get("code") ?? ""));
      const session = await apiLogin(email, password);
      saveSession(session);
      toast.success("Email verified. Welcome to AzaisAi!");
      router.replace(nextPath);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not verify your email";
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  }

  async function resendCode() {
    setError(null);
    setNotice(null);
    try {
      await apiResendCode(email);
      setNotice("A new verification code was sent.");
      toast.success("A new verification code was sent.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not resend the code";
      setError(message);
      toast.error(message);
    }
  }

  return (
    <form onSubmit={handleVerify} autoComplete="one-time-code" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="text-balance text-sm text-muted-foreground">
          We sent a verification code to <span className="font-medium text-foreground">{email}</span>.
        </p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="code">Verification code</Label>
          <Input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="000000"
            required
            className="text-center tracking-[0.35em]"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
        <Button type="submit" variant="outline" className="mt-2" disabled={loading}>
          {loading ? "Verifying..." : "Verify"}
        </Button>
      </div>
      <Button type="button" variant="link" className="mx-auto text-muted-foreground" onClick={resendCode}>
        Send a new code
      </Button>
    </form>
  );
}

function AuthFormContainer({
  isSignIn,
  onToggle,
  nextPath,
}: {
  isSignIn: boolean;
  onToggle: () => void;
  nextPath: string;
}) {
  const [pending, setPending] = useState<{ email: string; password: string } | null>(null);

  useEffect(() => {
    setPending(null);
  }, [isSignIn]);

  return (
    <div className="mx-auto grid w-[350px] gap-2">
      {pending ? (
        <VerifyForm email={pending.email} password={pending.password} nextPath={nextPath} />
      ) : isSignIn ? (
        <SignInForm nextPath={nextPath} />
      ) : (
        <SignUpForm onVerifying={setPending} />
      )}
      {!pending && (
        <>
          <div className="text-center text-sm">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
            <Button variant="link" className="pl-1 text-foreground" onClick={onToggle}>
              {isSignIn ? "Sign up" : "Sign in"}
            </Button>
          </div>
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
          <GoogleButton />
        </>
      )}
    </div>
  );
}

interface AuthContentProps {
  image?: {
    src: string;
    alt: string;
  };
  quote?: {
    text: string;
    author: string;
  };
}

interface AuthUIProps {
  initialMode?: "signin" | "signup";
  signInContent?: AuthContentProps;
  signUpContent?: AuthContentProps;
}

const defaultSignInContent = {
  image: {
    src: "https://cdn.21st.dev/assets/mirror/39/39e7b0edd6a7156713d08ec970769bf29360427d3dc8523ee32079885ccca5dd.png",
    alt: "A beautiful interior design for sign-in",
  },
  quote: {
    text: "Welcome back! Your next creation is a prompt away.",
    author: "AzaisAi",
  },
};

const defaultSignUpContent = {
  image: {
    src: "https://cdn.21st.dev/assets/mirror/c7/c7cb3a073970aa03472c652391db88fbbe39f1e33c8deb336a9c8e53b039ee01.png",
    alt: "A vibrant, modern space for new beginnings",
  },
  quote: {
    text: "Create an account. A new chapter of creativity awaits.",
    author: "AzaisAi",
  },
};

function AuthUIInner({ initialMode = "signin", signInContent = {}, signUpContent = {} }: AuthUIProps) {
  const [isSignIn, setIsSignIn] = useState(initialMode === "signin");
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/studio/image";
  const toggleForm = () => setIsSignIn((prev) => !prev);

  useEffect(() => {
    if (searchParams.get("error") !== "google_auth_failed") return;
    toast.error("Google sign-in didn't go through", {
      description: "Please try again, or sign in with your email and password instead.",
    });
    const params = new URLSearchParams(searchParams);
    params.delete("error");
    router.replace(params.size ? `/login?${params.toString()}` : "/login");
    // Only ever fires off the URL param present on first paint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finalSignInContent = {
    image: { ...defaultSignInContent.image, ...signInContent.image },
    quote: { ...defaultSignInContent.quote, ...signInContent.quote },
  };
  const finalSignUpContent = {
    image: { ...defaultSignUpContent.image, ...signUpContent.image },
    quote: { ...defaultSignUpContent.quote, ...signUpContent.quote },
  };

  const currentContent = isSignIn ? finalSignInContent : finalSignUpContent;

  return (
    <div className="relative w-full min-h-screen md:grid md:grid-cols-2">
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>
      <Link
        href="/"
        className="absolute left-6 top-6 z-20 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to home
      </Link>
      <div className="flex h-screen items-center justify-center p-6 md:h-auto md:p-0 md:py-12">
        <AuthFormContainer isSignIn={isSignIn} onToggle={toggleForm} nextPath={nextPath} />
      </div>

      <div
        className="hidden md:block relative bg-cover bg-center transition-all duration-500 ease-in-out"
        style={{ backgroundImage: `url(${currentContent.image.src})` }}
        key={currentContent.image.src}
      >
        <div className="absolute inset-x-0 bottom-0 h-[100px] bg-gradient-to-t from-background to-transparent" />

        <div className="relative z-10 flex h-full flex-col items-center justify-end p-2 pb-6">
          <blockquote className="space-y-2 text-center text-foreground">
            <p className="text-lg font-medium">
              &ldquo;
              <Typewriter key={currentContent.quote.text} text={currentContent.quote.text} speed={60} />
              &rdquo;
            </p>
            <cite className="block text-sm font-light text-muted-foreground not-italic">— {currentContent.quote.author}</cite>
          </blockquote>
        </div>
      </div>
    </div>
  );
}

export function AuthUI(props: AuthUIProps) {
  return (
    <Suspense fallback={null}>
      <AuthUIInner {...props} />
    </Suspense>
  );
}
