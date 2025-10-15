"use client";

import { useAuth } from "@/components/authProvider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, LogIn, LogOutIcon, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePathname } from 'next/navigation'
// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
];

export function AppSidebar() {
  const { user, isLoading: authLoading, profile, logout, refreshUserData } = useAuth();
  const router = useRouter();
  const pathname = usePathname()
  const [chatData, setChatData] = useState([]);
  
  useEffect(() => {
    const fetchChatData = async () => {
      if(!user) return;
      const response = await fetch("/api/chatbot");
      if(!response.ok){
        console.error("Error fetching chat data");
        setChatData([]);
        return;
      }
      const data = await response.json();
      if(data){
        setChatData(data);
      } else {
        console.error("Error fetching chat data");
        setChatData([]);
      }
    };
    fetchChatData();
  }, [user]);

  return (
    <>
      {pathname !== "/login" && pathname !== "/register" && (
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>
                <h1 className="text-gray-700 text-xl font-bold my-16">
                  Thesa.AI
                </h1>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {chatData && chatData.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel>
                  <h1 className="text-gray-700 text-lg font-medium my-16">
                    Chats
                  </h1>
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {chatData.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton asChild>
                          <a href={`/c/${item.id}`}>
                            <span>{item.name}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>
          <SidebarFooter className="py-6">
            {user ? (
              <>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <User />
                    {profile?.fullName}
                  </a>
                </SidebarMenuButton>
                <SidebarMenuButton asChild>
                  <button onClick={() => {
                    logout();
                    refreshUserData();
                    setChatData([]);
                  }}>
                    <LogOutIcon />
                    Log Out
                  </button>
                </SidebarMenuButton>
              </>
            ) : (
              <SidebarMenuButton asChild>
                <a href="/login">
                  <LogIn />
                  Login
                </a>
              </SidebarMenuButton>
            )}
          </SidebarFooter>
        </Sidebar>
      )}
    </>
  );
}
