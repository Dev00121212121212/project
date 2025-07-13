
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { app, database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import type { SiteSettings } from "@/lib/types";


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  const auth = getAuth(app);
  
  useEffect(() => {
    const settingsRef = ref(database, 'siteSettings');
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSiteSettings(snapshot.val());
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: "Passwords do not match.",
      });
      return;
    }
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Handle Sign Up
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: "Signup Successful",
          description: "Your account has been created. Please log in.",
        });
        setIsSignUp(false); // Switch to login view after successful signup
        setPassword("");
        setConfirmPassword("");

      } else {
        // Handle Login
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        router.push("/");
      }
    } catch (error: any) {
      let description = "An unknown error occurred.";
       if (isSignUp) {
        if (error.code === 'auth/email-already-in-use') {
          description = "This email is already in use.";
        } else if (error.code === 'auth/weak-password') {
          description = "Password should be at least 6 characters.";
        }
      } else {
         if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          description = "Invalid email or password.";
        }
      }
      toast({
        variant: "destructive",
        title: isSignUp ? "Signup Failed" : "Login Failed",
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
              <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
                <Image src={siteSettings?.logoUrl || "/logo.png"} alt="Srujanika art logo" width={40} height={40} className="h-10 w-10" />
                <h1 className="text-4xl font-bold font-headline text-primary">
                Srujanika art
                </h1>
            </Link>
            <p className="text-balance text-muted-foreground">
              {isSignUp
                ? "Join our community of art lovers."
                : "Welcome back! Access your account."}
            </p>
          </div>

          <Card className="shadow-lg">
            <form onSubmit={handleAuthAction}>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  {isSignUp ? "Create an Account" : "Login"}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {isSignUp && (
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading
                    ? isSignUp ? "Creating Account..." : "Signing In..."
                    : isSignUp ? "Sign Up" : "Sign In"}
                </Button>
                <div className="text-center text-sm">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto font-semibold underline"
                    onClick={() => setIsSignUp(!isSignUp)}
                  >
                    {isSignUp ? "Log in" : "Sign up"}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
          <Button asChild variant="ghost" className="mt-6 w-full text-muted-foreground">
            <Link href="/">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://placehold.co/1080x1920.png"
          alt="Painting"
          width="1080"
          height="1920"
          data-ai-hint="painting art"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
