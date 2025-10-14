import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthProvider } from "@/components/authProvider";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Thesa AI",
  description: "Your AI-powered assistant",
};

export default async function RootLayout({ children }) {

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let userProfile = null;
  if (user) {
    const { data: userData, error } = await supabase
      .from("Users")
      .select("*")
      .eq("account_id", user.id)
      .single();

    userProfile = userData;
  }
  const {
    data: { session },
  } = await supabase.auth.getSession();



  return (
    <html lang="en">
      <AuthProvider
        serverUser={user}
        serverProfile={userProfile}
        serverSession={session}
      >
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased `}
        >
          <SidebarProvider>
            <AppSidebar />
            <main className="w-full relative">
              <SidebarTrigger className={"fixed z-100 "} />
              {children}
            </main>
          </SidebarProvider>
        </body>
      </AuthProvider>
    </html>
  );
}
