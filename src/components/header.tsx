
"use client";

import { Filter, ArrowUpDown, Menu, ChevronDown, LogOut, User as UserIcon, Search } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { useEffect, useState, forwardRef } from "react";
import { usePathname, useRouter } from 'next/navigation'
import { cn } from "@/lib/utils";
import { getAuth, onAuthStateChanged, signOut, type User } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { SiteSettings } from "@/lib/types";
import { Separator } from "./ui/separator";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


type HeaderProps = {
  categories?: string[];
  activeCategory?: string;
  setActiveCategory?: (value: string) => void;
  pathname?: string;
  siteSettings?: SiteSettings | null;
  searchQuery?: string;
  setSearchQuery?: (value: string) => void;
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "#", label: "New Arrivals" },
  { href: "#", label: "Best Sellers" },
  { href: "#", label: "Wall Art" },
];

export function Header({
  categories = [],
  activeCategory,
  setActiveCategory,
  siteSettings,
  searchQuery,
  setSearchQuery,
}: HeaderProps) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const auth = getAuth(app);
  const { toast } = useToast();

  const isHomePage = pathname === '/';
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);


  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleNavLinkClick = (label: string) => {
    if (isHomePage) {
        setActiveCategory?.(label);
        // A short delay to allow state to update before scrolling
        setTimeout(() => {
            const gallerySection = document.getElementById('gallery-section');
            if (gallerySection) {
                const yOffset = -80; // height of the header
                const y = gallerySection.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({top: y, behavior: 'smooth'});
            }
        }, 100);
    } else {
        router.push('/');
    }
    setIsMobileMenuOpen(false);
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Could not log you out. Please try again.",
      });
    }
  };

  const UserMenu = () => {
    if (!user) {
      return (
        <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild size="sm">
                <Link href="/login">Sign Up</Link>
            </Button>
        </div>
      );
    }

    return (
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.photoURL || undefined} alt="User" />
              <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">My Account</p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        hasScrolled
          ? "bg-card/95 shadow-lg backdrop-blur-sm"
          : "bg-background border-b",
    )}>
      <div className={cn(
          "container mx-auto px-4 transition-all duration-300 ease-in-out",
          hasScrolled ? "h-16" : "h-20",
      )}>
        <div className="flex h-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group" onClick={() => handleNavLinkClick('Home')}>
              <Image 
                  src={siteSettings?.logoUrl || "/logo.png"}
                  alt="Srujanika art logo"
                  width={32}
                  height={32}
                  className={cn(
                  "h-8 w-8 transition-transform duration-300 group-hover:rotate-[-15deg]",
              )} />
              <h1 className={cn(
                  "text-2xl font-bold tracking-wider text-primary",
              )}>
                Srujanika art
              </h1>
            </Link>
          </div>
          
           <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
                {navLinks.map((link) => (
                    <NavigationMenuItem key={link.label}>
                        <NavigationMenuLink 
                            asChild
                            active={isHomePage && activeCategory === link.label}
                        >
                            <Button 
                                variant="ghost"
                                onClick={() => handleNavLinkClick(link.label)} 
                                className={cn(
                                    "text-sm font-medium transition-colors text-muted-foreground hover:text-primary",
                                isHomePage && activeCategory === link.label && "text-primary bg-primary/10"
                                )}>
                                {link.label}
                            </Button>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                ))}
                 <NavigationMenuItem>
                    <NavigationMenuTrigger
                        className={cn(
                            navigationMenuTriggerStyle(),
                            "text-sm bg-transparent font-medium transition-colors text-muted-foreground hover:text-primary",
                            isHomePage && categories.includes(activeCategory || '') && "text-primary bg-primary/10"
                        )}
                    >
                        Categories
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                       <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                        <li className="row-span-3">
                            <NavigationMenuLink asChild>
                            <a
                                className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                                href="/"
                            >
                                <div className="mb-2 mt-4 text-lg font-medium">
                                All Categories
                                </div>
                                <p className="text-sm leading-tight text-muted-foreground">
                                Browse our diverse collection of art styles.
                                </p>
                            </a>
                            </NavigationMenuLink>
                        </li>
                        {categories.map((category) => (
                           <ListItem key={category} title={category} onClick={() => handleNavLinkClick(category)} />
                        ))}
                        </ul>
                    </NavigationMenuContent>
                 </NavigationMenuItem>
            </NavigationMenuList>
           </NavigationMenu>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <UserMenu />
            </div>

            <div className="md:hidden">
             <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                 <SheetHeader>
                    <SheetTitle className="sr-only">Menu</SheetTitle>
                 </SheetHeader>
                 <Link href="/" className="flex items-center gap-2 mb-6" onClick={() => handleNavLinkClick('Home')}>
                  <Image src={siteSettings?.logoUrl || "/logo.png"} alt="Srujanika art logo" width={32} height={32} className="h-8 w-8" />
                  <h1 className="text-2xl font-bold tracking-wider text-primary">Srujanika art</h1>
                </Link>
                <Separator />
                <nav className="flex flex-col gap-1 py-4">
                  {navLinks.map((link) => (
                    <Button 
                        key={link.label} 
                        variant="ghost"
                        onClick={() => handleNavLinkClick(link.label)} 
                        className={cn(
                            "text-base justify-start font-medium text-muted-foreground transition-colors hover:text-primary",
                            isHomePage && activeCategory === link.label && "text-primary bg-primary/10"
                        )}>
                        {link.label}
                    </Button>
                  ))}
                   <p className="text-sm justify-start font-semibold text-muted-foreground px-4 pt-4 pb-2">Categories</p>
                   {categories.map((category) => (
                     <Button 
                        key={category} 
                        variant="ghost"
                        onClick={() => handleNavLinkClick(category)} 
                        className={cn(
                            "text-base justify-start font-medium text-muted-foreground transition-colors hover:text-primary",
                            isHomePage && activeCategory === category && "text-primary bg-primary/10"
                        )}>
                        {category}
                    </Button>
                   ))}
                </nav>
                <Separator />
                 <div className="mt-auto pt-6">
                  {user ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 px-2">
                          <Avatar>
                            <AvatarImage src={user.photoURL || undefined} alt="User" />
                            <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium leading-none">My Account</span>
                            <span className="text-xs leading-none text-muted-foreground truncate max-w-[150px]">{user.email}</span>
                          </div>
                      </div>
                      <Button onClick={handleLogout} variant="ghost" className="w-full justify-start">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                       <Button asChild className="w-full justify-center">
                        <Link href="/login">Login</Link>
                      </Button>
                       <Button asChild variant="outline" className="w-full justify-center">
                        <Link href="/login">Sign Up</Link>
                      </Button>
                    </div>
                  )}
                 </div>
              </SheetContent>
            </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

const ListItem = forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          {children && <div className="mt-2">{children}</div>}
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

    
