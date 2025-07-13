
"use client";

import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { SidebarMenuButton } from "./ui/sidebar";
import { LogOut } from "lucide-react";

type LogoutButtonProps = {
    redirectTo?: string;
}

export function LogoutButton({ redirectTo = "/admin/login" }: LogoutButtonProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push(redirectTo);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Could not log you out. Please try again.",
      });
    }
  };

  return (
    <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
        <LogOut />
        <span>Logout</span>
    </SidebarMenuButton>
  );
}
