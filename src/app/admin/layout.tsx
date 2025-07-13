
'use client';

import { Sidebar, SidebarProvider, SidebarInset, SidebarTrigger, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, useSidebar } from "@/components/ui/sidebar";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Home, Brush, Shapes, ShoppingCart, PlusSquare, Settings, Users } from "lucide-react";
import Link from 'next/link';
import { LogoutButton } from "@/components/logout-button";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function AdminNavMenu() {
    const { setOpenMobile } = useSidebar();
    
    const handleLinkClick = () => {
        setOpenMobile(false);
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Dashboard">
                <Link href="/admin" onClick={handleLinkClick}>
                  <Home />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Paintings">
                    <Link href="/admin/paintings" onClick={handleLinkClick}>
                        <Brush />
                        <span>Paintings</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Artists">
                    <Link href="/admin/artists" onClick={handleLinkClick}>
                        <Users />
                        <span>Artists</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Categories">
                    <Link href="/admin/categories" onClick={handleLinkClick}>
                        <Shapes />
                        <span>Categories</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Orders">
                    <Link href="/admin/orders" onClick={handleLinkClick}>
                        <ShoppingCart />
                        <span>Orders</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Submit Artwork">
                    <Link href="/submit" onClick={handleLinkClick}>
                        <PlusSquare />
                        <span>Submit Artwork</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Site Settings">
                    <Link href="/admin/settings" onClick={handleLinkClick}>
                        <Settings />
                        <span>Site Settings</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

const MobileAdminHeader = (
  <SheetHeader className="p-2 border-b">
    <SheetTitle className="sr-only">Admin Menu</SheetTitle>
  </SheetHeader>
);


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const auth = getAuth(app);
  
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // If we're on the login page, we don't need to check for auth.
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/admin/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, router, isLoginPage, pathname]);

  if (loading) {
     return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        </div>
    );
  }

  // If on login page, render children directly without the layout wrapper
  if (isLoginPage) {
    return <>{children}</>;
  }

  // After loading, if there's no user and we're not on the login page,
  // we are in the process of redirecting, so don't render anything.
  if (!user) {
    return null; 
  }

  return (
    <SidebarProvider>
      <Sidebar mobileHeader={MobileAdminHeader}>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <h1 className="text-xl font-semibold">Admin Panel</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
           <AdminNavMenu />
        </SidebarContent>
        <SidebarFooter>
            <LogoutButton redirectTo="/admin/login"/>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="p-4 border-b flex items-center gap-4">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold">Dashboard</h2>
        </header>
        <main className="p-4">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
