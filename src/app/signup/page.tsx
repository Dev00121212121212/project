
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

// This page now acts as a redirector to the main login page, which handles both login and signup.
export default function SignupRedirect() {
  const router = useRouter();

  useEffect(() => {
    // We redirect to /login and can optionally use a query param to default to the sign-up view
    router.replace('/login?action=signup');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
            <p className="text-muted-foreground">Redirecting...</p>
        </div>
    </div>
  );
}
